import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../App.jsx'
import './Layout.css'

const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/accounts', icon: '🏦', label: 'Accounts' },
    { path: '/generate', icon: '🔐', label: 'Proof Generator' },
    { path: '/verify', icon: '🛡️', label: 'Verification' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/api-explorer', icon: '🛠️', label: 'API Explorer' },
    { path: '/security', icon: '🛡️', label: 'Security' },
    { path: '/logs', icon: '📜', label: 'System Logs' },
    { path: '/kafka', icon: '📡', label: 'Kafka Monitor' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Layout({ children }) {
    const { user, logout, services, wsConnected, notifications } = useApp();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className={`layout ${sidebarOpen ? 'layout--sidebar-open' : ''}`}>
            {/* Sidebar Overlay (Mobile) */}
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar__brand">
                    <div className="sidebar__logo">🔐</div>
                    <div>
                        <h1 className="sidebar__title">Neo-Vault</h1>
                        <span className="sidebar__version">v2.0 Advanced</span>
                    </div>
                </div>

                <nav className="sidebar__nav">
                    <div className="sidebar__section-label">Main</div>
                    {navItems.slice(0, 5).map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                        >
                            <span className="sidebar__link-icon">{item.icon}</span>
                            <span className="sidebar__link-text">{item.label}</span>
                        </NavLink>
                    ))}
                    <div className="sidebar__section-label" style={{ marginTop: '1rem' }}>System</div>
                    {navItems.slice(5).map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                        >
                            <span className="sidebar__link-icon">{item.icon}</span>
                            <span className="sidebar__link-text">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__services">
                    <div className="sidebar__section-label">Services</div>
                    <div className="sidebar__service">
                        <span className={`sidebar__dot ${services.bank ? 'sidebar__dot--up' : ''}`} />
                        <span>Bank :3001</span>
                    </div>
                    <div className="sidebar__service">
                        <span className={`sidebar__dot ${services.vault ? 'sidebar__dot--up' : ''}`} />
                        <span>Vault :3002</span>
                    </div>
                    <div className="sidebar__service">
                        <span className={`sidebar__dot ${services.verifier ? 'sidebar__dot--up' : ''}`} />
                        <span>Verifier :3003</span>
                    </div>
                    <div className="sidebar__service">
                        <span className={`sidebar__dot ${wsConnected ? 'sidebar__dot--up' : ''}`} />
                        <span>WebSocket</span>
                    </div>
                </div>

                <div className="sidebar__user">
                    <div className="sidebar__avatar">{user?.name?.charAt(0)}</div>
                    <div className="sidebar__user-info">
                        <div className="sidebar__user-name">{user?.name}</div>
                        <div className="sidebar__user-role">{user?.role}</div>
                    </div>
                    <button className="sidebar__logout" onClick={logout} title="Logout">↗</button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main">
                {/* Top Bar */}
                <header className="topbar">
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
                        ☰
                    </button>
                    <div className="topbar__breadcrumb">
                        <span className="topbar__breadcrumb-root">Neo-Vault</span>
                        <span className="topbar__breadcrumb-sep">/</span>
                        <span className="topbar__breadcrumb-page">
                            {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                        </span>
                    </div>
                    <div className="topbar__actions">
                        <div className={`topbar__status ${Object.values(services).every(Boolean) ? 'topbar__status--up' : 'topbar__status--partial'}`}>
                            {Object.values(services).every(Boolean) ? '● All Systems Online' : '○ Partial'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="content">
                    {children}
                </main>
            </div>

            {/* Notifications */}
            <div className="notifications">
                {notifications.map(n => (
                    <div key={n.id} className={`notification notification--${n.type}`}>
                        {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'} {n.message}
                    </div>
                ))}
            </div>
        </div>
    );
}
