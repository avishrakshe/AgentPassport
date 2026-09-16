export interface Agent {
  wallet: `0x${string}`;
  agentId: string;
  metadataURI: string;
  cleanverseVerified: boolean;
  registeredAt: number;
}

export interface Rating {
  id?: string;
  rater: string;
  rated: string;
  score: number;
  interactionHash?: string;
  timestamp: number;
  blockNumber?: number;
  transactionHash?: string;
}

export interface AgentProfile {
  agent: Agent;
  ratingCount: number;
  trustScore: number;
  ratings?: Rating[];
}

export interface SDKOptions {
  agentRegistryAddress?: `0x${string}`;
  reputationLedgerAddress?: `0x${string}`;
  envioEndpoint?: string;
  rpcUrl?: string;
}
