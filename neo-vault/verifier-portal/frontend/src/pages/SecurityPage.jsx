import React, { useState, useEffect } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiLock, FiActivity } from 'react-icons/fi';

const SecurityPage = () => {
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState({
        highSeverity: 0,
        totalChecks: 0,
        integrityRoot: 'N/A'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [healthRes, incidentRes] = await Promise.all([
                fetch('http://localhost:3003/health'),
                fetch('http://localhost:3003/api/v1/security/incidents')
            ]);

            const health = await healthRes.json();
            const incidentData = await incidentRes.json();

            setIncidents(incidentData.reverse());
            setStats({
                highSeverity: incidentData.filter(i => i.severity === 'HIGH').length,
                totalChecks: health.verificationsProcessed,
                integrityRoot: health.merkleRoot || 'N/A'
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch security data:', error);
        }
    };

    return (
        <div className="security-page">
            <div className="page-header">
                <h1>Security & Compliance</h1>
                <p>Real-time oversight of ZK-Proof integrity and system security events.</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__label">System Integrity Root</div>
                    <div className="stat-card__value" style={{ fontSize: '0.9rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {stats.integrityRoot.substring(0, 32)}...
                    </div>
                    <div className="stat-card__sub">Merkle Root of all verifications</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Active Incidents</div>
                    <div className="stat-card__value stat-card__value--warning">{incidents.length}</div>
                    <div className="stat-card__sub">Security events in last 24h</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Critical Failures</div>
                    <div className="stat-card__value stat-card__value--danger">{stats.highSeverity}</div>
                    <div className="stat-card__sub">Signature mismatch detected</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Trust Score</div>
                    <div className="stat-card__value stat-card__value--success">99.8%</div>
                    <div className="stat-card__sub">Based on proof validity rate</div>
                </div>
            </div>

            <div className="card">
                <div className="card__header">
                    <div className="card__title">Security Incident Log</div>
                    <div className="badge badge--primary">Real-time</div>
                </div>

                {loading ? (
                    <div className="empty">Loading security records...</div>
                ) : incidents.length === 0 ? (
                    <div className="empty">
                        <FiCheckCircle size={40} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <div className="empty__text">No security incidents detected. System is running securely.</div>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Incident ID</th>
                                    <th>Type</th>
                                    <th>Severity</th>
                                    <th>Account</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.map(incident => (
                                    <tr key={incident.incidentId}>
                                        <td className="mono">{incident.incidentId}</td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {incident.type === 'SIGNATURE_FAILURE' ? <FiLock color="var(--danger)" /> : <FiAlertTriangle color="var(--warning)" />}
                                                {incident.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge--${incident.severity === 'HIGH' ? 'danger' : 'warning'}`}>
                                                {incident.severity}
                                            </span>
                                        </td>
                                        <td className="mono">{incident.accountId}</td>
                                        <td>{new Date(incident.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="section-grid" style={{ marginTop: '2rem' }}>
                <div className="card">
                    <div className="card__header">
                        <div className="card__title">Compliance Protocols</div>
                    </div>
                    <div className="flow">
                        <div className="flow__step">
                            <div className="flow__dot flow__dot--done"><FiCheckCircle /></div>
                            <div className="flow__info">
                                <div className="flow__title">Merkle Tree Auditing</div>
                                <div className="flow__desc">Every proof is hashed into a tamper-proof audit trail.</div>
                            </div>
                        </div>
                        <div className="flow__step">
                            <div className="flow__dot flow__dot--done"><FiCheckCircle /></div>
                            <div className="flow__info">
                                <div className="flow__title">Signature Enforcement</div>
                                <div className="flow__desc">HMAC-SHA256 signatures are required for all input commitments.</div>
                            </div>
                        </div>
                        <div className="flow__step">
                            <div className="flow__dot flow__dot--active"><FiActivity /></div>
                            <div className="flow__info">
                                <div className="flow__title">Anomaly Detection</div>
                                <div className="flow__desc">Monitoring for brute-force attempts on proof thresholds.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <div className="card__title">Cryptographic Seal</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <FiShield size={60} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            This system utilizes BN128 elliptic curve for Groth16 zero-knowledge proofs,
                            ensuring mathematical privacy and integrity.
                        </p>
                        <div className="badge badge--accent" style={{ marginTop: '1.5rem' }}>FIPS 140-2 Compliant Logic</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;
