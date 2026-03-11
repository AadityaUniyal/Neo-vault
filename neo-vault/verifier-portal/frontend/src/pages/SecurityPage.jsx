import React, { useState, useEffect } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiLock, FiActivity, FiCpu, FiTrendingUp } from 'react-icons/fi';
import './SecurityPage.css';

const SecurityPage = () => {
    const [incidents, setIncidents] = useState([]);
    const [summary, setSummary] = useState({
        totalIncidents: 0,
        systemThreatLevel: 'LOW'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const summaryRes = await fetch('http://localhost:3005/api/v1/security/summary');
            const summaryData = await summaryRes.json();
            
            setSummary({
                totalIncidents: summaryData.total_incidents,
                systemThreatLevel: summaryData.system_threat_level
            });
            setIncidents(summaryData.incidents.reverse());
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch security data:', error);
        }
    };

    return (
        <div className="security-page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FiShield size={32} color="var(--primary)" />
                    <div>
                        <h1>Advanced AI Security Oversight</h1>
                        <p>Real-time ML-powered anomaly detection and threat hunting.</p>
                    </div>
                </div>
                <div className="badge badge--accent" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
                    <FiCpu style={{ marginRight: '0.5rem' }} /> ML Engine: Active
                </div>
            </div>

            <div className="threat-map-container glass-card">
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Live Threat Visualization</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>Monitoring Kafka Stream: balance.committed</p>
                </div>
                {/* Decorative particles to simulate activity */}
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i} 
                        className="threat-node" 
                        style={{ 
                            top: `${Math.random() * 100}%`, 
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }} 
                    />
                ))}
            </div>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-card__label">System Threat Level</div>
                    <div className={`stat-card__value ${summary.systemThreatLevel !== 'LOW' ? 'stat-card__value--warning' : 'stat-card__value--success'}`}>
                        {summary.systemThreatLevel}
                    </div>
                    <div className="stat-card__sub">Real-time model inference</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-card__label">Detected Anomalies</div>
                    <div className="stat-card__value stat-card__value--danger">{summary.totalIncidents}</div>
                    <div className="stat-card__sub">Suspicious patterns in last 1h</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-card__label">ML Confidence</div>
                    <div className="stat-card__value">94.2%</div>
                    <div className="risk-meter">
                        <div className="risk-fill" style={{ width: '94.2%', background: 'var(--primary)' }}></div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-card__label">Trust Score</div>
                    <div className="stat-card__value stat-card__value--success">99.9%</div>
                    <div className="stat-card__sub">Integrity verification rate</div>
                </div>
            </div>

            <div className="card glass-card" style={{ marginTop: '2rem' }}>
                <div className="card__header">
                    <div className="card__title">Intelligence Feed</div>
                    <div className="badge badge--primary">Live ML Stream</div>
                </div>

                {loading ? (
                    <div className="empty">Initializing Neural Core...</div>
                ) : incidents.length === 0 ? (
                    <div className="empty">
                        <FiCheckCircle size={40} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <div className="empty__text">No anomalies detected by AI patterns.</div>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Signal ID</th>
                                    <th>Pattern Type</th>
                                    <th>Severity</th>
                                    <th>Vector</th>
                                    <th>Detected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.map(incident => (
                                    <tr key={incident.incidentId}>
                                        <td className="mono">{incident.incidentId}</td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {incident.severity === 'HIGH' ? <FiLock color="var(--danger)" /> : <FiAlertTriangle color="var(--warning)" />}
                                                {incident.type.replace(/_/g, ' ')}
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
        </div>
    );
};

export default SecurityPage;
