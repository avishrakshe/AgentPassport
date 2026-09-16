# Walkthrough - Agent Passport (All Tasks 1–5 Complete)

The complete end-to-end infrastructure for **Agent Passport** has been built, tested, verified on Monad Testnet (Chain ID 10143), and committed to [avishrakshe/AgentPassport](https://github.com/avishrakshe/AgentPassport.git).

---

## 🚀 Deployed Monad Testnet Contracts (Chain ID 10143)

- **AgentRegistry**: [`0x55568390E407EEaF3227dE4285000a538E824111`](https://testnet.monadscan.com/address/0x55568390E407EEaF3227dE4285000a538E824111)
  - Verified on Sourcify: `4e22c8b2-eafb-46fb-a8ee-2b02499e1e9c`
- **ReputationLedger**: [`0x35505a23D7132A6698FFAA4A44323681504eB625`](https://testnet.monadscan.com/address/0x35505a23D7132A6698FFAA4A44323681504eB625)
  - Verified on Sourcify: `0c80bb3c-1456-413c-9ccc-02fe5cf014cc`

---

## 📦 Monorepo Implementation Summary

### Task 1: Smart Contracts (`contracts/`)
- **`AgentRegistry.sol`**:
  - Implements `Agent` struct (`wallet`, `agentId`, `metadataURI`, `cleanverseVerified`, `registeredAt`).
  - Restricts verification to Cleanverse oracle role.
  - Reverts on duplicate registrations or unauthorized calls.
- **`ReputationLedger.sol`**:
  - Implements continuous 14-day half-life decay formula using fixed-point arithmetic (`1e18`):
    $$\text{weight} = \frac{10^{36}}{10^{18} + \frac{\Delta t \cdot 10^{18}}{14 \text{ days}}}$$
  - Enforces 24-hour rate limiting cooldown between pairs to prevent reciprocal rating manipulation.
  - Reverts when un-registered agents attempt rating submission or invalid scores ($[-5, +5]$).
- **Test Suite**:
  - 27 tests passing, including 1000 fuzz runs verifying bounded range invariants and monotonic decay dominance.

### Task 2: Envio HyperIndex (`indexer/`)
- Real-time indexing for Monad testnet blocks (`config.yaml`).
- GraphQL schema (`schema.graphql`) tracking `Agent` and `Rating` entities.
- Event handlers in `src/EventHandlers.ts` computing time-decayed aggregate trust scores matching on-chain contract arithmetic down to the wei.
- Unit tests in `test/decay.test.ts` passing.

### Task 3: TypeScript Agent SDK (`sdk/`)
- `@agent-passport/sdk` library exported for AI agent developers.
- Supports `registerAgent`, `submitRating`, `getTrustScore`, and `getAgentProfile`.
- Automatically queries Envio HyperIndex GraphQL for fast sub-second lookups, with seamless fallback to on-chain RPC calls.
- Tested and verified with live on-chain queries against Monad testnet (`test/sdk.test.ts`).

### Task 4: MetaMask Snap Plugin (`plugin/`)
- `onTransaction` hook inspecting transaction counterparties in real time.
- Blocks transactions if counterparty is unrated (`ratingCount < 3`) or has negative reputation (`trustScore < 0.0`) with an explicit confirmation dialog.
- Automatically and silently approves trusted counterparties.
- Comprehensive demo suite in `test/demo.ts` verifying blocked and allowed states.

### Task 5: Web Dashboard (`web/`)
- Built with **Next.js 14 App Router**, **Tailwind CSS**, **Lucide Icons**, and **Viem**.
- Design faithfully follows the reference screenshot:
  - Hero header with badge pills (`Mode A: Autonomous`, `Mode B: Your Wallet`, `x402 Micropayments`).
  - Large bold typography: *"Agents pay agents. No wallet required."*
  - Interactive Live Reputation Card displaying the 14-day decay formula and quick agent ratings.
  - On-chain Agent Directory with search, filters (verified only), and sorting (highest score, most reviews).
  - Agent Detail Page (`/agents/[address]`) showing complete score breakdown, on-chain rating submission form with cooldown awareness, and transaction history.
  - Agent Registration Page (`/register`) with live preview card and one-click transaction submission.
  - Integrated **Dynamic.xyz** embedded wallet authentication (`DynamicProvider.tsx`) for social & agent wallet onboarding.
- Verified: `npm run build` succeeds with **0 errors and 0 warnings**.

---

## 🧪 Verification & Build Status

| Component | Build / Test Status | Output / Artifact |
|---|---|---|
| `contracts/` | ✅ 27 Passed (1000 fuzz runs) | Monad Testnet deployed & Sourcify verified |
| `indexer/` | ✅ Passed | Schema & handlers generated |
| `sdk/` | ✅ Passed | Live on-chain queries verified |
| `plugin/` | ✅ Passed | Snap demo simulation verified |
| `web/` | ✅ Passed (0 warnings) | Static & dynamic routes compiled |

---

## 🔗 Remote Repository
All changes committed and pushed to:
`https://github.com/avishrakshe/AgentPassport.git`
