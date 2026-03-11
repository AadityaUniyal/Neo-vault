import React, { useState, useMemo } from 'react';
import { useApp } from '../App.jsx';
import '../App.css';

export default function SystemLogsPage() {
    const { systemLogs } = useApp();
    const [filter, setFilter] = useState('ALL');
    const [levelFilter, setLevelFilter] = useState('ALL');

    const filteredLogs = useMemo(() => {
        return systemLogs.filter(log => {
            const matchSvc = filter === 'ALL' || log.service === filter;
            const matchLevel = levelFilter === 'ALL' || log.level === levelFilter;
            return matchSvc && matchLevel;
        });
    }, [systemLogs, filter, levelFilter]);

    const serviceColors = {
        Bank: '#0066ff',
        Vault: '#8b5cf6',
        Verifier: '#10b981',
        System: '#94a3b8'
    };

    return (
        <div className="logs-page">
            <div className="page-header">
                <h1>System Logs</h1>
                <p>Real-time log aggregation from all microservices</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card__header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SERVICE:</span>
                        {['ALL', 'Bank', 'Vault', 'Verifier'].map(s => (
                            <button
                                key={s}
                                className={`btn btn--sm ${filter === s ? 'btn--primary' : 'btn--outline'}`}
                                onClick={() => setFilter(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>LEVEL:</span>
                        {['ALL', 'INFO', 'WARN', 'ERROR'].map(l => (
                            <button
                                key={l}
                                className={`btn btn--sm ${levelFilter === l ? 'btn--primary' : 'btn--outline'}`}
                                onClick={() => setLevelFilter(l)}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <span className="badge badge--accent">{filteredLogs.length} LOGS MATCHING</span>
                    </div>
                </div>

                <div className="console" style={{ minHeight: '500px', maxHeight: '70vh' }}>
                    {filteredLogs.length === 0 ? (
                        <div className="empty">
                            <div className="empty__icon">📑</div>
                            <p className="empty__text">No logs found for selected filters.<br />Logs will appear as services are used.</p>
                        </div>
                    ) : (
                        filteredLogs.map(log => (
                            <div className="console__line" key={log.id}>
                                <span className="console__time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span
                                    className="console__topic"
                                    style={{
                                        backgroundColor: `${serviceColors[log.service]}22`,
                                        color: serviceColors[log.service],
                                        border: `1px solid ${serviceColors[log.service]}44`
                                    }}
                                >
                                    {log.service.toUpperCase()}
                                </span>
                                <span
                                    className={`badge ${log.level === 'ERROR' ? 'badge--danger' : log.level === 'WARN' ? 'badge--warning' : 'badge--primary'}`}
                                    style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', height: 'fit-content' }}
                                >
                                    {log.level}
                                </span>
                                <span className="console__msg">{log.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
