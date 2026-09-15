# Walkthrough - Task 1: Smart Contracts Complete

Task 1 (Smart Contracts) has been implemented, thoroughly tested, and committed to [avishrakshe/AgentPassport](https://github.com/avishrakshe/AgentPassport.git).

## Summary of Changes

### 1. Smart Contracts
- **[`AgentRegistry.sol`](file:///c:/Users/HP/OneDrive/projects/monad%20hackathon/contracts/src/AgentRegistry.sol)**:
  - Stores `Agent` struct (`wallet`, `agentId`, `metadataURI`, `cleanverseVerified`, `registeredAt`).
  - Enforces single registration per wallet address.
  - Implements `markVerified(address agent)` restricted to the `verifier` role (settable by contract owner).
  - Emits `AgentRegistered` and `AgentVerified`.
- **[`ReputationLedger.sol`](file:///c:/Users/HP/OneDrive/projects/monad%20hackathon/contracts/src/ReputationLedger.sol)**:
  - Stores `Rating` struct (`rater`, `rated`, `score`, `interactionHash`, `timestamp`).
  - Enforces `score` between `-5` and `+5`.
  - Reverts if rater or ratee is not registered in `AgentRegistry`.
  - Reverts if same rater rates the same ratee within 24 hours (`COOLDOWN_PERIOD`).
  - Implements 14-day half-life decay math using fixed-point arithmetic (`1e18` scale):
    $$\text{weight} = \frac{10^{36}}{10^{18} + \frac{\Delta t \cdot 10^{18}}{14 \text{ days}}}$$
  - Implements `getTrustScore(address agent)` returning `int256` in range `[-5e18, 5e18]`.
  - Implements `getTrustScoreUint(address agent)` mapping to `[0, 10e18]`.

### 2. Comprehensive Test Suite
- **[`AgentRegistry.t.sol`](file:///c:/Users/HP/OneDrive/projects/monad%20hackathon/contracts/test/AgentRegistry.t.sol)**: 10 unit tests covering access control, state transitions, duplicate registrations, and event emissions.
- **[`ReputationLedger.t.sol`](file:///c:/Users/HP/OneDrive/projects/monad%20hackathon/contracts/test/ReputationLedger.t.sol)**: 12 unit tests verifying score boundaries, cooldown timer enforcement, unregistered revert conditions, and rating aggregations.
- **[`DecayMathFuzz.t.sol`](file:///c:/Users/HP/OneDrive/projects/monad%20hackathon/contracts/test/DecayMathFuzz.t.sol)**:
  - 1000 fuzz runs verifying that trust scores remain strictly within `[-5e18, 5e18]`.
  - 1000 fuzz runs confirming more recent ratings weigh strictly more than older ones.
  - Verification of exact 14-day half-life decay invariance.

### 3. Deploy Script
- **[`Deploy.s.sol`](file:///c:/Users/HP/OneDrive/projects/monad%20hackathon/contracts/script/Deploy.s.sol)**:
  - Deploys `AgentRegistry` and `ReputationLedger`.
  - Logs deployed addresses to console.

### 4. Git Synchronization
- Committed and pushed to remote branch `main` at `https://github.com/avishrakshe/AgentPassport.git`.

## Test Results

```
Ran 10 tests for test/AgentRegistry.t.sol:AgentRegistryTest (10 passed)
Ran 12 tests for test/ReputationLedger.t.sol:ReputationLedgerTest (12 passed)
Ran 5 tests for test/DecayMathFuzz.t.sol:DecayMathFuzzTest (5 passed, 1000 fuzz runs each)
Total: 27 passed; 0 failed; 0 skipped
```
