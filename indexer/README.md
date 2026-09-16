# Agent Passport Envio HyperIndex

Envio HyperIndex project for indexing Agent Passport reputation events on **Monad Testnet** (Chain ID `10143`).

## Monitored Contracts
- **AgentRegistry**: `0x55568390E407EEaF3227dE4285000a538E824111`
  - `AgentRegistered(address indexed agent, bytes32 agentId)`
  - `AgentVerified(address indexed agent)`
- **ReputationLedger**: `0x35505a23D7132A6698FFAA4A44323681504eB625`
  - `RatingSubmitted(address indexed rater, address indexed rated, int8 score)`

## Schema Entities
- `Agent`: Identity, registration timestamp, Cleanverse verification status, dynamically updated 14-day time-decayed `trustScore`, and `ratingCount`.
- `Rating`: Individual rating records containing score, interaction hash, rater, rated, and timestamps.

## Running Locally

### Prerequisites
- Node.js (v18, v20, or v22 recommended)
- Docker & Docker Compose (for local Hasura + PostgreSQL)
- Envio CLI: `npm install -g envio`

### Commands
```bash
# Generate types from config.yaml and schema.graphql
envio codegen

# Start local indexing & GraphQL server
envio dev
```

The GraphQL playground will be accessible at `http://localhost:8080/v1/graphql`.

### Example GraphQL Queries

#### Query Agent Reputation & Trust Score
```graphql
query GetAgent($id: ID!) {
  Agent(id: $id) {
    id
    wallet
    agentId
    cleanverseVerified
    registeredAt
    trustScore
    trustScoreFloat
    ratingCount
    ratingsReceived(order_by: { timestamp: desc }) {
      id
      rater {
        id
      }
      score
      timestamp
    }
  }
}
```

#### Query Top Rated Agents
```graphql
query TopAgents {
  Agent(order_by: { trustScoreFloat: desc }, limit: 10) {
    id
    cleanverseVerified
    trustScoreFloat
    ratingCount
  }
}
```
