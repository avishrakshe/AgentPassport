# Agent Passport — MetaMask Agent Wallet Plugin / Snap

> An on-chain security guard for autonomous AI agents and humans using MetaMask. Automatically intercepts outgoing transactions, checks counterparty reputation on Monad, and blocks untrusted or malicious agents.

---

## How It Works

1. **Transaction Interception (`onTransaction`)**:
   - Hooks into all outgoing contract calls and token transfers dispatched by an autonomous agent (or user).
   - Extracts the recipient address (`transaction.to`).

2. **Reputation Lookup**:
   - Queries the on-chain `ReputationLedger` contract (and Envio HyperIndex) on **Monad Testnet**.
   - Calculates the counterparty's time-decayed trust score (`[-5, +5]`), rating count, and Cleanverse verification status.

3. **Policy Evaluation & Action**:
   - **Default Safety Policy**:
     - Reject if `ratingCount < 3` (insufficient interaction history).
     - Reject if `trustScore < 0.0` (net negative reputation / failed interactions).
   - **Below Threshold**:
     - Spawns an interactive confirmation dialog with the exact trust score and rating count.
     - Requires explicit confirmation to proceed.
   - **Above Threshold**:
     - Silently auto-approves the transaction without interrupting the autonomous agent workflow.

---

## Live Demonstration

Run the automated simulation demonstrating live interception:

```bash
cd plugin
npm run demo
```

Output:
```text
>>> SCENARIO A: Agent Wallet initiates transfer to KNOWN BAD AGENT
    Target Recipient : 0x000000000000000000000000000000000000bad0
    Transfer Amount  : 10.0 MON
    [Reputation Lookup]
      • Trust Score     : -3.80 / 5.0
      • Total Ratings   : 5
      • Cleanverse Cert : ❌ UNVERIFIED
    [Snap Decision] : 🚨 BLOCKED / WARNING DIALOG TRIGGERED!
      • Dialog Title  : "Untrusted Agent Alert"
      • Requires      : Explicit human / guardian confirmation to override!

>>> SCENARIO C: Agent Wallet initiates transfer to HIGH-REPUTATION VERIFIED AGENT
    Target Recipient : 0x000000000000000000000000000000000000900d
    Transfer Amount  : 25.0 MON
    [Reputation Lookup]
      • Trust Score     : +4.70 / 5.0
      • Total Ratings   : 18
      • Cleanverse Cert : ✅ VERIFIED
    [Snap Decision] : 🟢 AUTO-APPROVED SILENTLY
      • Status        : Trusted counterparty detected. Transaction allowed.
```

---

## RPC Methods (`onRpcRequest`)

- `getPolicy`: View current threshold settings (`minRatingCount`, `minTrustScore`, `requireCleanverseVerification`).
- `setPolicy`: Update policy thresholds.
- `checkRecipient`: Programmatic check for autonomous agent orchestrators before generating transaction calldata.
