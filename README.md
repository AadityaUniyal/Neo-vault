# Neo-Vault 🔐

> **Privacy-Preserving Financial Verification using Zero-Knowledge Proofs**

Neo-Vault is an enterprise-grade middleware that allows users to prove financial eligibility (e.g., "I have ≥ $5,000") to third-party verifiers **without revealing their actual balance, account number, or transaction history**.

Built with **Event-Driven Architecture**, **Cryptographic ZK Proofs**, and **Real-Time WebSocket Streaming**.

---

## 🏗️ Architecture

```
┌──────────────┐    Kafka Topic     ┌──────────────┐    Kafka Topic     ┌──────────────────┐
│  Bank Service │──────────────────→│  Vault Core  │──────────────────→│ Verifier Service │
│    :3001      │ balance.committed │    :3002      │ proof.generated   │      :3003        │
│  (HMAC-SHA256)│                   │  (ZK Engine)  │                   │  (WebSocket Push) │
└──────────────┘                    └──────────────┘                    └──────────────────┘
                                                                              │
                                                                              ▼ WebSocket
                                                                        ┌──────────┐
                                                                        │ React UI │
                                                                        │  :5173   │
                                                                        └──────────┘
```

## ✨ Key Features

| Feature | Technology |
|---------|-----------|
| Zero-Knowledge Proofs | Groth16 protocol on BN128 curve |
| Balance Commitments | HMAC-SHA256 signed commitments |
| **Audit Trail** | **Merkle Tree cryptographic logging (v3.0)** |
| **Chaos Mode** | **Network resilience & stress simulation (v3.0)** |
| **Evidence Export** | **Signed ZKP verification evidence (v3.0)** |
| Event-Driven | Apache Kafka (simulated / Docker) |
| Real-Time Updates | WebSocket streaming |
| Crypto Circuit | Circom (eligibility_check.circom) |
| Containerization | Docker Compose |
| Frontend | React + Vite (Glassmorphism UI) |
| **Analytics** | Recharts (ZKP Latency & Success Stats) |
| **API Explorer** | Built-in Interactive Endpoint Testing |
| **System Logs** | Real-time centralized log aggregator |
| **Dual Theme** | Institutional Dark & Arctic Light modes |

## 🚀 Quick Start

### 1. Repository Setup
```bash
git clone <your-repo-url>
cd neo-vault
npm run install:all # Installs root and frontend dependencies
```

### 2. Start All Services (Dev Mode)
```bash
npm run dev
```

This single command boots the Backend Orchestrator and Frontend simultaneously.
Access the dashboard at: `http://localhost:5173`

## 📁 Project Structure

```
neo-vault/
├── docker-compose.yml          # Kafka + Zookeeper + Services
├── orchestrator.js             # Dev mode: boots all services
├── package.json
├── shared/                     # Shared logic
│   ├── eventBus.js            # Kafka-like event bus
│   ├── crypto.js              # HMAC-SHA256 utils
│   ├── logBus.js              # Centralized Log Bus
│   └── zkEngine.js            # ZK Proof engine
├── services/                   # Microservices
│   ├── bank-service/          # Port 3001
│   ├── vault-core/            # Port 3002
│   └── verifier-service/      # Port 3003
├── zk-circuits/                # ZK Circuits
│   └── eligibility.circom
└── verifier-portal/
    └── frontend/              # React + Vite dashboard
```

## 🧪 API Reference

### Bank Service (`:3001`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts` | List test accounts |
| POST | `/api/v1/accounts/:id/commitment` | Issue signed commitment |

### Vault Core (`:3002`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/proofs/generate` | Generate ZK proof |
| GET | `/api/v1/proofs/history` | Proof generation history |

### Verifier Service (`:3003`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/verify` | Verify a ZK proof |
| GET | `/api/v1/verifications` | Verification history |
| GET | `/api/v1/kafka/stream` | Full event log |

---


