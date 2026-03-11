pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  NEO-VAULT :: ELIGIBILITY CIRCUIT                           ║
 * ║  Proves: balance >= threshold WITHOUT revealing balance     ║
 * ║  Protocol: Groth16 | Curve: BN128                          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Private Inputs:
 *   - balance: The user's actual account balance (in cents)
 *   - nonce:   Random value to prevent brute-force attacks
 *
 * Public Inputs:
 *   - threshold:      Minimum required balance
 *   - commitmentHash: Poseidon hash of (balance, nonce)
 *
 * Public Outputs:
 *   - eligible: 1 if balance >= threshold, enforced by constraint
 */
template EligibilityCheck() {
    // Private inputs (known only to the prover)
    signal input balance;
    signal input nonce;
    
    // Public inputs (known to both prover and verifier)
    signal input threshold;
    
    // Public outputs
    signal output eligible;
    signal output commitmentHash;
    
    // ─── Step 1: Range Proof (balance >= threshold) ─────────────
    // Uses GreaterEqThan comparator from circomlib
    // 32-bit precision handles values up to ~$42 million
    component gte = GreaterEqThan(32);
    gte.in[0] <== balance;
    gte.in[1] <== threshold;
    
    // Constrain: the comparison MUST be true (1)
    gte.out === 1;
    eligible <== gte.out;
    
    // ─── Step 2: Commitment Hash ────────────────────────────────
    // Poseidon hash binds the balance to a nonce
    // This prevents the verifier from guessing the balance
    component hasher = Poseidon(2);
    hasher.inputs[0] <== balance;
    hasher.inputs[1] <== nonce;
    commitmentHash <== hasher.out;
}

// Main component declaration
component main {public [threshold]} = EligibilityCheck();
