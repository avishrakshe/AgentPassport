// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {ReputationLedger} from "../src/ReputationLedger.sol";
import {IReputationLedger} from "../src/interfaces/IReputationLedger.sol";

contract ReputationLedgerTest is Test {
    AgentRegistry public registry;
    ReputationLedger public ledger;

    address public owner = address(0xABCD);
    address public verifier = address(0xBEEF);
    address public agent1 = address(0x1111);
    address public agent2 = address(0x2222);
    address public agent3 = address(0x3333);
    address public unregistered = address(0x9999);

    bytes32 public hash1 = keccak256("interaction-1");
    bytes32 public hash2 = keccak256("interaction-2");

    event RatingSubmitted(address indexed rater, address indexed rated, int8 score);

    function setUp() public {
        vm.startPrank(owner);
        registry = new AgentRegistry(verifier);
        ledger = new ReputationLedger(address(registry));
        vm.stopPrank();

        // Register agent1, agent2, agent3
        vm.prank(agent1);
        registry.register(keccak256("agent-1"), "ipfs://agent1");

        vm.prank(agent2);
        registry.register(keccak256("agent-2"), "ipfs://agent2");

        vm.prank(agent3);
        registry.register(keccak256("agent-3"), "ipfs://agent3");
    }

    function test_ConstructorRevertIfZeroAddress() public {
        vm.expectRevert(ReputationLedger.ZeroAddress.selector);
        new ReputationLedger(address(0));
    }

    function test_SubmitRating_Success() public {
        vm.prank(agent1);
        vm.expectEmit(true, true, false, true);
        emit RatingSubmitted(agent1, agent2, 5);
        ledger.submitRating(agent2, 5, hash1);

        assertEq(ledger.getRatingCount(agent2), 1);
        assertEq(ledger.lastRatingTimestamp(agent1, agent2), block.timestamp);

        IReputationLedger.Rating[] memory ratings = ledger.getRatings(agent2);
        assertEq(ratings.length, 1);
        assertEq(ratings[0].rater, agent1);
        assertEq(ratings[0].rated, agent2);
        assertEq(ratings[0].score, 5);
        assertEq(ratings[0].interactionHash, hash1);
        assertEq(ratings[0].timestamp, block.timestamp);

        // Trust score should be 5e18
        assertEq(ledger.getTrustScore(agent2), 5e18);
        assertEq(ledger.getTrustScoreUint(agent2), 10e18);
    }

    function test_SubmitRating_NegativeScore() public {
        vm.prank(agent1);
        ledger.submitRating(agent2, -4, hash1);

        assertEq(ledger.getTrustScore(agent2), -4e18);
        assertEq(ledger.getTrustScoreUint(agent2), 1e18);
    }

    function test_SubmitRating_RevertIfScoreTooHigh() public {
        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(ReputationLedger.ScoreOutOfBounds.selector, int8(6)));
        ledger.submitRating(agent2, 6, hash1);
    }

    function test_SubmitRating_RevertIfScoreTooLow() public {
        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(ReputationLedger.ScoreOutOfBounds.selector, int8(-6)));
        ledger.submitRating(agent2, -6, hash1);
    }

    function test_SubmitRating_RevertIfSelfRating() public {
        vm.prank(agent1);
        vm.expectRevert(ReputationLedger.SelfRatingNotAllowed.selector);
        ledger.submitRating(agent1, 5, hash1);
    }

    function test_SubmitRating_RevertIfRaterNotRegistered() public {
        vm.prank(unregistered);
        vm.expectRevert(abi.encodeWithSelector(ReputationLedger.RaterNotRegistered.selector, unregistered));
        ledger.submitRating(agent2, 5, hash1);
    }

    function test_SubmitRating_RevertIfRateeNotRegistered() public {
        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(ReputationLedger.RateeNotRegistered.selector, unregistered));
        ledger.submitRating(unregistered, 5, hash1);
    }

    function test_SubmitRating_RateLimitCooldownEnforced() public {
        vm.prank(agent1);
        ledger.submitRating(agent2, 4, hash1);

        // Submitting again immediately should revert
        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(ReputationLedger.RatingCooldownActive.selector, 24 hours));
        ledger.submitRating(agent2, 5, hash2);

        // Submitting after 23 hours should still revert
        vm.warp(block.timestamp + 23 hours);
        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(ReputationLedger.RatingCooldownActive.selector, 1 hours));
        ledger.submitRating(agent2, 5, hash2);

        // Submitting after 24 hours should succeed
        vm.warp(block.timestamp + 1 hours + 1 seconds);
        vm.prank(agent1);
        ledger.submitRating(agent2, 5, hash2);

        assertEq(ledger.getRatingCount(agent2), 2);
    }

    function test_DifferentRatersCanRateWithoutAffectingCooldown() public {
        vm.prank(agent1);
        ledger.submitRating(agent2, 4, hash1);

        // agent3 rating agent2 should succeed immediately
        vm.prank(agent3);
        ledger.submitRating(agent2, 5, hash2);

        assertEq(ledger.getRatingCount(agent2), 2);
    }

    function test_GetTrustScore_EmptyReturnsZero() public view {
        assertEq(ledger.getTrustScore(agent2), 0);
        assertEq(ledger.getTrustScoreUint(agent2), 5e18); // 0 + 5e18
    }

    function test_GetTrustScore_MultipleRatingsAveraged() public {
        vm.prank(agent1);
        ledger.submitRating(agent2, 5, hash1);

        vm.prank(agent3);
        ledger.submitRating(agent2, 3, hash2);

        // Since both submitted at same block.timestamp, weights are equal (1e18)
        // Average should be (5 + 3) / 2 = 4 -> 4e18
        assertEq(ledger.getTrustScore(agent2), 4e18);
    }
}
