import { useApp } from '../App.jsx'
import '../App.css'

export default function AccountsPage() {
    const { accounts, services } = useApp();

    return (
        <div>
            <div className="page-header">
                <h1>Bank Accounts</h1>
                <p>View registered accounts from the Bank Service</p>
            </div>

            {!services.bank ? (
                <div className="card">
                    <div className="empty">
                        <div className="empty__icon">⏳</div>
                        <p className="empty__text">Bank Service is offline.<br />Start the backend to see accounts.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-card__label">Total Accounts</div>
                            <div className="stat-card__value stat-card__value--primary">{accounts.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__label">High Tier</div>
                            <div className="stat-card__value stat-card__value--success">{accounts.filter(a => a.balanceRange === 'HIGH').length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__label">Medium Tier</div>
                            <div className="stat-card__value stat-card__value--warning">{accounts.filter(a => a.balanceRange === 'MEDIUM').length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__label">Low Tier</div>
                            <div className="stat-card__value">{accounts.filter(a => a.balanceRange === 'LOW').length}</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card__header">
                            <span className="card__title">🏦 Account Registry</span>
                            <span className="badge badge--primary">{accounts.length} accounts</span>
                        </div>
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Account ID</th>
                                        <th>Name</th>
                                        <th>Currency</th>
                                        <th>Balance Tier</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map(acc => (
                                        <tr key={acc.id}>
                                            <td className="mono">{acc.id}</td>
                                            <td style={{ fontWeight: 500 }}>{acc.name}</td>
                                            <td>{acc.currency}</td>
                                            <td>
                                                <span className={`badge badge--${acc.balanceRange === 'HIGH' ? 'success' : acc.balanceRange === 'MEDIUM' ? 'warning' : 'danger'}`}>
                                                    {acc.balanceRange}
                                                </span>
                                            </td>
                                            <td><span className="badge badge--success">Active</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
