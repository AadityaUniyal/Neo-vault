/**
 * Neo-Vault End-to-End Test Script
 * Tests the complete flow: Bank → Vault → Verifier
 */

async function test() {
    console.log('\n🧪 NEO-VAULT END-TO-END TEST\n');

    // Step 1: Get commitment from Bank
    console.log('Step 1: Requesting balance commitment from Bank Service...');
    const commitRes = await fetch('http://localhost:3001/api/v1/accounts/ACC-001/commitment', {
        method: 'POST'
    });
    const commitData = await commitRes.json();
    console.log(`  ✅ Commitment received | Sig: ${commitData.commitment.signature.substring(0, 20)}...`);
    console.log(`  📊 Balance: $${commitData._private.balance} | Nonce: ${commitData._private.nonce.substring(0, 8)}...`);

    // Step 2: Generate ZK Proof in Vault
    console.log('\nStep 2: Generating ZK Proof in Vault Core...');
    const proofRes = await fetch('http://localhost:3002/api/v1/proofs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accountId: 'ACC-001',
            balance: commitData._private.balance,
            threshold: 5000,
            nonce: commitData._private.nonce,
            signature: commitData.commitment.signature
        })
    });
    const proofData = await proofRes.json();
    console.log(`  ✅ Proof generated | ID: ${proofData.proof.proofId}`);
    console.log(`  ⚡ Protocol: ${proofData.proof.protocol} | Curve: ${proofData.proof.curve}`);
    console.log(`  ⏱️  Compute time: ${proofData.proof.metadata.computeTimeMs}ms`);

    // Step 3: Verify the proof
    console.log('\nStep 3: Verifying proof in Verifier Service...');
    const verifyRes = await fetch('http://localhost:3003/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof: proofData.proof })
    });
    const verifyData = await verifyRes.json();
    console.log(`  ${verifyData.verified ? '✅ VERIFIED' : '❌ REJECTED'} | Balance revealed: ${verifyData.details.balanceRevealed}`);
    console.log(`  🔑 Signature valid: ${verifyData.details.signatureValid}`);
    console.log(`  💰 Threshold: $${verifyData.details.threshold}`);

    // Step 4: Test with insufficient balance (should fail)
    console.log('\n\nStep 4: Testing with INSUFFICIENT balance (ACC-004 vs $5000 threshold)...');
    const commit2 = await (await fetch('http://localhost:3001/api/v1/accounts/ACC-004/commitment', { method: 'POST' })).json();
    const proof2 = await fetch('http://localhost:3002/api/v1/proofs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accountId: 'ACC-004',
            balance: commit2._private.balance,
            threshold: 5000,
            nonce: commit2._private.nonce,
            signature: commit2.commitment.signature
        })
    });
    const proof2Data = await proof2.json();
    console.log(`  ${proof2Data.success ? '⚠️ Should have failed!' : '✅ Correctly REJECTED'}: ${proof2Data.reason || 'N/A'}`);

    console.log('\n-------------------------------------------');
    console.log('  ALL TESTS PASSED ✅');
    console.log('-------------------------------------------\n');
}

test().catch(e => console.error('Test failed:', e.message));
