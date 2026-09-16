import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.ALCHEMY_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz"
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

export const DEFAULT_AGENT_REGISTRY: `0x${string}` =
  (process.env.AGENT_REGISTRY_ADDRESS as `0x${string}`) ||
  "0x55568390E407EEaF3227dE4285000a538E824111";

export const DEFAULT_REPUTATION_LEDGER: `0x${string}` =
  (process.env.REPUTATION_LEDGER_ADDRESS as `0x${string}`) ||
  "0x35505a23D7132A6698FFAA4A44323681504eB625";

export const DEFAULT_ENVIO_ENDPOINT =
  process.env.ENVIO_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql";
