import { formatBytes32, getTrustScore, getAgentProfile, submitRating, registerAgent } from "../src/index";
import { isHex } from "viem";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTests() {
  console.log("Running SDK Unit Tests...");

  // Test 1: formatBytes32
  const hexInput = "0x55568390e407eeaf3227de4285000a538e824111";
  const formattedHex = formatBytes32(hexInput);
  assert(isHex(formattedHex), "Must be valid hex");
  assert(formattedHex.length === 66, "Must be 32 bytes (66 chars including 0x)");

  const strInput = "my-test-agent";
  const formattedStr = formatBytes32(strInput);
  assert(isHex(formattedStr), "Must be valid hex for string input");
  assert(formattedStr.length === 66, "Must be 32 bytes for string input");

  // Test 2: submitRating boundary validation
  let threwHigh = false;
  try {
    const mockWalletClient: any = { account: { address: "0x123" } };
    await submitRating(mockWalletClient, "0x456", 6, "hash");
  } catch (err: any) {
    if (err.message.includes("Invalid score")) {
      threwHigh = true;
    }
  }
  assert(threwHigh, "submitRating must reject score > 5");

  let threwLow = false;
  try {
    const mockWalletClient: any = { account: { address: "0x123" } };
    await submitRating(mockWalletClient, "0x456", -6, "hash");
  } catch (err: any) {
    if (err.message.includes("Invalid score")) {
      threwLow = true;
    }
  }
  assert(threwLow, "submitRating must reject score < -5");

  // Test 3: Account missing validation
  let threwNoAccount = false;
  try {
    const mockWalletClientNoAccount: any = {};
    await registerAgent(mockWalletClientNoAccount, "agent-1", "ipfs://uri");
  } catch (err: any) {
    if (err.message.includes("WalletClient must have an attached account")) {
      threwNoAccount = true;
    }
  }
  assert(threwNoAccount, "registerAgent must reject wallet client without account");

  // Test 4: On-chain getTrustScore query against deployed Monad Testnet contract
  const testAgent = "0x799108b77e35E87286Aa46056C9B9b3B8CFB40c7";
  const score = await getTrustScore(testAgent, {
    // Deliberately pointing to invalid Envio endpoint so it tests automatic on-chain fallback
    envioEndpoint: "http://127.0.0.1:9999/graphql"
  });
  console.log(`On-chain trust score for ${testAgent}: ${score}`);
  assert(typeof score === "number", "Trust score must be a number");
  assert(score >= -5 && score <= 5, "Trust score must be within [-5, 5]");

  // Test 5: On-chain getAgentProfile query against deployed Monad Testnet contract
  const profile = await getAgentProfile(testAgent, {
    envioEndpoint: "http://127.0.0.1:9999/graphql"
  });
  console.log("Fetched agent profile:", profile);
  assert(profile.agent !== undefined, "Profile must contain agent object");
  assert(typeof profile.ratingCount === "number", "ratingCount must be number");
  assert(typeof profile.trustScore === "number", "trustScore must be number");

  console.log("All SDK Unit Tests PASSED!");
}

runTests().catch((err) => {
  console.error("SDK tests failed:", err);
  process.exit(1);
});
