# @agent-passport/sdk

> The official TypeScript SDK for **Agent Passport** — an on-chain identity and time-decayed reputation rail for autonomous AI agents on **Monad**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Monad Testnet](https://img.shields.io/badge/Monad%20Testnet-Chain%2010143-purple)](https://testnet.monadscan.com)

---

## Overview

As autonomous agents transact with each other in multi-agent economies, determining whether a counterparty is trustworthy is critical. 

The **Agent Passport SDK** enables any AI agent framework (Eliza, LangChain, AutoGPT, CrewAI, Rig, etc.) to:
1. **Register Identity**: Establish an immutable on-chain identity linked to agent metadata and safety verification.
2. **Pre-Transaction Trust Check**: Query counterparty trust scores before executing token transfers or executing smart contract calls.
3. **Submit Ratings**: Rate counterparties on a `[-5, +5]` scale with 24-hour rate-limiting and a **14-day half-life decay** ensuring recent performance dominates older ratings.

---

## Installation

```bash
npm install @agent-passport/sdk viem graphql-request
```

---

## Quickstart

### 1. Pre-Transaction Counterparty Check

Before your autonomous agent pays another agent or accepts a delegated task, query their trust score:

```typescript
import { getTrustScore, getAgentProfile } from "@agent-passport/sdk";

async function verifyCounterparty(counterpartyAddress: string): Promise<boolean> {
  // Query trust score (ranges from -5.0 to +5.0)
  const score = await getTrustScore(counterpartyAddress);
  const profile = await getAgentProfile(counterpartyAddress);

  console.log(`Counterparty: ${counterpartyAddress}`);
  console.log(`Trust Score: ${score}`);
  console.log(`Total Ratings: ${profile.ratingCount}`);
  console.log(`Cleanverse Verified: ${profile.agent.cleanverseVerified}`);

  // Safety Policy: Require at least 3 ratings and a positive trust score
  if (profile.ratingCount < 3 || score < 0) {
    console.warn(`[SAFETY ALERT] Refusing transaction with untrusted agent!`);
    return false;
  }

  return true;
}
```

---

### 2. Registering an Agent Identity

```typescript
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { registerAgent, monadTestnet } from "@agent-passport/sdk";

const account = privateKeyToAccount("0xYOUR_PRIVATE_KEY");

const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http("https://testnet-rpc.monad.xyz")
});

async function main() {
  await registerAgent(
    walletClient,
    "defi-arbitrage-agent-v1",
    "ipfs://bafybeicapabilitieshash123"
  );
  console.log("Agent successfully registered on Monad!");
}
main();
```

---

### 3. Submitting a Post-Interaction Rating

After a successful (or failed) task, rate your counterparty:

```typescript
import { submitRating } from "@agent-passport/sdk";

async function onTaskCompleted(
  counterpartyAddress: string,
  success: boolean,
  taskId: string
) {
  // Rate +5 for high-quality execution, -5 for malicious/failed interaction
  const score = success ? 5 : -4;
  const interactionHash = `task-result-${taskId}`;

  await submitRating(walletClient, counterpartyAddress, score, interactionHash);
  console.log(`Submitted rating ${score} for ${counterpartyAddress}`);
}
```

---

## Framework Integration Example (LangChain / Eliza Tool)

```typescript
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { getAgentProfile } from "@agent-passport/sdk";

export const checkAgentReputationTool = new DynamicStructuredTool({
  name: "check_agent_reputation",
  description: "Check the on-chain trust score and verification status of a counterparty before transacting.",
  schema: z.object({
    agentAddress: z.string().describe("The EVM wallet address of the agent to inspect")
  }),
  func: async ({ agentAddress }) => {
    const profile = await getAgentProfile(agentAddress);
    return JSON.stringify({
      address: agentAddress,
      trustScore: profile.trustScore,
      ratingCount: profile.ratingCount,
      isCleanverseVerified: profile.agent.cleanverseVerified,
      registeredAt: new Date(profile.agent.registeredAt * 1000).toISOString()
    });
  }
});
```

---

## API Reference

### `registerAgent(walletClient, agentId, metadataURI, options?)`
- **Parameters**:
  - `walletClient`: Viem `WalletClient` with attached account.
  - `agentId`: `string` name or identifier (automatically formatted/hashed to 32 bytes).
  - `metadataURI`: Off-chain URI (IPFS/Arweave) describing capabilities.
  - `options`: Optional overrides for contract addresses and RPC.
- **Returns**: `Promise<void>`

### `submitRating(walletClient, ratedAddress, score, interactionHash, options?)`
- **Parameters**:
  - `walletClient`: Viem `WalletClient`.
  - `ratedAddress`: EVM address of counterparty.
  - `score`: Integer between `-5` and `+5`.
  - `interactionHash`: String or hex identifier for the interaction.
- **Returns**: `Promise<void>`

### `getTrustScore(agentAddress, options?)`
- **Parameters**:
  - `agentAddress`: EVM address of the agent.
- **Returns**: `Promise<number>` — Returns float between `-5.0` and `+5.0` (evaluated with 14-day half-life decay). Queries Envio HyperIndex with automatic on-chain fallback.

### `getAgentProfile(agentAddress, options?)`
- **Parameters**:
  - `agentAddress`: EVM address of the agent.
- **Returns**: `Promise<{ agent: Agent, ratingCount: number, trustScore: number }>`

---

## Deployed Monad Testnet Contracts
- **AgentRegistry**: `0x55568390E407EEaF3227dE4285000a538E824111`
- **ReputationLedger**: `0x35505a23D7132A6698FFAA4A44323681504eB625`
- **Chain ID**: `10143` (Monad Testnet)
