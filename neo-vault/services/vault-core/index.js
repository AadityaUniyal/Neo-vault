/**
 * Vault-Core Service (Port 3002)
 * Privacy-preserving backend for ZK proof generation.
 */

const express = require('express');
const cors = require('cors');
const { eventBus } = require('../../shared/eventBus');
const { generateProof } = require('../../shared/zkEngine');
const { verifyCommitment } = require('../../shared/crypto');

const logBus = require('../../shared/logBus');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.SERVICE_PORT || 3002;

// Local proof history
const proofHistory = [];

// Event bus consumer
eventBus.subscribe('balance.committed', (event) => {
    console.log(`[VAULT] 📥 Received BalanceCommittedEvent | Offset: ${event.offset}`);
    console.log(`[VAULT] ⏳ Commitment queued for proof generation...`);
});

// API Routes

/**
 * POST /api/v1/proofs/generate
 * Takes a balance commitment and generates a ZK proof.
 * 
 * The balance is used ONLY for proof generation and is NEVER stored or forwarded.
 */
app.post('/api/v1/proofs/generate', async (req, res) => {
    const { accountId, balance, threshold, nonce, signature } = req.body;

    console.log(`[VAULT] 🔐 Proof request received for ${accountId}`);
    console.log(`[VAULT] 🧮 Circuit: eligibility_check_v2 | Threshold: $${threshold}`);

    // Step 1: Verify the bank's commitment signature
    const commitmentValid = verifyCommitment(accountId, balance, nonce, signature);
    if (!commitmentValid) {
        console.log(`[VAULT] ❌ Invalid commitment signature — possible tampering!`);
        return res.status(403).json({
            error: 'COMMITMENT_VERIFICATION_FAILED',
            message: 'The bank commitment signature is invalid.'
        });
    }
    console.log(`[VAULT] ✅ Commitment signature verified (HMAC-SHA256)`);

    // Step 2: Generate the ZK Proof
    console.log(`[VAULT] ⚡ Generating Groth16 proof (bn128 curve)...`);
    const result = generateProof(balance, threshold, nonce);

    if (!result.success) {
        console.log(`[VAULT] ❌ Proof generation failed: ${result.reason}`);

        eventBus.publish('proof.generated', {
            accountId,
            success: false,
            error: result.error,
            threshold
        });

        return res.status(400).json(result);
    }

    // Step 3: Store in history (never store the balance itself!)
    const record = {
        proofId: result.proof.proofId,
        accountId,
        threshold,
        timestamp: new Date().toISOString(),
        computeTimeMs: result.proof.metadata.computeTimeMs,
        // NOTE: balance is NOT stored — privacy preserved
    };
    proofHistory.push(record);

    // Step 4: Publish to Kafka topic: proof.generated
    const kafkaEvent = eventBus.publish('proof.generated', {
        proofId: result.proof.proofId,
        accountId,
        proof: result.proof,
        success: true
    });

    logBus.log('Vault', 'info', `Proof generated and published for account: ${accountId}, Proof ID: ${result.proof.proofId}`);
    console.log(`[VAULT] 📨 Published proof → Topic: proof.generated | Time: ${result.proof.metadata.computeTimeMs}ms`);

    res.json({
        ...result,
        kafkaOffset: kafkaEvent.offset
    });
});

/**
 * GET /api/v1/proofs/history
 * Returns proof generation history (without balances — privacy preserved)
 */
app.get('/api/v1/proofs/history', (req, res) => {
    res.json({
        totalProofs: proofHistory.length,
        proofs: proofHistory,
        privacyNote: 'No balance data is stored in this service'
    });
});

/**
 * GET /api/v1/health
 */
app.get('/api/v1/health', (req, res) => {
    res.json({ service: 'vault-core', status: 'UP', port: PORT, proofsGenerated: proofHistory.length });
});

function startVaultCore() {
    return new Promise((resolve) => {
        const server = app.listen(PORT, () => {
            console.log(`[VAULT] 🔒 Vault-Core running on port ${PORT}`);
            resolve(server);
        });
    });
}

module.exports = { app, startVaultCore };
