/**
 * Neo-Vault Cryptographic Utilities
 * 
 * Implements HMAC-SHA256 signing and verification for balance commitments.
 * This mirrors JPMC's approach to data integrity in financial systems.
 */

const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

// In production, this would be an HSM-managed key
const BANK_SECRET_KEY = 'neo-vault-bank-hmac-secret-2024';

/**
 * Creates a signed commitment of a balance.
 * The commitment hides the actual balance behind a cryptographic hash.
 */
function createBalanceCommitment(accountId, balance, nonce) {
    const message = `${accountId}:${balance}:${nonce}`;
    const signature = CryptoJS.HmacSHA256(message, BANK_SECRET_KEY).toString();

    return {
        commitmentId: uuidv4(),
        accountId,
        balanceHash: CryptoJS.SHA256(`${balance}:${nonce}`).toString(),
        signature,
        nonce,
        timestamp: new Date().toISOString()
    };
}

/**
 * Verifies a balance commitment's signature.
 */
function verifyCommitment(accountId, balance, nonce, signature) {
    const message = `${accountId}:${balance}:${nonce}`;
    const expectedSig = CryptoJS.HmacSHA256(message, BANK_SECRET_KEY).toString();
    return expectedSig === signature;
}

/**
 * Simple Merkle Tree for verification audit trails.
 */
class MerkleAuditTree {
    constructor() {
        this.leaves = [];
        this.root = null;
    }

    addLeaf(data) {
        const leaf = CryptoJS.SHA256(JSON.stringify(data)).toString();
        this.leaves.push(leaf);
        this.rebuild();
        return { leaf, root: this.root, index: this.leaves.length - 1 };
    }

    rebuild() {
        if (this.leaves.length === 0) {
            this.root = null;
            return;
        }

        let currentLevel = [...this.leaves];
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
                nextLevel.push(CryptoJS.SHA256(left + right).toString());
            }
            currentLevel = nextLevel;
        }
        this.root = currentLevel[0];
    }

    getProof(index) {
        let proof = [];
        let currentLevel = [...this.leaves];
        let idx = index;

        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;

                if (i === idx || i + 1 === idx) {
                    proof.push(i === idx ? (i + 1 < currentLevel.length ? right : left) : left);
                }

                nextLevel.push(CryptoJS.SHA256(left + right).toString());
            }
            currentLevel = nextLevel;
            idx = Math.floor(idx / 2);
        }
        return proof;
    }
}

module.exports = {
    createBalanceCommitment,
    verifyCommitment,
    hashProof,
    MerkleAuditTree,
    BANK_SECRET_KEY
};
