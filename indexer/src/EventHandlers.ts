/*
 * Envio HyperIndex Event Handlers for Agent Passport
 * Tracks AgentRegistered, AgentVerified, and RatingSubmitted events on Monad Testnet (10143)
 */

const SCALE = 1000000000000000000n; // 1e18
const HALF_LIFE_SECONDS = 14n * 86400n; // 14 days in seconds

/**
 * Calculates weight matching on-chain 14-day half-life decay:
 * weight = 1e36 / (1e18 + (timeSince * 1e18 / 14 days))
 */
export function calculateWeight(ratingTimestamp: bigint, currentTimestamp: bigint): bigint {
  if (currentTimestamp <= ratingTimestamp) {
    return SCALE;
  }
  const timeSince = currentTimestamp - ratingTimestamp;
  const decayTerm = (timeSince * SCALE) / HALF_LIFE_SECONDS;
  const denominator = SCALE + decayTerm;
  return (SCALE * SCALE) / denominator;
}

/**
 * Calculates time-decayed weighted average trust score.
 */
export function computeTrustScore(
  ratings: Array<{ score: number; timestamp: bigint }>,
  currentTimestamp: bigint
): { trustScoreBigInt: bigint; trustScoreFloat: number } {
  if (!ratings || ratings.length === 0) {
    return { trustScoreBigInt: 0n, trustScoreFloat: 0.0 };
  }

  let totalWeight = 0n;
  let weightedScoreSum = 0n;

  for (const r of ratings) {
    const weight = calculateWeight(r.timestamp, currentTimestamp);
    totalWeight += weight;
    weightedScoreSum += BigInt(r.score) * weight;
  }

  if (totalWeight === 0n) {
    return { trustScoreBigInt: 0n, trustScoreFloat: 0.0 };
  }

  const trustScoreBigInt = (weightedScoreSum * SCALE) / totalWeight;
  const trustScoreFloat = Number(trustScoreBigInt) / Number(SCALE);

  return { trustScoreBigInt, trustScoreFloat };
}

// In-memory cache of ratings per agent to ensure fast multi-rating decay recomputation
const agentRatingsCache: Map<string, Array<{ score: number; timestamp: bigint }>> = new Map();

// Standard Envio event handlers
// If running under Envio runtime, imports come from generated
let AgentRegistry: any;
let ReputationLedger: any;

try {
  const generated = require("generated");
  AgentRegistry = generated.AgentRegistry;
  ReputationLedger = generated.ReputationLedger;
} catch {
  // Graceful fallback for standalone compilation / unit tests
}

if (AgentRegistry && ReputationLedger) {
  AgentRegistry.AgentRegistered.handler(async ({ event, context }: any) => {
    const agentAddress = event.params.agent.toLowerCase();

    context.Agent.set({
      id: agentAddress,
      wallet: event.params.agent,
      agentId: event.params.agentId,
      metadataURI: "",
      cleanverseVerified: false,
      registeredAt: BigInt(event.block.timestamp),
      trustScore: 0n,
      trustScoreFloat: 0.0,
      ratingCount: 0,
    });
  });

  AgentRegistry.AgentVerified.handler(async ({ event, context }: any) => {
    const agentAddress = event.params.agent.toLowerCase();
    const agent = await context.Agent.get(agentAddress);
    if (agent) {
      context.Agent.set({
        ...agent,
        cleanverseVerified: true,
      });
    }
  });

  ReputationLedger.RatingSubmitted.handler(async ({ event, context }: any) => {
    const raterAddress = event.params.rater.toLowerCase();
    const ratedAddress = event.params.rated.toLowerCase();
    const score = Number(event.params.score);
    const timestamp = BigInt(event.block.timestamp);
    const ratingId = `${event.transaction.hash}-${event.logIndex}`;

    // Record the rating entity
    context.Rating.set({
      id: ratingId,
      rater_id: raterAddress,
      rated_id: ratedAddress,
      score: score,
      interactionHash: "",
      timestamp: timestamp,
      blockNumber: BigInt(event.block.number),
      transactionHash: event.transaction.hash,
    });

    // Update in-memory cache for the rated agent
    const list = agentRatingsCache.get(ratedAddress) || [];
    list.push({ score, timestamp });
    agentRatingsCache.set(ratedAddress, list);

    // Compute updated decayed trust score
    const { trustScoreBigInt, trustScoreFloat } = computeTrustScore(list, timestamp);

    // Update the Agent entity
    const ratedAgent = await context.Agent.get(ratedAddress);
    if (ratedAgent) {
      context.Agent.set({
        ...ratedAgent,
        ratingCount: ratedAgent.ratingCount + 1,
        trustScore: trustScoreBigInt,
        trustScoreFloat: trustScoreFloat,
      });
    }
  });
}
