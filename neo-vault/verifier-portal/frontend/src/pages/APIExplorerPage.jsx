import React, { useState } from 'react';
import { useApp } from '../App.jsx';
import '../App.css';

const ENDPOINTS = [
    {
        service: 'Bank Service',
        port: 3001,
        methods: [
            { method: 'GET', path: '/health', desc: 'Service health check' },
            { method: 'GET', path: '/accounts', desc: 'List all test accounts' },
            { method: 'POST', path: '/accounts/:id/commitment', desc: 'Generate signed balance commitment' },
        ]
    },
    {
        service: 'Vault Core',
        port: 3002,
        methods: [
            { method: 'GET', path: '/health', desc: 'Service health check' },
            { method: 'POST', path: '/proofs/generate', desc: 'Generate ZK-Proof from commitment' },
            { method: 'GET', path: '/proofs/history', desc: 'View local proof generation history' },
        ]
    },
    {
        service: 'Verifier Service',
        port: 3003,
        methods: [
            { method: 'GET', path: '/health', desc: 'Service health check' },
            { method: 'POST', path: '/verify', desc: 'Verify a ZK-Proof (Groth16)' },
            { method: 'GET', path: '/verifications', desc: 'View verification history' },
            { method: 'GET', path: '/kafka/stream', desc: 'Fetch recent Kafka events from buffer' },
        ]
    }
];

export default function APIExplorerPage() {
    const { API, addNotification } = useApp();
    const [activeTab, setActiveTab] = useState(0);
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);

    const testEndpoint = async (svc, method, path) => {
        setTesting(true);
        setTestResult(null);

        // Construct full URL (handle path params for demo)
        let url = `${API[svc.split(' ')[0].toLowerCase()]}${path.replace(':id', 'ACC-001')}`;

        try {
            const res = await fetch(url, { method });
            const data = await res.json();
            setTestResult({
                status: res.status,
                url,
                data
            });
            addNotification('success', `API Call Success: ${path}`);
        } catch (err) {
            setTestResult({
                status: 'Error',
                url,
                error: err.message
            });
            addNotification('error', `API Call Failed: ${err.message}`);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="api-explorer">
            <div className="page-header">
                <h1>API Explorer</h1>
                <p>Interactive documentation for Neo-Vault Microservices</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card__header">
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {ENDPOINTS.map((svc, i) => (
                            <button
                                key={i}
                                className={`btn ${activeTab === i ? 'btn--primary' : 'btn--outline'}`}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                                onClick={() => { setActiveTab(i); setTestResult(null); }}
                            >
                                {svc.service}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Path</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ENDPOINTS[activeTab].methods.map((m, i) => (
                                <tr key={i}>
                                    <td>
                                        <span className={`badge ${m.method === 'GET' ? 'badge--primary' : 'badge--accent'}`}>
                                            {m.method}
                                        </span>
                                    </td>
                                    <td className="mono">{m.path}</td>
                                    <td style={{ fontSize: '0.75rem' }}>{m.desc}</td>
                                    <td>
                                        <button
                                            className="btn btn--outline btn--sm"
                                            onClick={() => testEndpoint(ENDPOINTS[activeTab].service, m.method, m.path)}
                                            disabled={testing || m.path.includes(':id')} // Simple disable for param paths in explorer
                                        >
                                            {m.path.includes(':id') ? 'Demo Only' : 'Try It Out'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {testResult && (
                <div className="card full-width">
                    <div className="card__header">
                        <span className="card__title">🚀 Response Panel</span>
                        <span className={`badge ${testResult.status === 200 ? 'badge--success' : 'badge--danger'}`}>
                            Status: {testResult.status}
                        </span>
                    </div>
                    <div className="settings-group" style={{ marginBottom: '0.5rem', background: 'var(--bg-0)' }}>
                        <div className="settings-row">
                            <span className="settings-row__label">Request URL</span>
                            <span className="settings-row__value" style={{ color: 'var(--primary)' }}>{testResult.url}</span>
                        </div>
                    </div>
                    <div className="json-viewer" style={{ maxHeight: '300px' }}>
                        {JSON.stringify(testResult.data || testResult.error, null, 2)}
                    </div>
                </div>
            )}

            {testing && (
                <div className="empty">
                    <span className="spinner" style={{ width: 24, height: 24 }}></span>
                    <p className="empty__text">Invoking API endpoint...</p>
                </div>
            )}
        </div>
    );
}
