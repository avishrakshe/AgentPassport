// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgentRegistry {
    struct Agent {
        address wallet;
        bytes32 agentId;
        string metadataURI;
        bool cleanverseVerified;
        uint256 registeredAt;
    }

    event AgentRegistered(address indexed agent, bytes32 agentId);
    event AgentVerified(address indexed agent);
    event VerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    function register(bytes32 agentId, string calldata metadataURI) external;
    function markVerified(address agent) external;
    function setVerifier(address newVerifier) external;
    function getAgent(address agent) external view returns (Agent memory);
    function isRegistered(address agent) external view returns (bool);
    function verifier() external view returns (address);
}
