// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {IAgentRegistry} from "../src/interfaces/IAgentRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AgentRegistryTest is Test {
    AgentRegistry public registry;

    address public owner = address(0xABCD);
    address public verifier = address(0xBEEF);
    address public agent1 = address(0x1111);
    address public agent2 = address(0x2222);
    address public outsider = address(0x9999);

    bytes32 public agent1Id = keccak256("agent-1");
    bytes32 public agent2Id = keccak256("agent-2");

    event AgentRegistered(address indexed agent, bytes32 agentId);
    event AgentVerified(address indexed agent);
    event VerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    function setUp() public {
        vm.prank(owner);
        registry = new AgentRegistry(verifier);
    }

    function test_InitialState() public view {
        assertEq(registry.owner(), owner);
        assertEq(registry.verifier(), verifier);
        assertFalse(registry.isRegistered(agent1));
    }

    function test_RegisterAgent_Success() public {
        vm.prank(agent1);
        vm.expectEmit(true, false, false, true);
        emit AgentRegistered(agent1, agent1Id);
        registry.register(agent1Id, "ipfs://bafybeiexample1");

        assertTrue(registry.isRegistered(agent1));

        IAgentRegistry.Agent memory a = registry.getAgent(agent1);
        assertEq(a.wallet, agent1);
        assertEq(a.agentId, agent1Id);
        assertEq(a.metadataURI, "ipfs://bafybeiexample1");
        assertFalse(a.cleanverseVerified);
        assertEq(a.registeredAt, block.timestamp);
    }

    function test_RegisterAgent_RevertIfAlreadyRegistered() public {
        vm.startPrank(agent1);
        registry.register(agent1Id, "ipfs://bafybeiexample1");

        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AlreadyRegistered.selector, agent1));
        registry.register(agent1Id, "ipfs://another-uri");
        vm.stopPrank();
    }

    function test_RegisterAgent_RevertIfEmptyAgentId() public {
        vm.prank(agent1);
        vm.expectRevert(AgentRegistry.EmptyAgentId.selector);
        registry.register(bytes32(0), "ipfs://uri");
    }

    function test_MarkVerified_Success() public {
        vm.prank(agent1);
        registry.register(agent1Id, "ipfs://uri1");

        assertFalse(registry.getAgent(agent1).cleanverseVerified);

        vm.prank(verifier);
        vm.expectEmit(true, false, false, false);
        emit AgentVerified(agent1);
        registry.markVerified(agent1);

        assertTrue(registry.getAgent(agent1).cleanverseVerified);
    }

    function test_MarkVerified_RevertIfNotVerifier() public {
        vm.prank(agent1);
        registry.register(agent1Id, "ipfs://uri1");

        vm.prank(outsider);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotVerifier.selector, outsider));
        registry.markVerified(agent1);
    }

    function test_MarkVerified_RevertIfNotRegistered() public {
        vm.prank(verifier);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotRegistered.selector, agent1));
        registry.markVerified(agent1);
    }

    function test_SetVerifier_Success() public {
        address newVerifier = address(0xCAFE);

        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit VerifierUpdated(verifier, newVerifier);
        registry.setVerifier(newVerifier);

        assertEq(registry.verifier(), newVerifier);
    }

    function test_SetVerifier_RevertIfNotOwner() public {
        vm.prank(outsider);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, outsider));
        registry.setVerifier(address(0xCAFE));
    }

    function test_SetVerifier_RevertIfZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(AgentRegistry.ZeroAddress.selector);
        registry.setVerifier(address(0));
    }
}
