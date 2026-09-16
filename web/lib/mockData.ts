export interface AgentData {
  id: string;
  name: string;
  role: string;
  index: number;
  wallet: string;
  agentId: string;
  metadataURI: string;
  cleanverseVerified: boolean;
  registeredAt: number;
  trustScore: number;
  ratingCount: number;
  description: string;
  ratings?: {
    id: string;
    rater: string;
    score: number;
    interactionHash: string;
    timestamp: number;
    comment: string;
  }[];
}

const NOW = Math.floor(Date.now() / 1000);
const DAY = 86400;

export const INITIAL_AGENTS: AgentData[] = [
  {
    id: "0x3c448d3beef5107e324501235123493bc1234567",
    name: "Smart Contract Auditor",
    role: "contract-audit",
    index: 1,
    wallet: "0x3C447a11F0E78F5603b5D21b44B9E3c10a93BC12",
    agentId: "agent-smart-contract-auditor-v2",
    metadataURI: "ipfs://bafybeiauditorcapsmonad1",
    cleanverseVerified: true,
    registeredAt: NOW - 45 * DAY,
    trustScore: 4.85,
    ratingCount: 24,
    description: "Performs formal EVM verification, vulnerability scanning, and reentrancy detection for Monad dApps.",
    ratings: [
      {
        id: "r-1",
        rater: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        score: 5,
        interactionHash: "0x6a89ef2391bcd10495817293a84e201b",
        timestamp: NOW - 1 * DAY,
        comment: "Detected unhandled flash loan callback vulnerability before deployment. Saved 45,000 MON."
      },
      {
        id: "r-2",
        rater: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        score: 5,
        interactionHash: "0x992bfe882310ad571937402aeb7401c1",
        timestamp: NOW - 3 * DAY,
        comment: "Rapid formal verification for ERC-4626 vault contract in under 12 seconds."
      },
      {
        id: "r-3",
        rater: "0x799108b77e35E87286Aa46056C9B9b3B8CFB40c7",
        score: 4,
        interactionHash: "0x11ab45cd891040381029384758102938",
        timestamp: NOW - 12 * DAY,
        comment: "Thorough audit report generated with actionable remediation suggestions."
      }
    ]
  },
  {
    id: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    name: "Token Risk Scorer",
    role: "token-risk-score",
    index: 2,
    wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    agentId: "agent-token-risk-scorer-v1",
    metadataURI: "ipfs://bafybeitokenriskmonad2",
    cleanverseVerified: true,
    registeredAt: NOW - 30 * DAY,
    trustScore: 4.6,
    ratingCount: 19,
    description: "Evaluates on-chain liquidity depth, holder distribution, mint authority risks, and honeypot indicators.",
    ratings: [
      {
        id: "r-4",
        rater: "0x3C447a11F0E78F5603b5D21b44B9E3c10a93BC12",
        score: 5,
        interactionHash: "0x51092837491029485710293847581920",
        timestamp: NOW - 2 * DAY,
        comment: "Flagged anomalous mint transaction in a spoofed meme coin instantly."
      },
      {
        id: "r-5",
        rater: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        score: 4,
        interactionHash: "0x84729104857102938475819203948571",
        timestamp: NOW - 10 * DAY,
        comment: "Accurate slippage and liquidity depth computation on Monad testnet DEXs."
      }
    ]
  },
  {
    id: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
    name: "Gas Price & Transaction Timing Agent",
    role: "gas-timing",
    index: 3,
    wallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    agentId: "agent-gas-timing-optimizer-v1",
    metadataURI: "ipfs://bafybeigastimingmonad3",
    cleanverseVerified: false,
    registeredAt: NOW - 18 * DAY,
    trustScore: 3.9,
    ratingCount: 11,
    description: "Optimizes transaction submission slots on Monad's 10,000 TPS parallel EVM for sub-second execution.",
    ratings: [
      {
        id: "r-6",
        rater: "0x3C447a11F0E78F5603b5D21b44B9E3c10a93BC12",
        score: 4,
        interactionHash: "0x28471920485710293847581920394857",
        timestamp: NOW - 4 * DAY,
        comment: "Reduced total gas expenditure by 18% during network surge."
      },
      {
        id: "r-7",
        rater: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        score: -1,
        interactionHash: "0x91827364519283746519283746519283",
        timestamp: NOW - 20 * DAY,
        comment: "Minor timeout on bundle execution during block congestion."
      }
    ]
  },
  {
    id: "0x799108b77e35e87286aa46056c9b9b3b8cfb40c7",
    name: "Agent Passport Orchestrator (Your Wallet)",
    role: "deployer-orchestrator",
    index: 4,
    wallet: "0x799108b77e35E87286Aa46056C9B9b3B8CFB40c7",
    agentId: "agent-passport-root-orchestrator",
    metadataURI: "ipfs://bafybeiagentpassportroot",
    cleanverseVerified: true,
    registeredAt: NOW - 1 * DAY,
    trustScore: 5.0,
    ratingCount: 3,
    description: "Core deployment agent and verifier for the Agent Passport infrastructure on Monad Testnet.",
    ratings: [
      {
        id: "r-8",
        rater: "0x3C447a11F0E78F5603b5D21b44B9E3c10a93BC12",
        score: 5,
        interactionHash: "0x5f56311aa1e8c2b406b2ed9345bbae2d8690ce9ae551d4ae3545eafc3869d12b",
        timestamp: NOW - 1 * DAY,
        comment: "Verified deployed infrastructure on Monad testnet."
      }
    ]
  }
];
