# 🌐 Agent Passport

> **Decentralized Reputation, Identity & Risk Rails for Autonomous AI Agents on Monad**
> Built for the Monad Metropolis Hackathon — *Trust, Identity & AI Infrastructure Track*

[![Monad Testnet](https://img.shields.io/badge/Monad%20Testnet-Chain%2010143-836EF9?logo=ethereum)](https://testnet.monadscan.com)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Envio HyperIndex](https://img.shields.io/badge/Envio-HyperIndex-FF5A5F)](https://envio.dev)
[![Dynamic SDK](https://img.shields.io/badge/Dynamic-Embedded%20Wallets-6366F1)](https://dynamic.xyz)
[![MetaMask Snap](https://img.shields.io/badge/MetaMask-Snap%20Plugin-F6851B?logo=metamask)](https://metamask.io/snaps/)

---

## 💡 Overview

As autonomous AI agents transact, trade, and interact at sub-second speeds on high-throughput chains like Monad, how do counterparty agents and human operators know who to trust?

**Agent Passport** establishes an open, verifiable on-chain identity and reputation network for AI agents:
1. **Verifiable Agent Identity (`AgentRegistry.sol`)**: Autonomous agents register cryptographic identifiers, metadata URIs, and receive Cleanverse bot/sybil verification credentials.
2. **Time-Decayed Reputation Ledger (`ReputationLedger.sol`)**: Autonomous agents rate counterparties after interactions (`-5` to `+5`). A mathematical **14-day half-life decay function** prioritizes recent behavioral patterns over stale history to prevent sleep-and-exit attacks.
3. **Sub-second Event Indexing (`indexer/`)**: Powered by **Envio HyperIndex** to track registrations, ratings, and compute live trust scores at Monad speeds.
4. **Agent SDK (`sdk/`)**: `@agent-passport/sdk` enables seamless integration into agent frameworks like **LangChain**, **ElizaOS**, and **CrewAI** to pre-flight risk checks before signing transactions.
5. **MetaMask Snaps Plugin (`plugin/`)**: An interactive wallet guardrail that inspects target counterparties on-chain before transactions are executed, preventing human or agent operators from interacting with malicious counterparties.
6. **Web Dashboard (`web/`)**: A Next.js 14 App Router experience featuring live reputation feeds, real-time agent directory, on-chain rating submission, and embedded agent wallet onboarding via Dynamic.xyz.

---

## 📍 Deployed Contracts (Monad Testnet - Chain ID 10143)

| Contract | Address | Explorer / Sourcify |
|---|---|---|
| **AgentRegistry** | `0x55568390E407EEaF3227dE4285000a538E824111` | [Monadscan](https://testnet.monadscan.com/address/0x55568390E407EEaF3227dE4285000a538E824111) \| [Sourcify Verified](https://sourcify.dev/#/lookup/0x55568390E407EEaF3227dE4285000a538E824111) |
| **ReputationLedger** | `0x35505a23D7132A6698FFAA4A44323681504eB625` | [Monadscan](https://testnet.monadscan.com/address/0x35505a23D7132A6698FFAA4A44323681504eB625) \| [Sourcify Verified](https://sourcify.dev/#/lookup/0x35505a23D7132A6698FFAA4A44323681504eB625) |

---

## 🏛️ Monorepo Architecture

```
AgentPassport/
├── contracts/        # Foundry smart contracts with 14-day decay math (27 tests)
├── indexer/          # Envio HyperIndex real-time GraphQL indexer
├── sdk/              # @agent-passport/sdk TypeScript library for AI agent frameworks
├── plugin/           # MetaMask Snap wallet extension for real-time counterparty checks
└── web/              # Next.js 14 frontend dashboard with Dynamic.xyz integration
```

---

## 📐 Mathematical Reputation Decay

To prevent malicious agents from building up reputation and then executing attacks unchecked, ratings decay on a **14-day half-life schedule**:

$$\text{weight} = \frac{10^{36}}{10^{18} + \frac{\Delta t \cdot 10^{18}}{14 \text{ days}}}$$

$$\text{Trust Score} = \frac{\sum (\text{score}_i \cdot \text{weight}_i)}{\sum \text{weight}_i}$$

- **Range**: `[-5.0, +5.0]` (scaled by `1e18` in smart contracts).
- **Recent Dominance**: Recent interactions strictly outweigh historical ratings.
- **Cooldown**: 24-hour rate limiting prevents reciprocal rating manipulation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Foundry (`forge`, `cast`)
- pnpm or npm

### 1. Smart Contracts (`contracts/`)
```bash
cd contracts
forge install
forge test -vvv
```

### 2. Indexer (`indexer/`)
```bash
cd indexer
npm install
npm run codegen
npm run build
npm test
```

### 3. Agent SDK (`sdk/`)
```bash
cd sdk
npm install
npm run build
npm test
```

#### Quick Usage in Agent Scripts:
```typescript
import { AgentPassportSDK } from "@agent-passport/sdk";

const sdk = new AgentPassportSDK({
  rpcUrl: "https://testnet-rpc.monad.xyz",
  agentRegistryAddress: "0x55568390E407EEaF3227dE4285000a538E824111",
  reputationLedgerAddress: "0x35505a23D7132A6698FFAA4A44323681504eB625",
});

// Look up counterparty trust score before sending funds
const trustScore = await sdk.getTrustScore("0x3C44...93BC");
if (trustScore < 0.0) {
  throw new Error("Counterparty reputation below risk threshold!");
}
```

### 4. MetaMask Snap (`plugin/`)
```bash
cd plugin
npm install
npm run build
npm test
```

### 5. Web Dashboard (`web/`)
```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

---

## 📄 License
MIT License
