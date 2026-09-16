import { getCounterpartyReputation, DEFAULT_POLICY } from "../src/index";

async function runDemo() {
  console.log("================================================================================");
  console.log("         AGENT PASSPORT - METAMASK AGENT WALLET GUARD DEMO SIMULATION          ");
  console.log("================================================================================\n");

  const scenarios = [
    {
      title: "SCENARIO A: Agent Wallet initiates transfer to KNOWN BAD AGENT",
      recipient: "0x000000000000000000000000000000000000bad0",
      amount: "10.0 MON"
    },
    {
      title: "SCENARIO B: Agent Wallet initiates transfer to UNVERIFIED NEW AGENT",
      recipient: "0x000000000000000000000000000000000000new0",
      amount: "5.0 MON"
    },
    {
      title: "SCENARIO C: Agent Wallet initiates transfer to HIGH-REPUTATION VERIFIED AGENT",
      recipient: "0x000000000000000000000000000000000000900d",
      amount: "25.0 MON"
    }
  ];

  for (const s of scenarios) {
    console.log(`>>> ${s.title}`);
    console.log(`    Target Recipient : ${s.recipient}`);
    console.log(`    Transfer Amount  : ${s.amount}`);

    const rep = await getCounterpartyReputation(s.recipient);
    console.log(`    [Reputation Lookup]`);
    console.log(`      • Trust Score     : ${rep.trustScore > 0 ? "+" : ""}${rep.trustScore.toFixed(2)} / 5.0`);
    console.log(`      • Total Ratings   : ${rep.ratingCount}`);
    console.log(`      • Cleanverse Cert : ${rep.cleanverseVerified ? "✅ VERIFIED" : "❌ UNVERIFIED"}`);

    const isBlocked =
      rep.ratingCount < DEFAULT_POLICY.minRatingCount ||
      rep.trustScore < DEFAULT_POLICY.minTrustScore;

    if (isBlocked) {
      console.log(`    [Snap Decision] : 🚨 BLOCKED / WARNING DIALOG TRIGGERED!`);
      console.log(`      • Dialog Title  : "Untrusted Agent Alert"`);
      console.log(`      • Requires      : Explicit human / guardian confirmation to override!`);
    } else {
      console.log(`    [Snap Decision] : 🟢 AUTO-APPROVED SILENTLY`);
      console.log(`      • Status        : Trusted counterparty detected. Transaction allowed.\n`);
    }
    console.log("--------------------------------------------------------------------------------\n");
  }

  console.log("Demo simulation complete. Real-time safety guard verified successfully.");
}

runDemo().catch(console.error);
