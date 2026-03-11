import { useApp } from '../App.jsx'
import '../App.css'

export default function VerificationPage() {
    const { verificationHistory, proofHistory, API, addNotification, setVerificationHistory, addKafkaEvent, chaosFetch } = useApp();

    const verifyLatest = async () => {
        if (proofHistory.length === 0) {
            addNotification('error', 'No proofs available. Generate one first.');
            return;
        }
        const latestProof = proofHistory[0];
        try {
            const res = await chaosFetch(`${API.verifier}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proof: latestProof })
            });
            const data = await res.json();
            setVerificationHistory(prev => [{ ...data, proofId: latestProof.proofId }, ...prev]);
            addKafkaEvent('verification.result', `${data.verified ? 'VALID' : 'INVALID'}`);
            addNotification(data.verified ? 'success' : 'error',
                `Proof ${latestProof.proofId.substring(0, 8)}... ${data.verified ? 'VERIFIED' : 'REJECTED'}`
            );
        } catch (err) {
            addNotification('error', 'Verifier service unavailable');
        }
    };

    const downloadEvidence = (v) => {
        const evidence = {
            verificationId: v.proofId,
            timestamp: v.timestamp,
            verified: v.verified,
            auditTrail: v.audit,
            details: v.details,
            systemSeal: 'NEO-VAULT-INSTITUTIONAL-v3.0-GROTH16'
        };
        const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evidence-${v.proofId.substring(0, 8)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addNotification('info', 'Verification evidence exported');
    };

    const latest = verificationHistory[0];

    return (
        <div>
            <div className="page-header">
                <h1>Verification Portal</h1>
                <p>Verify ZK-proofs without accessing sensitive financial data</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__label">Total Verifications</div>
                    <div className="stat-card__value stat-card__value--primary">{verificationHistory.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Verified</div>
                    <div className="stat-card__value stat-card__value--success">{verificationHistory.filter(v => v.verified).length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Rejected</div>
                    <div className="stat-card__value" style={{ color: 'var(--danger)' }}>{verificationHistory.filter(v => !v.verified).length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Available Proofs</div>
                    <div className="stat-card__value stat-card__value--accent">{proofHistory.length}</div>
                </div>
            </div>

            <div className="section-grid">
                {/* Verify Action */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">🛡️ Verify Latest Proof</span>
                    </div>

                    {latest ? (
                        <div className="result">
                            <div className="result__icon">{latest.verified ? '🔓' : '🚫'}</div>
                            <div className={`result__status result__status--${latest.verified ? 'success' : 'failure'}`}>
                                {latest.verified ? 'ELIGIBLE — VERIFIED' : 'NOT ELIGIBLE'}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.5rem 0' }}>
                                {latest.verified ? 'Balance meets threshold. Actual amount NOT revealed.' : 'Proof verification failed.'}
                            </p>
                            {latest.details && (
                                <div className="result__details">
                                    <div className="result__detail">
                                        <span className="result__detail-label">Signature</span>
                                        <span className="result__detail-value">{latest.details.signatureValid ? '✅ Valid' : '❌ Invalid'}</span>
                                    </div>
                                    <div className="result__detail">
                                        <span className="result__detail-label">Balance Revealed</span>
                                        <span className="result__detail-value">🔒 No (ZKP)</span>
                                    </div>
                                    <div className="result__detail">
                                        <span className="result__detail-label">Protocol</span>
                                        <span className="result__detail-value">{latest.details?.protocol || 'groth16'}</span>
                                    </div>
                                    <div className="result__detail">
                                        <span className="result__detail-label">Threshold</span>
                                        <span className="result__detail-value">${latest.details?.threshold?.toLocaleString() || latest.threshold?.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty">
                            <div className="empty__icon">🔐</div>
                            <p className="empty__text">No verification results yet.</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn btn--primary" style={{ flex: 1 }} onClick={verifyLatest} disabled={proofHistory.length === 0}>
                            🛡️ Verify Latest Proof
                        </button>
                        {latest && (
                            <button className="btn btn--outline" onClick={() => downloadEvidence(latest)} title="Export Evidence">
                                📥 Export
                            </button>
                        )}
                    </div>
                </div>

                {/* Verification History */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">📋 Verification History</span>
                        <span className="badge badge--accent">{verificationHistory.length}</span>
                    </div>
                    {verificationHistory.length === 0 ? (
                        <div className="empty">
                            <div className="empty__icon">📊</div>
                            <p className="empty__text">History will appear here after verifications.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr><th>Proof ID</th><th>Threshold</th><th>Time</th><th>Result</th></tr>
                                </thead>
                                <tbody>
                                    {verificationHistory.map((v, i) => (
                                        <tr key={i}>
                                            <td className="mono">{(v.proofId || '').substring(0, 12)}...</td>
                                            <td>${(v.threshold || v.details?.threshold || 0).toLocaleString()}</td>
                                            <td className="mono" style={{ fontSize: '0.7rem' }}>{v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : '-'}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span className={`badge ${v.verified ? 'badge--success' : 'badge--danger'}`}>{v.verified ? 'Verified' : 'Rejected'}</span>
                                                    <button className="btn btn--sm btn--outline" onClick={() => downloadEvidence(v)} style={{ padding: '0.2rem 0.4rem', marginLeft: '0.5rem' }}>
                                                        📥
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
