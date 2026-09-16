import {
  createPublicClient,
  http,
  stringToHex,
  pad,
  isHex,
  type WalletClient,
  type PublicClient,
  type Address,
  type Hex
} from "viem";
import { request, gql } from "graphql-request";
import { AGENT_REGISTRY_ABI, REPUTATION_LEDGER_ABI } from "./abis";
import {
  DEFAULT_AGENT_REGISTRY,
  DEFAULT_REPUTATION_LEDGER,
  DEFAULT_ENVIO_ENDPOINT,
  monadTestnet
} from "./constants";
import { Agent, AgentProfile, SDKOptions, Rating } from "./types";

export * from "./abis";
export * from "./constants";
export * from "./types";

/**
 * Normalizes a string or hex string into a 32-byte hex string (bytes32).
 */
export function formatBytes32(input: string): Hex {
  if (isHex(input)) {
    return pad(input, { size: 32 });
  }
  // If string length <= 32 bytes, encode and pad
  if (Buffer.byteLength(input, "utf8") <= 32) {
    return stringToHex(input, { size: 32 });
  }
  // Otherwise hash it to produce a stable 32-byte hash
  const { keccak256, toBytes } = require("viem");
  return keccak256(toBytes(input));
}

/**
 * Creates a default public client for Monad Testnet.
 */
export function getPublicClient(rpcUrl?: string): PublicClient {
  return createPublicClient({
    chain: monadTestnet,
    transport: http(rpcUrl || monadTestnet.rpcUrls.default.http[0])
  });
}

/**
 * Registers the calling wallet as an autonomous agent in AgentRegistry.
 * @param walletClient Viem WalletClient with active account.
 * @param agentId Unique identifier/name for the agent.
 * @param metadataURI Metadata URI (e.g. IPFS or Arweave hash describing agent capabilities).
 * @param options Optional SDK configuration overrides.
 */
export async function registerAgent(
  walletClient: WalletClient,
  agentId: string,
  metadataURI: string,
  options?: SDKOptions
): Promise<void> {
  if (!walletClient.account) {
    throw new Error("WalletClient must have an attached account to register an agent.");
  }

  const registryAddress = options?.agentRegistryAddress || DEFAULT_AGENT_REGISTRY;
  const agentIdBytes32 = formatBytes32(agentId);

  const publicClient = getPublicClient(options?.rpcUrl);

  const txHash = await walletClient.writeContract({
    address: registryAddress,
    abi: AGENT_REGISTRY_ABI,
    functionName: "register",
    args: [agentIdBytes32, metadataURI],
    chain: monadTestnet,
    account: walletClient.account
  });

  // Wait for transaction confirmation
  await publicClient.waitForTransactionReceipt({ hash: txHash });
}

/**
 * Submits a rating for an interaction with another agent in ReputationLedger.
 * @param walletClient Viem WalletClient with active account.
 * @param ratedAddress Address of the counterparty agent being rated.
 * @param score Rating score between -5 and 5.
 * @param interactionHash Hash identifying the specific interaction or task.
 * @param options Optional SDK configuration overrides.
 */
export async function submitRating(
  walletClient: WalletClient,
  ratedAddress: string,
  score: number,
  interactionHash: string,
  options?: SDKOptions
): Promise<void> {
  if (!walletClient.account) {
    throw new Error("WalletClient must have an attached account to submit a rating.");
  }

  if (score < -5 || score > 5) {
    throw new Error(`Invalid score: ${score}. Score must be between -5 and 5.`);
  }

  const ledgerAddress = options?.reputationLedgerAddress || DEFAULT_REPUTATION_LEDGER;
  const hashBytes32 = formatBytes32(interactionHash);
  const publicClient = getPublicClient(options?.rpcUrl);

  const txHash = await walletClient.writeContract({
    address: ledgerAddress,
    abi: REPUTATION_LEDGER_ABI,
    functionName: "submitRating",
    args: [ratedAddress as Address, score, hashBytes32],
    chain: monadTestnet,
    account: walletClient.account
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
}

/**
 * Queries the time-decayed trust score for an agent.
 * First queries the Envio HyperIndex GraphQL endpoint; seamlessly falls back
 * to the on-chain ReputationLedger contract if the indexer is offline.
 * @param agentAddress Address of the agent.
 * @param options Optional SDK configuration overrides.
 * @returns Trust score as a float between -5.0 and +5.0 (0 is neutral/unrated).
 */
export async function getTrustScore(
  agentAddress: string,
  options?: SDKOptions
): Promise<number> {
  const endpoint = options?.envioEndpoint || DEFAULT_ENVIO_ENDPOINT;
  const normalizedAddr = agentAddress.toLowerCase();

  // 1. Try querying Envio GraphQL endpoint
  try {
    const query = gql`
      query GetAgentTrustScore($id: ID!) {
        Agent(id: $id) {
          trustScoreFloat
          trustScore
        }
      }
    `;
    const data = await request<{ Agent?: { trustScoreFloat?: number; trustScore?: string } }>(
      endpoint,
      query,
      { id: normalizedAddr }
    );

    if (data?.Agent?.trustScoreFloat !== undefined && data?.Agent?.trustScoreFloat !== null) {
      return data.Agent.trustScoreFloat;
    }
  } catch {
    // Indexer endpoint unreachable or indexing in progress, proceed to on-chain fallback
  }

  // 2. Direct on-chain fallback via ReputationLedger contract
  const publicClient = getPublicClient(options?.rpcUrl);
  const ledgerAddress = options?.reputationLedgerAddress || DEFAULT_REPUTATION_LEDGER;

  try {
    const rawScore = await publicClient.readContract({
      address: ledgerAddress,
      abi: REPUTATION_LEDGER_ABI,
      functionName: "getTrustScore",
      args: [agentAddress as Address]
    });

    return Number(rawScore) / 1e18;
  } catch {
    return 0;
  }
}

/**
 * Retrieves the full profile of an agent including registration data, rating count, and trust score.
 * Queries Envio HyperIndex with seamless on-chain fallback.
 * @param agentAddress Address of the agent.
 * @param options Optional SDK configuration overrides.
 */
export async function getAgentProfile(
  agentAddress: string,
  options?: SDKOptions
): Promise<{ agent: Agent; ratingCount: number; trustScore: number }> {
  const endpoint = options?.envioEndpoint || DEFAULT_ENVIO_ENDPOINT;
  const normalizedAddr = agentAddress.toLowerCase();

  // 1. Try Envio GraphQL
  try {
    const query = gql`
      query GetAgentProfile($id: ID!) {
        Agent(id: $id) {
          id
          wallet
          agentId
          metadataURI
          cleanverseVerified
          registeredAt
          trustScoreFloat
          ratingCount
        }
      }
    `;

    const data = await request<{ Agent?: any }>(endpoint, query, { id: normalizedAddr });

    if (data?.Agent) {
      const a = data.Agent;
      return {
        agent: {
          wallet: a.wallet as `0x${string}`,
          agentId: a.agentId,
          metadataURI: a.metadataURI,
          cleanverseVerified: Boolean(a.cleanverseVerified),
          registeredAt: Number(a.registeredAt)
        },
        ratingCount: Number(a.ratingCount || 0),
        trustScore: Number(a.trustScoreFloat || 0)
      };
    }
  } catch {
    // Fallback to on-chain
  }

  // 2. On-chain fallback
  const publicClient = getPublicClient(options?.rpcUrl);
  const registryAddress = options?.agentRegistryAddress || DEFAULT_AGENT_REGISTRY;
  const ledgerAddress = options?.reputationLedgerAddress || DEFAULT_REPUTATION_LEDGER;

  const [onChainAgent, trustScoreRaw, ratingCountRaw] = await Promise.all([
    publicClient.readContract({
      address: registryAddress,
      abi: AGENT_REGISTRY_ABI,
      functionName: "getAgent",
      args: [agentAddress as Address]
    }),
    publicClient.readContract({
      address: ledgerAddress,
      abi: REPUTATION_LEDGER_ABI,
      functionName: "getTrustScore",
      args: [agentAddress as Address]
    }),
    publicClient.readContract({
      address: ledgerAddress,
      abi: REPUTATION_LEDGER_ABI,
      functionName: "getRatingCount",
      args: [agentAddress as Address]
    })
  ]);

  return {
    agent: {
      wallet: onChainAgent.wallet as `0x${string}`,
      agentId: onChainAgent.agentId,
      metadataURI: onChainAgent.metadataURI,
      cleanverseVerified: onChainAgent.cleanverseVerified,
      registeredAt: Number(onChainAgent.registeredAt)
    },
    ratingCount: Number(ratingCountRaw),
    trustScore: Number(trustScoreRaw) / 1e18
  };
}
