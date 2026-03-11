import { useApp } from '../App.jsx'
import '../App.css'

export default function SettingsPage() {
    const { user, services, wsConnected, chaosMode, setChaosMode, darkMode, setDarkMode } = useApp();

    return (
        <div>
            <div className="page-header">
                <h1>Settings</h1>
                <p>System configuration and connection details</p>
            </div>

            <div className="section-grid">
                {/* System Resilience (Chaos Mode) */}
                <div className="card full-width">
                    <div className="card__header">
                        <span className="card__title">🚀 Institutional Grade Features</span>
                        <div className="badge badge--accent">New</div>
                    </div>
                    <div className="settings-group">
                        <div className="settings-row">
                            <div className="settings-row__label">
                                <strong style={{ display: 'block' }}>Network Chaos Mode</strong>
                                <small style={{ color: 'var(--text-muted)' }}>Simulate high-latency and intermittent service failures</small>
                            </div>
                            <button
                                className={`btn ${chaosMode ? 'btn--primary' : 'btn--outline'}`}
                                onClick={() => setChaosMode(!chaosMode)}
                                style={{ width: '120px' }}
                            >
                                {chaosMode ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                        <div className="settings-row">
                            <div className="settings-row__label">
                                <strong style={{ display: 'block' }}>Visual Theme</strong>
                                <small style={{ color: 'var(--text-muted)' }}>Switch between Institutional Dark and Arctic Light themes</small>
                            </div>
                            <button
                                className="btn btn--outline"
                                onClick={() => setDarkMode(!darkMode)}
                                style={{ width: '120px' }}
                            >
                                {darkMode ? '🌙 Dark' : '☀️ Light'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">👤 User Profile</span>
                    </div>
                    <div className="settings-group">
                        <div className="settings-row">
                            <span className="settings-row__label">Name</span>
                            <span className="settings-row__value">{user?.name}</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Email</span>
                            <span className="settings-row__value">{user?.email}</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Role</span>
                            <span className="settings-row__value">{user?.role}</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Login Time</span>
                            <span className="settings-row__value">{user?.loginTime ? new Date(user.loginTime).toLocaleString() : '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Services */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">🔧 Service Endpoints</span>
                    </div>
                    <div className="settings-group">
                        <div className="settings-row">
                            <span className="settings-row__label">Bank Service</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="settings-row__value">http://localhost:3001</span>
                                <span className={`badge ${services.bank ? 'badge--success' : 'badge--danger'}`}>{services.bank ? 'UP' : 'DOWN'}</span>
                            </div>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Vault Core</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="settings-row__value">http://localhost:3002</span>
                                <span className={`badge ${services.vault ? 'badge--success' : 'badge--danger'}`}>{services.vault ? 'UP' : 'DOWN'}</span>
                            </div>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Verifier</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="settings-row__value">http://localhost:3003</span>
                                <span className={`badge ${services.verifier ? 'badge--success' : 'badge--danger'}`}>{services.verifier ? 'UP' : 'DOWN'}</span>
                            </div>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">WebSocket</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="settings-row__value">ws://localhost:3003/ws</span>
                                <span className={`badge ${wsConnected ? 'badge--success' : 'badge--danger'}`}>{wsConnected ? 'UP' : 'DOWN'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Crypto Config */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">🔐 Cryptographic Configuration</span>
                    </div>
                    <div className="settings-group">
                        <div className="settings-row">
                            <span className="settings-row__label">ZKP Protocol</span>
                            <span className="settings-row__value">Groth16</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Curve</span>
                            <span className="settings-row__value">BN128</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Signing Algorithm</span>
                            <span className="settings-row__value">HMAC-SHA256</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Commitment</span>
                            <span className="settings-row__value">Pedersen</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Constraints</span>
                            <span className="settings-row__value">847</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Wire Count</span>
                            <span className="settings-row__value">1,024</span>
                        </div>
                    </div>
                </div>

                {/* Infrastructure */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">🏗️ Infrastructure</span>
                    </div>
                    <div className="settings-group">
                        <div className="settings-row">
                            <span className="settings-row__label">Mode</span>
                            <span className="settings-row__value">Development (In-Memory)</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Message Broker</span>
                            <span className="settings-row__value">Kafka Simulator</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Production Broker</span>
                            <span className="settings-row__value">Confluent Kafka 7.5</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Container Runtime</span>
                            <span className="settings-row__value">Docker Compose v3.8</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-row__label">Circuit File</span>
                            <span className="settings-row__value">eligibility.circom</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
