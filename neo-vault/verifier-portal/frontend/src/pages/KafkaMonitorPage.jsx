import { useRef, useEffect } from 'react'
import { useApp } from '../App.jsx'
import '../App.css'

export default function KafkaMonitorPage() {
    const { kafkaEvents, wsConnected } = useApp();
    const consoleRef = useRef(null);

    useEffect(() => {
        if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }, [kafkaEvents]);

    const topicCounts = kafkaEvents.reduce((acc, e) => {
        acc[e.topic] = (acc[e.topic] || 0) + 1;
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header">
                <h1>Kafka Monitor</h1>
                <p>Real-time event stream and message broker analytics</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__label">Total Events</div>
                    <div className="stat-card__value stat-card__value--primary">{kafkaEvents.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Balance Events</div>
                    <div className="stat-card__value stat-card__value--accent">{topicCounts['balance.committed'] || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Proof Events</div>
                    <div className="stat-card__value stat-card__value--warning">{topicCounts['proof.generated'] || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">WebSocket</div>
                    <div className={`stat-card__value ${wsConnected ? 'stat-card__value--success' : ''}`}>
                        {wsConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
            </div>

            <div className="section-grid">
                {/* Topic Breakdown */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">📊 Topic Breakdown</span>
                    </div>
                    <div className="table-wrap">
                        <table className="table">
                            <thead><tr><th>Topic</th><th>Count</th><th>Last Seen</th></tr></thead>
                            <tbody>
                                {Object.entries(topicCounts).map(([topic, count]) => {
                                    const lastEvent = [...kafkaEvents].reverse().find(e => e.topic === topic);
                                    return (
                                        <tr key={topic}>
                                            <td>
                                                <span className={`console__topic console__topic--${topic.includes('balance') ? 'balance' : topic.includes('proof') ? 'proof' : topic.includes('verification') ? 'verification' : 'system'}`}>
                                                    {topic}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{count}</td>
                                            <td className="mono" style={{ fontSize: '0.7rem' }}>{lastEvent?.time || '-'}</td>
                                        </tr>
                                    );
                                })}
                                {Object.keys(topicCounts).length === 0 && (
                                    <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events captured yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Connection Info */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">🔌 Connection Details</span>
                    </div>
                    <div className="settings-group">
                        <div className="settings-row">
                            <span className="settings-row__label">Mode</span>
                            <span className="settings-row__value">In-Memory (Dev)</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Production</span>
                            <span className="settings-row__value">Confluent Kafka 7.5</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Topics</span>
                            <span className="settings-row__value">3 active</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">WebSocket</span>
                            <span className="settings-row__value">ws://localhost:3003/ws</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Status</span>
                            <span className={`badge ${wsConnected ? 'badge--success' : 'badge--danger'}`}>{wsConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                </div>

                {/* Live Stream */}
                <div className="card full-width">
                    <div className="card__header">
                        <span className="card__title">📡 Live Event Stream</span>
                        <span className="badge badge--primary">{kafkaEvents.length} events</span>
                    </div>
                    <div className="console" ref={consoleRef}>
                        {kafkaEvents.length === 0 ? (
                            <div className="empty"><p className="empty__text">Waiting for events... Generate a proof to see messages flow.</p></div>
                        ) : (
                            kafkaEvents.map(e => (
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
            </div>
        </div>
    );
}
