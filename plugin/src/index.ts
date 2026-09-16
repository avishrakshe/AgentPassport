import {
  OnTransactionHandler,
  OnRpcRequestHandler,
  panel,
  heading,
  text,
  divider,
  row
} from "@metamask/snaps-sdk";
import { createPublicClient, http, type Address } from "viem";

// Monad Testnet configuration
const MONAD_TESTNET_CHAIN_ID = "eip155:10143";
const MONAD_RPC_URL = process.env.ALCHEMY_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const DEFAULT_REGISTRY = "0x55568390E407EEaF3227dE4285000a538E824111" as Address;
const DEFAULT_LEDGER = "0x35505a23D7132A6698FFAA4A44323681504eB625" as Address;

export interface ReputationPolicy {
  [key: string]: any;
  minRatingCount: number;
  minTrustScore: number; // between -5.0 and 5.0
  requireCleanverseVerification: boolean;
}

export const DEFAULT_POLICY: ReputationPolicy = {
  minRatingCount: 3,
  minTrustScore: 0.0,
  requireCleanverseVerification: false
};

// Known demo addresses for interactive testing & demonstrations
export const DEMO_AGENTS: Record<
  string,
  { name: string; trustScore: number; ratingCount: number; cleanverseVerified: boolean }
> = {
  // Bad agent fixture: Negative rating history (malicious execution / rug)
  "0x000000000000000000000000000000000000bad0": {
    name: "Malicious Arbitrage Bot",
    trustScore: -3.8,
    ratingCount: 5,
    cleanverseVerified: false
  },
  // Fresh/unrated agent fixture: Insufficient history (< 3 ratings)
  "0x000000000000000000000000000000000000new0": {
    name: "Unregistered Swarm Worker",
    trustScore: 1.0,
    ratingCount: 1,
    cleanverseVerified: false
  },
  // High reputation agent fixture: Verified, positive ratings
  "0x000000000000000000000000000000000000900d": {
    name: "Cleanverse Certified Liquidity Agent",
    trustScore: 4.7,
    ratingCount: 18,
    cleanverseVerified: true
  }
};

/**
 * Fetches counterparty trust score and profile.
 * Checks demo fixture first, then queries live on-chain Monad contracts.
 */
export async function getCounterpartyReputation(recipient: string): Promise<{
  trustScore: number;
  ratingCount: number;
  cleanverseVerified: boolean;
  name?: string;
}> {
  const lower = recipient.toLowerCase();
  if (DEMO_AGENTS[lower]) {
    return DEMO_AGENTS[lower];
  }

  try {
    const client = createPublicClient({
      transport: http(MONAD_RPC_URL)
    });

    const ledgerAbi = [
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
      }
    ] as const;

    const registryAbi = [
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
      }
    ] as const;

    const [scoreRaw, countRaw, agentData] = await Promise.all([
      client.readContract({
        address: DEFAULT_LEDGER,
        abi: ledgerAbi,
        functionName: "getTrustScore",
        args: [recipient as Address]
      }),
      client.readContract({
        address: DEFAULT_LEDGER,
        abi: ledgerAbi,
        functionName: "getRatingCount",
        args: [recipient as Address]
      }),
      client.readContract({
        address: DEFAULT_REGISTRY,
        abi: registryAbi,
        functionName: "getAgent",
        args: [recipient as Address]
      }).catch(() => null)
    ]);

    return {
      trustScore: Number(scoreRaw) / 1e18,
      ratingCount: Number(countRaw),
      cleanverseVerified: agentData ? agentData.cleanverseVerified : false
    };
  } catch {
    // If lookup fails or unrated
    return {
      trustScore: 0.0,
      ratingCount: 0,
      cleanverseVerified: false
    };
  }
}

/**
 * Retrieves the stored user-configurable policy threshold or returns default.
 */
async function getPolicy(): Promise<ReputationPolicy> {
  try {
    const state: any = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" }
    });
    return (state as ReputationPolicy) || DEFAULT_POLICY;
  } catch {
    return DEFAULT_POLICY;
  }
}

/**
 * Hooks into outgoing transaction requests from the Agent Wallet.
 */
export const onTransaction: OnTransactionHandler = async ({ transaction, chainId }) => {
  const recipient = transaction.to as string;
  if (!recipient) {
    return { content: panel([text("Contract creation detected.")]) };
  }

  const policy = await getPolicy();
  const rep = await getCounterpartyReputation(recipient);

  const isInsufficientHistory = rep.ratingCount < policy.minRatingCount;
  const isNegativeOrBelowThreshold = rep.trustScore < policy.minTrustScore;
  const isUnverifiedWhenRequired = policy.requireCleanverseVerification && !rep.cleanverseVerified;

  const shouldBlock = isInsufficientHistory || isNegativeOrBelowThreshold || isUnverifiedWhenRequired;

  // 1. If below threshold: Show explicit warning confirmation dialog
  if (shouldBlock) {
    let reason = "";
    if (isNegativeOrBelowThreshold) {
      reason = `Negative Trust Score (${rep.trustScore.toFixed(2)} < ${policy.minTrustScore})`;
    } else if (isInsufficientHistory) {
      reason = `Insufficient Interaction History (${rep.ratingCount} ratings < required ${policy.minRatingCount})`;
    } else {
      reason = "Unverified by Cleanverse";
    }

    // Trigger interactive confirmation modal
    try {
      await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel([
            heading("🚨 Untrusted Agent Alert"),
            text(`**Transaction Target**: \`${recipient}\``),
            rep.name ? text(`**Identified As**: ${rep.name}`) : text(""),
            divider(),
            row("Trust Score", `${rep.trustScore > 0 ? "+" : ""}${rep.trustScore.toFixed(2)} / 5.0`),
            row("Total Ratings", `${rep.ratingCount}`),
            row("Safety Status", rep.cleanverseVerified ? "✅ Cleanverse Verified" : "❌ Unverified"),
            row("Rejection Reason", reason),
            divider(),
            text(
              "⚠️ **WARNING**: This agent does not meet your safety reputation threshold. Transacting may lead to loss of funds. Do you confirm you wish to proceed?"
            )
          ])
        }
      });
    } catch {
      // Dialog handled
    }

    // Return visual insight banner
    return {
      content: panel([
        heading("🚨 Risk Warning: Untrusted Agent"),
        text(`Recipient failed Agent Passport reputation policy: **${reason}**`),
        row("Trust Score", `${rep.trustScore.toFixed(2)}`),
        row("Ratings", `${rep.ratingCount}`),
        row("Verified", rep.cleanverseVerified ? "Yes" : "No")
      ])
    };
  }

  // 2. If above threshold: Auto-approve silently with positive confirmation insight
  return {
    content: panel([
      heading("✅ Agent Passport: Trusted Agent"),
      text("Counterparty satisfies all reputation and verification thresholds."),
      row("Trust Score", `+${rep.trustScore.toFixed(2)} / 5.0`),
      row("Ratings", `${rep.ratingCount}`),
      row("Cleanverse", rep.cleanverseVerified ? "✅ Verified" : "Unverified"),
      row("Decision", "🟢 Auto-Approved")
    ])
  };
};

/**
 * Exposes RPC endpoints for configuring policy thresholds and querying reputation.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case "getPolicy":
      return (await getPolicy()) as any;

    case "setPolicy": {
      const newPolicy = (request.params as unknown as ReputationPolicy) || DEFAULT_POLICY;
      await snap.request({
        method: "snap_manageState",
        params: { operation: "update", newState: newPolicy as any }
      });
      return { success: true, policy: newPolicy } as any;
    }

    case "checkRecipient": {
      const { address } = (request.params as any) || { address: "" };
      const rep = await getCounterpartyReputation(address);
      const policy = await getPolicy();
      const approved =
        rep.ratingCount >= policy.minRatingCount &&
        rep.trustScore >= policy.minTrustScore &&
        (!policy.requireCleanverseVerification || rep.cleanverseVerified);

      return {
        address,
        ...rep,
        autoApproved: approved,
        policy
      } as any;
    }

    default:
      throw new Error(`Method not found: ${request.method}`);
  }
};
