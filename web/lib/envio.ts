import { request, gql } from "graphql-request";
import { ENVIO_GRAPHQL_ENDPOINT } from "./contracts";
import { INITIAL_AGENTS, AgentData } from "./mockData";

export async function fetchAgents(): Promise<AgentData[]> {
  try {
    const query = gql`
      query GetAllAgents {
        Agent(order_by: { trustScoreFloat: desc }, limit: 50) {
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

    const data: any = await request(ENVIO_GRAPHQL_ENDPOINT, query);
    if (data?.Agent && data.Agent.length > 0) {
      return data.Agent.map((a: any, idx: number) => ({
        id: a.id,
        name: a.agentId.replace("agent-", "").replace(/-/g, " ").toUpperCase(),
        role: a.agentId,
        index: idx + 1,
        wallet: a.wallet,
        agentId: a.agentId,
        metadataURI: a.metadataURI || "",
        cleanverseVerified: Boolean(a.cleanverseVerified),
        registeredAt: Number(a.registeredAt),
        trustScore: Number(a.trustScoreFloat || 0),
        ratingCount: Number(a.ratingCount || 0),
        description: `Autonomous agent operating on Monad Testnet (${a.agentId}).`
      }));
    }
  } catch {
    // Envio indexer offline or local GraphQL not started yet, return fallback mock agents
  }

  return INITIAL_AGENTS;
}

export async function fetchAgentDetail(address: string): Promise<AgentData | null> {
  const normalized = address.toLowerCase();

  try {
    const query = gql`
      query GetAgentDetail($id: ID!) {
        Agent(id: $id) {
          id
          wallet
          agentId
          metadataURI
          cleanverseVerified
          registeredAt
          trustScoreFloat
          ratingCount
          ratingsReceived(order_by: { timestamp: desc }, limit: 50) {
            id
            rater {
              id
              wallet
            }
            score
            interactionHash
            timestamp
          }
        }
      }
    `;

    const data: any = await request(ENVIO_GRAPHQL_ENDPOINT, query, { id: normalized });
    if (data?.Agent) {
      const a = data.Agent;
      return {
        id: a.id,
        name: a.agentId.replace("agent-", "").replace(/-/g, " ").toUpperCase(),
        role: a.agentId,
        index: 1,
        wallet: a.wallet,
        agentId: a.agentId,
        metadataURI: a.metadataURI || "",
        cleanverseVerified: Boolean(a.cleanverseVerified),
        registeredAt: Number(a.registeredAt),
        trustScore: Number(a.trustScoreFloat || 0),
        ratingCount: Number(a.ratingCount || 0),
        description: `Autonomous agent operating on Monad Testnet (${a.agentId}).`,
        ratings: (a.ratingsReceived || []).map((r: any) => ({
          id: r.id,
          rater: r.rater?.wallet || r.rater?.id || "0x0",
          score: Number(r.score),
          interactionHash: r.interactionHash || "",
          timestamp: Number(r.timestamp),
          comment: `Interaction ${r.interactionHash ? r.interactionHash.slice(0, 10) + "..." : "verified"}`
        }))
      };
    }
  } catch {
    // Fallback
  }

  // Look in mock data
  const match = INITIAL_AGENTS.find(
    (a) => a.wallet.toLowerCase() === normalized || a.id.toLowerCase() === normalized
  );

  if (match) {
    return match;
  }

  // Return synthetic registered agent for any arbitrary address
  return {
    id: address,
    name: `Agent ${address.slice(0, 6)}...${address.slice(-4)}`,
    role: "ai-specialist",
    index: 99,
    wallet: address,
    agentId: `agent-${address.slice(2, 10)}`,
    metadataURI: "ipfs://bafybeianonagentcaps",
    cleanverseVerified: false,
    registeredAt: Math.floor(Date.now() / 1000) - 86400,
    trustScore: 0.0,
    ratingCount: 0,
    description: "Registered autonomous AI agent on Monad Testnet.",
    ratings: []
  };
}
