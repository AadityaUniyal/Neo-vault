import { useState } from 'react'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('admin@neovault.io');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const demoUsers = [
        { email: 'admin@neovault.io', password: 'admin123', name: 'Alex Morgan', role: 'System Admin' },
        { email: 'analyst@jpmc.com', password: 'analyst', name: 'Sarah Chen', role: 'Risk Analyst' },
        { email: 'auditor@bank.com', password: 'auditor', name: 'James Park', role: 'Compliance Auditor' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        await new Promise(r => setTimeout(r, 1200));

        const user = demoUsers.find(u => u.email === email && u.password === password);
        if (user) {
            onLogin({ ...user, loginTime: new Date().toISOString() });
        } else {
            setError('Invalid credentials. Try a demo account.');
            setLoading(false);
        }
    };

    const quickLogin = (u) => {
        setEmail(u.email);
        setPassword(u.password);
    };

    return (
        <div className="login-page">
            <div className="login-bg"></div>

            <div className="login-container">
                {/* Left Panel */}
                <div className="login-hero">
                    <div className="login-hero__content">
                        <div className="login-hero__badge">ENTERPRISE SECURITY</div>
                        <h1 className="login-hero__title">
                            Neo-Vault
                            <span className="login-hero__glow">Privacy Engine</span>
                        </h1>
                        <p className="login-hero__desc">
                            Zero-Knowledge Proof based financial verification.
                            Prove eligibility without revealing sensitive data.
                        </p>

                        <div className="login-hero__features">
                            <div className="login-hero__feature">
                                <span className="login-hero__feature-icon">🔐</span>
                                <div>
                                    <strong>ZK-Proofs</strong>
                                    <span>Groth16 protocol on BN128 curve</span>
                                </div>
                            </div>
                            <div className="login-hero__feature">
                                <span className="login-hero__feature-icon">📡</span>
                                <div>
                                    <strong>Event-Driven</strong>
                                    <span>Apache Kafka message streaming</span>
                                </div>
                            </div>
                            <div className="login-hero__feature">
                                <span className="login-hero__feature-icon">🛡️</span>
                                <div>
                                    <strong>HMAC-SHA256</strong>
                                    <span>Cryptographic commitment signing</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="login-form-panel">
                    <div className="login-form-wrapper">
                        <div className="login-form__header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to access the verification dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="login-field">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@neovault.io"
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && <div className="login-error">{error}</div>}

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? (
                                    <><span className="login-spinner"></span> Authenticating...</>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="login-demo">
                            <div className="login-demo__label">Quick Access (Demo Users)</div>
                            {demoUsers.map(u => (
                                <button key={u.email} className="login-demo__user" onClick={() => quickLogin(u)}>
                                    <div className="login-demo__avatar">{u.name.charAt(0)}</div>
                                    <div>
                                        <div className="login-demo__name">{u.name}</div>
                                        <div className="login-demo__role">{u.role}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
