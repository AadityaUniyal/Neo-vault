import { useState, useCallback } from 'react'
import { useApp } from '../App.jsx'
import '../App.css'

function syntaxHighlight(json) {
    if (typeof json !== 'string') json = JSON.stringify(json, null, 2);
    return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) { cls = /:$/.test(match) ? 'json-key' : 'json-string'; }
            else if (/true|false/.test(match)) { cls = 'json-bool'; }
            return `<span class="${cls}">${match}</span>`;
        }
    );
}

export default function ProofGeneratorPage() {
    const { accounts, services, API, addKafkaEvent, setProofHistory, addNotification, chaosFetch } = useApp();
    const [selected, setSelected] = useState(null);
    const [threshold, setThreshold] = useState(5000);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [proof, setProof] = useState(null);
    const [error, setError] = useState(null);

    const getStepStatus = (s) => {
        if (step === -1 && s <= Math.abs(step)) return 'error';
        if (s < step) return 'done';
        if (s === step) return 'active';
        return 'pending';
    };

    const generate = async () => {
        if (!selected) return;
        setLoading(true); setStep(1); setProof(null); setError(null);

        try {
            addKafkaEvent('system', `Requesting commitment for ${selected.id}`);
            const bankRes = await chaosFetch(`${API.bank}/accounts/${selected.id}/commitment`, { method: 'POST' });
            const bankData = await bankRes.json();
            addKafkaEvent('balance.committed', `Sig: ${bankData.commitment.signature.substring(0, 16)}...`);
            await new Promise(r => setTimeout(r, 700));
            setStep(2);

            addKafkaEvent('system', 'Generating ZK proof in Vault-Core...');
            const vaultRes = await chaosFetch(`${API.vault}/proofs/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: selected.id, balance: bankData._private.balance,
                    threshold: Number(threshold), nonce: bankData._private.nonce,
                    signature: bankData.commitment.signature
                })
            });
            const vaultData = await vaultRes.json();

            if (!vaultData.success) {
                setStep(-1); setError(vaultData.reason || 'Failed'); setLoading(false);
                addKafkaEvent('system', `❌ ${vaultData.reason}`);
                addNotification('error', 'Proof generation failed: eligibility criteria not met');
                return;
            }

            setProof(vaultData.proof);
            setProofHistory(prev => [vaultData.proof, ...prev]);
            addKafkaEvent('proof.generated', `ID: ${vaultData.proof.proofId.substring(0, 12)}...`);
            addNotification('success', `Proof generated in ${vaultData.proof.metadata.computeTimeMs}ms`);
            await new Promise(r => setTimeout(r, 500));
            setStep(3);
            setLoading(false);
        } catch (err) {
            setStep(-1); setError(err.message); setLoading(false);
            addNotification('error', `Error: ${err.message}`);
        }
    };

    const reset = () => { setStep(0); setProof(null); setError(null); };

    return (
        <div>
            <div className="page-header">
                <h1>Proof Generator</h1>
                <p>Generate Zero-Knowledge Proofs for financial eligibility</p>
            </div>

            <div className="section-grid">
                {/* Left: Account + Threshold */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">🏦 Select Account</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {accounts.map(acc => (
                            <div key={acc.id}
                                className={`account-card ${selected?.id === acc.id ? 'account-card--selected' : ''}`}
                                onClick={() => { setSelected(acc); reset(); }}
                            >
                                <div>
                                    <div className="account-card__name">{acc.name}</div>
                                    <div className="account-card__id">{acc.id}</div>
                                </div>
                                <span className={`account-card__tier account-card__tier--${acc.balanceRange}`}>{acc.balanceRange}</span>
                            </div>
                        ))}
                    </div>

                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                        <label>Verification Threshold (USD)</label>
                        <input type="number" className="form-input form-input--mono" value={threshold}
                            onChange={e => setThreshold(e.target.value)} />
                    </div>

                    {step === 0 && (
                        <button className="btn btn--primary btn--full" disabled={!selected || loading} onClick={generate}>
                            {loading ? <><span className="spinner" /> Generating...</> : '🔐 Generate ZK-Proof'}
                        </button>
                    )}
                    {(step === 3 || step === -1) && <button className="btn btn--outline btn--full" onClick={reset}>↺ Reset</button>}
                </div>

                {/* Right: Proof Flow */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">⚡ Generation Pipeline</span>
                        <span>{step === 3 ? '✅' : loading ? '⏳' : '○'}</span>
                    </div>
                    <div className="flow">
                        {[
                            { s: 1, title: 'Request Balance Commitment', desc: 'Bank signs HMAC-SHA256 commitment', meta: 'Kafka → balance.committed' },
                            { s: 2, title: 'Generate Groth16 ZK-Proof', desc: 'BN128 curve, 847 constraints', meta: 'Circuit: eligibility_check_v2' },
                            { s: 3, title: 'Proof Published to Kafka', desc: 'Event-driven delivery to Verifier', meta: 'Kafka → proof.generated' },
                        ].map(item => (
                            <div className="flow__step" key={item.s}>
                                <div className={`flow__dot flow__dot--${getStepStatus(item.s)}`}>
                                    {getStepStatus(item.s) === 'done' ? '✓' : getStepStatus(item.s) === 'active' ? '↻' : item.s}
                                </div>
                                <div className="flow__info">
                                    <div className="flow__title">{item.title}</div>
                                    <div className="flow__desc">{item.desc}</div>
                                    {step >= item.s && <div className="flow__meta">{item.meta}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    {step === -1 && (
                        <div style={{ marginTop: '1rem', padding: '0.7rem', background: 'var(--danger-dim)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.82rem' }}>
                            ❌ {error}
                        </div>
                    )}
                </div>

                {/* Proof JSON */}
                <div className="card full-width">
                    <div className="card__header">
                        <span className="card__title">📋 Generated Proof (JSON)</span>
                        {proof && <span className="badge badge--success">Ready for Verification</span>}
                    </div>
                    {proof ? (
                        <div className="json-viewer" dangerouslySetInnerHTML={{ __html: syntaxHighlight(proof) }} />
                    ) : (
                        <div className="empty">
                            <div className="empty__icon">📄</div>
                            <p className="empty__text">Generate a proof to inspect the Groth16 output here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
