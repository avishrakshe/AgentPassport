// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";

/**
 * @title AgentRegistry
 * @notice Canonical on-chain registry for autonomous AI agents on Monad.
 * @dev Manages identity registration, metadata URIs, and Cleanverse verification status.
 */
contract AgentRegistry is Ownable, IAgentRegistry {
    error AlreadyRegistered(address agent);
    error NotRegistered(address agent);
    error NotVerifier(address caller);
    error ZeroAddress();
    error EmptyAgentId();

    address public verifier;
    mapping(address => Agent) private _agents;

    modifier onlyVerifier() {
        if (msg.sender != verifier) {
            revert NotVerifier(msg.sender);
        }
        _;
    }

    constructor(address initialVerifier) Ownable(msg.sender) {
        verifier = initialVerifier == address(0) ? msg.sender : initialVerifier;
        emit VerifierUpdated(address(0), verifier);
    }

    /**
     * @notice Registers the caller's address as an autonomous agent.
     * @param agentId Unique identifier/hash for the agent.
     * @param metadataURI Off-chain metadata URI (e.g. IPFS or Arweave hash describing agent capabilities).
     */
    function register(bytes32 agentId, string calldata metadataURI) external override {
        if (_agents[msg.sender].registeredAt != 0) {
            revert AlreadyRegistered(msg.sender);
        }
        if (agentId == bytes32(0)) {
            revert EmptyAgentId();
        }

        _agents[msg.sender] = Agent({
            wallet: msg.sender,
            agentId: agentId,
            metadataURI: metadataURI,
            cleanverseVerified: false,
            registeredAt: block.timestamp
        });

        emit AgentRegistered(msg.sender, agentId);
    }

    /**
     * @notice Marks an agent as verified (e.g. by Cleanverse safety audit/verification).
     * @param agent The agent address to mark verified.
     */
    function markVerified(address agent) external override onlyVerifier {
        if (_agents[agent].registeredAt == 0) {
            revert NotRegistered(agent);
        }

        _agents[agent].cleanverseVerified = true;
        emit AgentVerified(agent);
    }

    /**
     * @notice Sets the verifier address authorized to verify agents.
     * @param newVerifier The address of the new verifier.
     */
    function setVerifier(address newVerifier) external override onlyOwner {
        if (newVerifier == address(0)) {
            revert ZeroAddress();
        }
        address oldVerifier = verifier;
        verifier = newVerifier;
        emit VerifierUpdated(oldVerifier, newVerifier);
    }

    /**
     * @notice Retrieves the full agent profile for an address.
     * @param agent The agent address.
     */
    function getAgent(address agent) external view override returns (Agent memory) {
        return _agents[agent];
    }

    /**
     * @notice Checks if an agent address is registered.
     * @param agent The agent address.
     */
    function isRegistered(address agent) external view override returns (bool) {
        return _agents[agent].registeredAt != 0;
    }
}
