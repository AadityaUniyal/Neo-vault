# Neo-Vault

Neo-Vault is a privacy-preserving financial verification system designed to demonstrate Zero-Knowledge Proof (ZKP) integration in modern microservice architectures. It allows users to prove financial eligibility (e.g., "my balance is over $10,000") to third-party verifiers without ever revealing their actual bank balance.

## System Architecture

The project consists of three core microservices communicating over an event-driven bus:

- **Bank Service**: Acts as the source of truth, issuing cryptographically signed balance commitments.
- **Vault Core**: The privacy engine that generates Groth16 ZK-proofs based on bank commitments.
- **Verifier Service**: A third-party portal that validates proofs and provides real-time status updates via WebSockets.

## Tech Stack

- **Backend**: Node.js, Express, Kafka (Pub/Sub pattern)
- **Frontend**: React, Vite, Recharts (Analytics), CSS3 (Glassmorphism UI)
- **Privacy**: Zero-Knowledge Proofs (Groth16/BN128), HMAC-SHA256, Poseidon hashing

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for all services:
   ```bash
   npm install
   cd verifier-portal/frontend && npm install
   ```

### Running Locally

To start the entire system (all microservices + event bus):

```bash
node orchestrator.js
```

To start the frontend dashboard:

```bash
cd verifier-portal/frontend
npm run dev
```

## Security & Privacy

- **Zero Leakage**: Actual balances never leave the user's local "Vault" service.
- **Tamper Proof**: Commitments are signed using HMAC-SHA256 to prevent balance manipulation.
- **Real-time Monitoring**: Integrated Kafka event monitor and system log aggregator for auditability.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
