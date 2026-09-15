// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {ReputationLedger} from "../src/ReputationLedger.sol";

contract DecayMathFuzzTest is Test {
    AgentRegistry public registry;
    ReputationLedger public ledger;

    address public owner = address(0xABCD);
    address public agentRated = address(0x1000);

    function setUp() public {
        vm.warp(1_000_000_000); // Set baseline timestamp far in future so we can subtract
        vm.prank(owner);
        registry = new AgentRegistry(owner);
        ledger = new ReputationLedger(address(registry));

        vm.prank(agentRated);
        registry.register(keccak256("rated"), "ipfs://rated");
    }

    /// @notice Property: At exactly 14 days, weight is exactly 0.5e18 (half-life)
    function test_ExactHalfLifeDecay() public view {
        uint256 current = block.timestamp;

        uint256 weightAtZero = ledger.calculateWeight(current, current);
        assertEq(weightAtZero, 1e18, "Weight at t=0 should be 1e18");

        uint256 weightAt14Days = ledger.calculateWeight(current - 14 days, current);
        assertEq(weightAt14Days, 0.5e18, "Weight at t=14 days should be 0.5e18");

        uint256 weightAt28Days = ledger.calculateWeight(current - 28 days, current);
        // denominator = 1e18 + 2e18 = 3e18. 1e36 / 3e18 = 1e18 / 3
        assertEq(weightAt28Days, uint256(1e36) / uint256(3e18), "Weight at t=28 days should be 1/3 e18");
    }

    /// @notice Property: Single rating always yields exactly score * 1e18 regardless of time
    function testFuzz_SingleRatingPreservesScore(int8 score, uint32 secondsAgo) public {
        vm.assume(score >= -5 && score <= 5);
        vm.assume(secondsAgo < 365 days);

        address rater = address(0x5555);
        vm.prank(rater);
        registry.register(keccak256(abi.encode(rater)), "ipfs://rater");

        uint256 ratingTime = block.timestamp - secondsAgo;
        vm.warp(ratingTime);

        vm.prank(rater);
        ledger.submitRating(agentRated, score, keccak256("single-test"));

        // Warp back to current time
        vm.warp(ratingTime + secondsAgo);

        int256 trustScore = ledger.getTrustScore(agentRated);
        assertEq(trustScore, int256(score) * 1e18, "Single rating trust score must equal score * 1e18");
    }

    /// @notice Property: Fuzz arbitrary sequences of scores and ages; trust score must ALWAYS stay within [-5e18, 5e18]
    function testFuzz_TrustScoreAlwaysBounded(int8[5] memory scores, uint32[5] memory timeDeltas) public {
        address freshRated = address(0x9990);
        vm.prank(freshRated);
        registry.register(keccak256(abi.encode(freshRated)), "ipfs://fresh");

        uint256 startTime = 100 days;
        vm.warp(startTime);

        for (uint256 i = 0; i < 5; i++) {
            int8 s = scores[i];
            // Bound score between -5 and 5
            if (s < -5) s = -5;
            if (s > 5) s = 5;

            uint256 delta = uint256(timeDeltas[i]) % 10 days;
            vm.warp(block.timestamp + delta + 1 days); // ensure cooldown passes

            address rater = address(uint160(0x2000 + i));
            vm.prank(rater);
            registry.register(keccak256(abi.encode(rater)), "ipfs://rater");

            vm.prank(rater);
            ledger.submitRating(freshRated, s, keccak256(abi.encode(i)));
        }

        int256 finalScore = ledger.getTrustScore(freshRated);
        assertTrue(finalScore >= -5e18, "Score must be >= -5e18");
        assertTrue(finalScore <= 5e18, "Score must be <= 5e18");
    }

    /// @notice Property: More recent ratings weigh more than older ones for the same score value
    function testFuzz_MoreRecentRatingsWeighMore(uint32 olderDays, uint32 recentDays) public view {
        vm.assume(olderDays > recentDays);
        vm.assume(olderDays <= 365);
        vm.assume(recentDays >= 0);

        uint256 currentTime = 500 days;
        uint256 olderTime = currentTime - (uint256(olderDays) * 1 days);
        uint256 recentTime = currentTime - (uint256(recentDays) * 1 days);

        uint256 olderWeight = ledger.calculateWeight(olderTime, currentTime);
        uint256 recentWeight = ledger.calculateWeight(recentTime, currentTime);

        assertTrue(recentWeight > olderWeight, "Recent weight must be strictly greater than older weight");
    }

    /// @notice Property: Dynamic influence of recent ratings over older ratings
    /// Given an older score (+5 at t - 28 days) and a recent score (-5 at t),
    /// the recent negative score pulls the trust score below 0.
    function test_RecentRatingDominatesOlderOpposingRating() public {
        address rater1 = address(0x3001);
        address rater2 = address(0x3002);

        vm.prank(rater1);
        registry.register(keccak256("rater1"), "ipfs://rater1");
        vm.prank(rater2);
        registry.register(keccak256("rater2"), "ipfs://rater2");

        uint256 t0 = 100 days;
        vm.warp(t0);

        // Older positive rating (+5)
        vm.prank(rater1);
        ledger.submitRating(agentRated, 5, keccak256("op1"));

        // Warp 28 days into the future
        vm.warp(t0 + 28 days);

        // Recent negative rating (-5)
        vm.prank(rater2);
        ledger.submitRating(agentRated, -5, keccak256("op2"));

        int256 score = ledger.getTrustScore(agentRated);

        // Weight at t=28 days is 1/3 = 0.333e18. Weight at t=0 is 1.0 = 1e18.
        // Weighted sum: 5 * (1/3) + (-5) * 1 = 1.667 - 5 = -3.333
        // Total weight: 1/3 + 1 = 1.333
        // Result: -3.333 / 1.333 = -2.5e18 < 0
        assertTrue(score < 0, "Trust score must be negative because recent negative rating dominates older positive");
        assertApproxEqAbs(score, -2.5e18, 1e14, "Score should be approximately -2.5e18");
    }
}
