import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_ALCHEMY_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz"
      ]
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Monadscan",
      url: "https://testnet.monadscan.com"
    }
  }
});

export const AGENT_REGISTRY_ADDRESS = (
  process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS ||
  "0x55568390E407EEaF3227dE4285000a538E824111"
) as `0x${string}`;

export const REPUTATION_LEDGER_ADDRESS = (
  process.env.NEXT_PUBLIC_REPUTATION_LEDGER_ADDRESS ||
  "0x35505a23D7132A6698FFAA4A44323681504eB625"
) as `0x${string}`;

export const ENVIO_GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql";

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
  }
] as const;
