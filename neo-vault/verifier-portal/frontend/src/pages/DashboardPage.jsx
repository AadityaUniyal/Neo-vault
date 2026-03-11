import { useApp } from '../App.jsx'
import '../App.css'

export default function DashboardPage() {
    const { services, wsConnected, kafkaEvents, proofHistory, verificationHistory, accounts } = useApp();
    const allUp = services.bank && services.vault && services.verifier;

    return (
        <div>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>System overview and real-time metrics</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__label">Services Online</div>
                    <div className={`stat-card__value ${allUp ? 'stat-card__value--success' : 'stat-card__value--warning'}`}>
                        {Object.values(services).filter(Boolean).length}/3
                    </div>
                    <div className="stat-card__sub">{allUp ? 'All systems operational' : 'Some services down'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Proofs Generated</div>
                    <div className="stat-card__value stat-card__value--primary">{proofHistory.length}</div>
                    <div className="stat-card__sub">Total ZK proofs created</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Verifications</div>
                    <div className="stat-card__value stat-card__value--accent">{verificationHistory.length}</div>
                    <div className="stat-card__sub">Proofs verified</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Kafka Events</div>
                    <div className="stat-card__value stat-card__value--warning">{kafkaEvents.length}</div>
                    <div className="stat-card__sub">Messages processed</div>
                </div>
            </div>

            <div className="section-grid">
                {/* Architecture */}
                <div className="card full-width">
                    <div className="card__header">
                        <span className="card__title">🏗️ System Architecture</span>
                        <span className="badge badge--primary">Live</span>
                    </div>
                    <div className="arch">
                        <div className={`arch__node ${services.bank ? 'arch__node--active' : ''}`}>
                            <span className="arch__node-icon">🏦</span>
                            <span className="arch__node-name">Bank Service</span>
                            <span className="arch__node-port">:3001</span>
                        </div>
                        <span className={`arch__arrow ${services.bank ? 'arch__arrow--active' : ''}`}>→</span>
                        <div className="arch__node">
                            <span className="arch__node-icon">📡</span>
                            <span className="arch__node-name">Kafka Bus</span>
                            <span className="arch__node-port">Event Stream</span>
                        </div>
                        <span className="arch__arrow">→</span>
                        <div className={`arch__node ${services.vault ? 'arch__node--active' : ''}`}>
                            <span className="arch__node-icon">🔒</span>
                            <span className="arch__node-name">Vault Core</span>
                            <span className="arch__node-port">:3002</span>
                        </div>
                        <span className="arch__arrow">→</span>
                        <div className={`arch__node ${services.verifier ? 'arch__node--active' : ''}`}>
                            <span className="arch__node-icon">🛡️</span>
                            <span className="arch__node-name">Verifier</span>
                            <span className="arch__node-port">:3003</span>
                        </div>
                        <span className="arch__arrow">→</span>
                        <div className={`arch__node ${wsConnected ? 'arch__node--active' : ''}`}>
                            <span className="arch__node-icon">✅</span>
                            <span className="arch__node-name">Result</span>
                            <span className="arch__node-port">WebSocket</span>
                        </div>
                    </div>
                </div>

                {/* Recent Kafka Events */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">📡 Recent Events</span>
                        <span className="badge badge--accent">{kafkaEvents.length}</span>
                    </div>
                    <div className="console" style={{ maxHeight: '250px' }}>
                        {kafkaEvents.length === 0 ? (
                            <div className="empty"><p className="empty__text">No events yet</p></div>
                        ) : (
                            kafkaEvents.slice(-15).map(e => (
                                <div className="console__line" key={e.id}>
                                    <span className="console__time">{e.time}</span>
                                    <span className={`console__topic console__topic--${e.topic.includes('balance') ? 'balance' : e.topic.includes('proof') ? 'proof' : e.topic.includes('verification') ? 'verification' : 'system'}`}>
                                        {e.topic}
                                    </span>
                                    <span className="console__msg">{e.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Verifications */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">🛡️ Recent Verifications</span>
                    </div>
                    {verificationHistory.length === 0 ? (
                        <div className="empty">
                            <div className="empty__icon">🔐</div>
                            <p className="empty__text">No verifications yet.<br />Go to Proof Generator to create one.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr><th>Proof ID</th><th>Threshold</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {verificationHistory.slice(0, 5).map((v, i) => (
                                        <tr key={i}>
                                            <td className="mono">{v.proofId?.substring(0, 12)}...</td>
                                            <td>${v.threshold?.toLocaleString()}</td>
                                            <td><span className={`badge ${v.verified ? 'badge--success' : 'badge--danger'}`}>{v.verified ? 'Verified' : 'Rejected'}</span></td>
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
