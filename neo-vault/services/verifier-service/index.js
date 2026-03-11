/**
 * Verifier Service (Port 3003)
 * Validates ZK proofs and broadcasts results via WebSocket.
 */

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const { eventBus } = require('../../shared/eventBus');
const { verifyProof } = require('../../shared/zkEngine');
const { MerkleAuditTree } = require('../../shared/crypto');

const logBus = require('../../shared/logBus');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.SERVICE_PORT || 3003;
const server = http.createServer(app);

// Real-time update stream
const wss = new WebSocketServer({ server, path: '/ws' });
const wsClients = new Set();

wss.on('connection', (ws) => {
    wsClients.add(ws);
    console.log(`[VERIFIER] 🔌 WebSocket client connected (Total: ${wsClients.size})`);

    // Send connection confirmation
    ws.send(JSON.stringify({
        type: 'CONNECTED',
        message: 'Connected to Neo-Vault Verification Stream',
        timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
        wsClients.delete(ws);
        console.log(`[VERIFIER] 🔌 WebSocket client disconnected (Total: ${wsClients.size})`);
    });
});

function broadcastToClients(data) {
    const message = JSON.stringify(data);
    wsClients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
}

// Verification state & Audit Trail
const verificationHistory = [];
const securityIncidents = [];
const auditTree = new MerkleAuditTree();

// Event bus listeners
eventBus.subscribe('__all__', (event) => {
    broadcastToClients({
        type: 'KAFKA_EVENT',
        topic: event.topic,
        offset: event.offset,
        timestamp: event.timestamp,
        preview: typeof event.payload === 'object' ?
            { accountId: event.payload.accountId, success: event.payload.success } : {}
    });
});

// Proof auto-verification
eventBus.subscribe('proof.generated', (event) => {
    console.log(`[VERIFIER] 📥 Received ProofGeneratedEvent | Offset: ${event.offset}`);

    if (event.payload.success && event.payload.proof) {
        console.log(`[VERIFIER] 🔍 Auto-verifying proof ${event.payload.proofId}...`);

        const result = verifyProof(event.payload.proof);

        // Create Audit Trail entry
        const auditEntry = { proofId: event.payload.proofId, result: result.verified, ts: Date.now() };
        const auditInfo = auditTree.addLeaf(auditEntry);

        const record = {
            proofId: event.payload.proofId,
            accountId: event.payload.accountId,
            verified: result.verified,
            threshold: event.payload.proof.publicSignals.threshold,
            verifyTimeMs: result.verifyTimeMs,
            timestamp: new Date().toISOString(),
            audit: {
                root: auditInfo.root,
                leaf: auditInfo.leaf,
                index: auditInfo.index
            }
        };
        verificationHistory.push(record);

        // Publish verification result
        eventBus.publish('verification.result', {
            ...record,
            details: result.details
        });

        // Push to WebSocket clients
        broadcastToClients({
            type: 'VERIFICATION_RESULT',
            ...record,
            details: result.details,
            merkleRoot: auditInfo.root
        });

        if (!result.verified) {
            securityIncidents.push({
                incidentId: `SEC-${Date.now()}`,
                type: result.details.signatureValid === false ? 'SIGNATURE_FAILURE' : 'QUALIFICATION_FAILURE',
                severity: result.details.signatureValid === false ? 'HIGH' : 'LOW',
                proofId: event.payload.proofId,
                accountId: event.payload.accountId,
                timestamp: new Date().toISOString()
            });
        }
    }
});

// API Routes

/**
 * POST /api/v1/verify
 * Manually verify a proof submitted by the user/frontend
 */
app.post('/api/v1/verify', (req, res) => {
    const { proof } = req.body;

    if (!proof) {
        return res.status(400).json({ error: 'Proof object is required' });
    }

    console.log(`[VERIFIER] 🔍 Manual verification request for proof ${proof.proofId}`);

    const result = verifyProof(proof);

    const record = {
        proofId: proof.proofId,
        verified: result.verified,
        threshold: proof.publicSignals?.threshold,
        verifyTimeMs: result.verifyTimeMs,
        timestamp: new Date().toISOString()
    };
    verificationHistory.push(record);

    // Publish result
    eventBus.publish('verification.result', {
        ...record,
        details: result.details
    });

    broadcastToClients({
        type: 'VERIFICATION_RESULT',
        ...record,
        details: result.details
    });

    res.json({ ...result, proofId: proof.proofId });
});

/**
 * GET /api/v1/verifications
 * Get verification history
 */
app.get('/api/v1/verifications', (req, res) => {
    res.json({
        totalVerifications: verificationHistory.length,
        verifications: verificationHistory
    });
});

/**
 * GET /api/v1/kafka/stream
 * Get the full Kafka event log
 */
app.get('/api/v1/kafka/stream', (req, res) => {
    res.json({
        totalEvents: eventBus.getLog().length,
        events: eventBus.getLog().map(e => ({
            id: e.id,
            topic: e.topic,
            offset: e.offset,
            timestamp: e.timestamp
        }))
    });
});

/**
 * GET /api/v1/health
 */
app.get('/api/v1/health', (req, res) => {
    res.json({
        service: 'verifier-service',
        status: 'UP',
        port: PORT,
        wsClients: wsClients.size,
        verificationsProcessed: verificationHistory.length,
        merkleRoot: auditTree.root,
        incidentCount: securityIncidents.length
    });
});

/**
 * GET /api/v1/security/incidents
 */
app.get('/api/v1/security/incidents', (req, res) => {
    res.json(securityIncidents);
});

/**
 * GET /api/v1/verify/audit/:index
 * Return proof of inclusion for a specific verification
 */
app.get('/api/v1/verify/audit/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (isNaN(index) || index >= verificationHistory.length) {
        return res.status(404).json({ error: 'Audit record not found' });
    }
    const proof = auditTree.getProof(index);
    res.json({
        index,
        root: auditTree.root,
        leaf: auditTree.leaves[index],
        proof
    });
});

function startVerifierService() {
    return new Promise((resolve) => {
        server.listen(PORT, () => {
            console.log(`[VERIFIER] 🛡️  Verifier Service running on port ${PORT}`);
            console.log(`[VERIFIER] 🔌 WebSocket available at ws://localhost:${PORT}/ws`);
            logBus.log('Verifier', 'info', `Verifier Service running on port ${PORT}`);
            logBus.log('Verifier', 'info', `WebSocket available at ws://localhost:${PORT}/ws`);
            resolve(server);
        });
    });
}

module.exports = { app, startVerifierService };
