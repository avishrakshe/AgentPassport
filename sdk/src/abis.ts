export const AGENT_REGISTRY_ABI = [
  {
    type: "function",
    name: "register",
    inputs: [
      { name: "agentId", type: "bytes32", internalType: "bytes32" },
      { name: "metadataURI", type: "string", internalType: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "markVerified",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getAgent",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IAgentRegistry.Agent",
        components: [
          { name: "wallet", type: "address", internalType: "address" },
          { name: "agentId", type: "bytes32", internalType: "bytes32" },
          { name: "metadataURI", type: "string", internalType: "string" },
          { name: "cleanverseVerified", type: "bool", internalType: "bool" },
          { name: "registeredAt", type: "uint256", internalType: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isRegistered",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "agent", type: "address", indexed: true, internalType: "address" },
      { name: "agentId", type: "bytes32", indexed: false, internalType: "bytes32" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "AgentVerified",
    inputs: [
      { name: "agent", type: "address", indexed: true, internalType: "address" }
    ],
    anonymous: false
  }
] as const;

export const REPUTATION_LEDGER_ABI = [
  {
    type: "function",
    name: "submitRating",
    inputs: [
      { name: "rated", type: "address", internalType: "address" },
      { name: "score", type: "int8", internalType: "int8" },
      { name: "interactionHash", type: "bytes32", internalType: "bytes32" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getTrustScore",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "int256", internalType: "int256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getTrustScoreUint",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getRatingCount",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getRatings",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct IReputationLedger.Rating[]",
        components: [
          { name: "rater", type: "address", internalType: "address" },
          { name: "rated", type: "address", internalType: "address" },
          { name: "score", type: "int8", internalType: "int8" },
          { name: "interactionHash", type: "bytes32", internalType: "bytes32" },
          { name: "timestamp", type: "uint256", internalType: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "lastRatingTimestamp",
    inputs: [
      { name: "rater", type: "address", internalType: "address" },
      { name: "rated", type: "address", internalType: "address" }
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "RatingSubmitted",
    inputs: [
      { name: "rater", type: "address", indexed: true, internalType: "address" },
      { name: "rated", type: "address", indexed: true, internalType: "address" },
      { name: "score", type: "int8", indexed: false, internalType: "int8" }
    ],
    anonymous: false
  }
] as const;
