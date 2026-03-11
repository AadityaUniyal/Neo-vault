/**
 * Neo-Vault Orchestrator
 * Boots all microservices for local development
 */

const { startBankService } = require('./services/bank-service/index');
const { startVaultCore } = require('./services/vault-core/index');
const { startVerifierService } = require('./services/verifier-service/index');

async function boot() {
    console.log('');
    console.log('------------------------------------------------------------');
    console.log('      Neo-Vault v2.0 - Financial Verification System      ');
    console.log('------------------------------------------------------------');
    console.log('');

    try {
        await startBankService();
        await startVaultCore();
        await startVerifierService();

        console.log('');
        console.log('┌────────────────────────────────────────────────────────┐');
        console.log('│  All services are UP and running!                     │');
        console.log('│                                                        │');
        console.log('│  🏦 Bank Service     → http://localhost:3001           │');
        console.log('│  🔒 Vault Core       → http://localhost:3002           │');
        console.log('│  🛡️  Verifier Service → http://localhost:3003           │');
        console.log('│  🔌 WebSocket        → ws://localhost:3003/ws          │');
        console.log('│                                                        │');
        console.log('│  📡 Kafka Event Bus  → In-Memory (Dev Mode)           │');
        console.log('│  🐳 Production       → docker-compose up -d           │');
        console.log('└────────────────────────────────────────────────────────┘');
        console.log('');
    } catch (err) {
        console.error('[ORCHESTRATOR] ❌ Boot failed:', err.message);
        process.exit(1);
    }
}

boot();
