/**
 * Bank Service (Port 3001)
 * Issues signed balance commitments for Zero-Knowledge proofs.
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { eventBus } = require('../../shared/eventBus');
const { createBalanceCommitment } = require('../../shared/crypto');

const logBus = require('../../shared/logBus');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.SERVICE_PORT || 3001;

// In-memory account store
const accounts = {
    'ACC-001': { name: 'Alice Johnson', balance: 12500.00, currency: 'USD' },
    'ACC-002': { name: 'Bob Smith', balance: 3200.00, currency: 'USD' },
    'ACC-003': { name: 'Charlie Wei', balance: 87000.00, currency: 'USD' },
    'ACC-004': { name: 'Diana Patel', balance: 1500.00, currency: 'USD' },
    'ACC-005': { name: 'Eve Martinez', balance: 45000.00, currency: 'USD' }
};

// API Handlers

/**
 * GET /api/v1/accounts
 * List all available test accounts
 */
app.get('/api/v1/accounts', (req, res) => {
    const sanitized = Object.entries(accounts).map(([id, acc]) => ({
        id,
        name: acc.name,
        currency: acc.currency,
        // Never expose balance in production!
        balanceRange: acc.balance > 10000 ? 'HIGH' : acc.balance > 5000 ? 'MEDIUM' : 'LOW'
    }));
    res.json({ accounts: sanitized, timestamp: new Date().toISOString() });
});

/**
 * POST /api/v1/accounts/:id/commitment
 * Issues a cryptographically signed balance commitment.
 * This is the critical endpoint — the commitment is what the ZK circuit proves against.
 */
app.post('/api/v1/accounts/:id/commitment', (req, res) => {
    const { id } = req.params;
    const account = accounts[id];

    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }

    const nonce = uuidv4();
    const commitment = createBalanceCommitment(id, account.balance, nonce);

    // Publish to Kafka topic: balance.committed
    const kafkaEvent = eventBus.publish('balance.committed', {
        ...commitment,
        balance: account.balance, // Private — only sent to the user's Vault, never to Verifier
        accountName: account.name
    });

    logBus.log('Bank', 'info', `Commitment issued for account ${id}`);
    console.log(`[BANK] 📨 Published commitment for ${id} → Topic: balance.committed`);

    res.json({
        commitment,
        _private: {
            balance: account.balance, // Client-side only, stripped before verification
            nonce
        },
        kafkaOffset: kafkaEvent.offset
    });
});

/**
 * GET /api/v1/health
 */
app.get('/api/v1/health', (req, res) => {
    res.json({ service: 'bank-service', status: 'UP', port: PORT });
});

function startBankService() {
    return new Promise((resolve) => {
        const server = app.listen(PORT, () => {
            console.log(`[BANK] 🏦 Bank Service running on port ${PORT}`);
            resolve(server);
        });
    });
}

module.exports = { app, startBankService };
