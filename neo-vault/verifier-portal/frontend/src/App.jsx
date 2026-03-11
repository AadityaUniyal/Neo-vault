import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AccountsPage from './pages/AccountsPage.jsx'
import ProofGeneratorPage from './pages/ProofGeneratorPage.jsx'
import VerificationPage from './pages/VerificationPage.jsx'
import KafkaMonitorPage from './pages/KafkaMonitorPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import APIExplorerPage from './pages/APIExplorerPage.jsx'
import SecurityPage from './pages/SecurityPage.jsx'
import SystemLogsPage from './pages/SystemLogsPage.jsx'

// API Configuration
const API = {
    bank: 'http://localhost:3001/api/v1',
    vault: 'http://localhost:3002/api/v1',
    verifier: 'http://localhost:3003/api/v1',
    ws: 'ws://localhost:3003/ws'
};

// Global Context
export const AppContext = createContext(null);

export function useApp() {
    return useContext(AppContext);
}

function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('neo-vault-user');
        return saved ? JSON.parse(saved) : null;
    });
    const [services, setServices] = useState({ bank: false, vault: false, verifier: false });
    const [wsConnected, setWsConnected] = useState(false);
    const [chaosMode, setChaosMode] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [kafkaEvents, setKafkaEvents] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [proofHistory, setProofHistory] = useState([]);
    const [verificationHistory, setVerificationHistory] = useState([]);
    const [systemLogs, setSystemLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const wsRef = useRef(null);

    // Authentication
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('neo-vault-user', JSON.stringify(userData));
        addNotification('success', `Welcome back, ${userData.name} !`);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('neo-vault-user');
    };

    // Notifications
    const addNotification = useCallback((type, message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    }, []);

    // Kafka Events
    const addKafkaEvent = useCallback((topic, message) => {
        setKafkaEvents(prev => [...prev.slice(-200), {
            id: Date.now() + Math.random(),
            time: new Date().toLocaleTimeString(),
            topic,
            message
        }]);
    }, []);

    // WebSocket Connection
    useEffect(() => {
        if (!user) return;
        function connect() {
            try {
                const ws = new WebSocket(API.ws);
                wsRef.current = ws;
                ws.onopen = () => {
                    setWsConnected(true);
                    addKafkaEvent('system', 'WebSocket connected');
                };
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'KAFKA_EVENT') {
                        addKafkaEvent(data.topic, `Offset: ${data.offset} `);
                    }
                    if (data.type === 'VERIFICATION_RESULT') {
                        setVerificationHistory(prev => [data, ...prev]);
                        addNotification(data.verified ? 'success' : 'error',
                            `Proof ${data.proofId?.substring(0, 8)}... ${data.verified ? 'VERIFIED ✅' : 'REJECTED ❌'} `
                        );
                    }
                    if (data.type === 'SYSTEM_LOG') {
                        setSystemLogs(prev => [data, ...prev.slice(0, 199)]); // Keep last 200 logs
                    }
                };
                ws.onclose = () => { setWsConnected(false); setTimeout(connect, 3000); };
                ws.onerror = () => setWsConnected(false);
            } catch (e) {
                setTimeout(connect, 3000);
            }
        }
        connect();
        return () => wsRef.current?.close();
    }, [user, addKafkaEvent, addNotification]);

    // Health Checks
    useEffect(() => {
        if (!user) return;
        async function check() {
            const test = async (url) => { try { return (await fetch(`${url}/health`)).ok; } catch { return false; } };
            setServices({
                bank: await test(API.bank),
                vault: await test(API.vault),
                verifier: await test(API.verifier)
            });
        }
        check();
        const i = setInterval(check, 10000);
        return () => clearInterval(i);
    }, [user]);

    // Load Accounts
    useEffect(() => {
        if (!services.bank) return;
        fetch(`${API.bank}/accounts`)
            .then(r => r.json())
            .then(d => setAccounts(d.accounts || []))
            .catch(() => { });
    }, [services.bank]);

    const contextValue = {
        user, login, logout, services, wsConnected, kafkaEvents, addKafkaEvent,
        accounts, proofHistory, setProofHistory, verificationHistory, setVerificationHistory,
        systemLogs, setSystemLogs,
        notifications, addNotification, API,
        chaosMode, setChaosMode, darkMode, setDarkMode, chaosFetch
    };

    if (!user) return <LoginPage onLogin={login} />;

    return (
        <AppContext.Provider value={contextValue}>
            <Layout>
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/generate" element={<ProofGeneratorPage />} />
                    <Route path="/verify" element={<VerificationPage />} />
                    <Route path="/kafka" element={<KafkaMonitorPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/api-explorer" element={<APIExplorerPage />} />
                    <Route path="/logs" element={<SystemLogsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Layout>
        </AppContext.Provider>
    );
}

export default App
