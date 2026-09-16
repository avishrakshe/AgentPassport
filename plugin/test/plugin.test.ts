import {
  getCounterpartyReputation,
  DEFAULT_POLICY,
  DEMO_AGENTS
} from "../src/index";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runPluginTests() {
  console.log("Running MetaMask Agent Wallet Plugin Tests...\n");

  const badAgent = "0x000000000000000000000000000000000000bad0";
  const newAgent = "0x000000000000000000000000000000000000new0";
  const goodAgent = "0x000000000000000000000000000000000000900d";

  // Test 1: Bad agent reputation lookup
  console.log("1. Testing Bad Agent detection...");
  const badRep = await getCounterpartyReputation(badAgent);
  console.log(`   Bad Agent score: ${badRep.trustScore}, ratings: ${badRep.ratingCount}`);
  assert(badRep.trustScore < 0, "Bad agent must have negative score");
  const badShouldBlock =
    badRep.ratingCount < DEFAULT_POLICY.minRatingCount ||
    badRep.trustScore < DEFAULT_POLICY.minTrustScore;
  assert(badShouldBlock, "Bad agent must trigger block/warning dialog");

  // Test 2: New agent (< 3 ratings) lookup
  console.log("2. Testing New Agent (< 3 ratings) detection...");
  const newRep = await getCounterpartyReputation(newAgent);
  console.log(`   New Agent score: ${newRep.trustScore}, ratings: ${newRep.ratingCount}`);
  const newShouldBlock =
    newRep.ratingCount < DEFAULT_POLICY.minRatingCount ||
    newRep.trustScore < DEFAULT_POLICY.minTrustScore;
  assert(newShouldBlock, "New agent must trigger block due to < 3 ratings");

  // Test 3: Good agent lookup
  console.log("3. Testing Good Agent auto-approval...");
  const goodRep = await getCounterpartyReputation(goodAgent);
  console.log(`   Good Agent score: ${goodRep.trustScore}, ratings: ${goodRep.ratingCount}`);
  const goodShouldBlock =
    goodRep.ratingCount < DEFAULT_POLICY.minRatingCount ||
    goodRep.trustScore < DEFAULT_POLICY.minTrustScore;
  assert(!goodShouldBlock, "Good agent must NOT trigger block (auto-approved)");

  // Test 4: Live on-chain lookup
  console.log("4. Testing Live On-Chain Monad Query...");
  const liveAddress = "0x799108b77e35E87286Aa46056C9B9b3B8CFB40c7";
  const liveRep = await getCounterpartyReputation(liveAddress);
  console.log(`   Live address trust score: ${liveRep.trustScore}, ratings: ${liveRep.ratingCount}`);
  assert(typeof liveRep.trustScore === "number", "Live trust score must be a number");
  assert(typeof liveRep.ratingCount === "number", "Live rating count must be a number");

  console.log("\nAll MetaMask Plugin Tests PASSED!");
}

runPluginTests().catch((err) => {
  console.error("Plugin tests failed:", err);
  process.exit(1);
});
