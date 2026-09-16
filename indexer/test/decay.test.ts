import { calculateWeight, computeTrustScore } from "../src/EventHandlers";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log("Running Indexer Decay Math Tests...");

const SCALE = 1000000000000000000n;
const DAY = 86400n;

// Test 1: Exact Half-Life
const current = 1000000000n;
const weight0 = calculateWeight(current, current);
assert(weight0 === SCALE, `Weight at t=0 should be 1e18, got ${weight0}`);

const weight14d = calculateWeight(current - 14n * DAY, current);
assert(weight14d === SCALE / 2n, `Weight at t=14d should be 0.5e18, got ${weight14d}`);

const weight28d = calculateWeight(current - 28n * DAY, current);
assert(weight28d === (SCALE * SCALE) / (3n * SCALE), `Weight at t=28d should be 1/3 e18, got ${weight28d}`);

// Test 2: Single Rating Preservation
const singleScore = computeTrustScore([{ score: 5, timestamp: current - 7n * DAY }], current);
assert(singleScore.trustScoreBigInt === 5n * SCALE, `Expected 5e18, got ${singleScore.trustScoreBigInt}`);
assert(singleScore.trustScoreFloat === 5.0, `Expected 5.0, got ${singleScore.trustScoreFloat}`);

const singleNegative = computeTrustScore([{ score: -4, timestamp: current - 3n * DAY }], current);
assert(singleNegative.trustScoreBigInt === -4n * SCALE, `Expected -4e18, got ${singleNegative.trustScoreBigInt}`);
assert(singleNegative.trustScoreFloat === -4.0, `Expected -4.0, got ${singleNegative.trustScoreFloat}`);

// Test 3: Recent Dominance (matches Solidity DecayMathFuzz test)
// Older +5 at t - 28 days (weight 1/3), newer -5 at t (weight 1)
// Result: (-5 * 1 + 5 * 1/3) / (1 + 1/3) = (-10/3) / (4/3) = -2.5
const mixed = computeTrustScore([
  { score: 5, timestamp: current - 28n * DAY },
  { score: -5, timestamp: current }
], current);

assert(Math.abs(mixed.trustScoreFloat - (-2.5)) < 1e-9, `Expected -2.5, got ${mixed.trustScoreFloat}`);
const diff = mixed.trustScoreBigInt - (-2500000000000000000n);
assert(diff >= -2n && diff <= 2n, `Expected -2.5e18 (within 2 wei), got ${mixed.trustScoreBigInt}`);

console.log("All Indexer Decay Math Tests PASSED!");
