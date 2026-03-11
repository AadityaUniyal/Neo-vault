import React from 'react';
import { useApp } from '../App.jsx';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import '../App.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
    const { proofHistory, verificationHistory, kafkaEvents } = useApp();

    // Prepare data for performance chart (Proof Generation Time)
    const perfData = proofHistory.slice(-10).reverse().map((p, i) => ({
        name: `P${i + 1}`,
        time: p.metadata.computeTimeMs,
    }));

    // Prepare data for verification results (Success vs Failure)
    const verifiedCount = verificationHistory.filter(v => v.verified).length;
    const rejectedCount = verificationHistory.filter(v => !v.verified).length;
    const statusData = [
        { name: 'Verified', value: verifiedCount },
        { name: 'Rejected', value: rejectedCount },
    ];

    // Prepare data for Kafka traffic (Events per Topic)
    const topicCounts = kafkaEvents.reduce((acc, e) => {
        acc[e.topic] = (acc[e.topic] || 0) + 1;
        return acc;
    }, {});
    const trafficData = Object.entries(topicCounts).map(([name, value]) => ({ name, value }));

    return (
        <div className="analytics-page">
            <div className="page-header">
                <h1>Analytics & Insights</h1>
                <p>Advanced metrics and performance tracking for Neo-Vault</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__label">Avg. Compute Time</div>
                    <div className="stat-card__value stat-card__value--primary">
                        {proofHistory.length > 0
                            ? Math.round(proofHistory.reduce((acc, p) => acc + p.metadata.computeTimeMs, 0) / proofHistory.length)
                            : 0}ms
                    </div>
                    <div className="stat-card__sub">ZKP generation latency</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Verification Rate</div>
                    <div className="stat-card__value stat-card__value--success">
                        {verificationHistory.length > 0
                            ? Math.round((verifiedCount / verificationHistory.length) * 100)
                            : 0}%
                    </div>
                    <div className="stat-card__sub">Success vs. Attempted</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">System Throughput</div>
                    <div className="stat-card__value stat-card__value--accent">
                        {Math.round(kafkaEvents.length / 10)} ops/s
                    </div>
                    <div className="stat-card__sub">Events per second (sim)</div>
                </div>
            </div>

            <div className="section-grid">
                {/* Proof Generation Performance Chart */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">⚡ Proof Generation Performance</span>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={perfData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Line type="monotone" dataKey="time" stroke="#0066ff" strokeWidth={3} dot={{ fill: '#0066ff', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Verification Success Rate Chart */}
                <div className="card">
                    <div className="card__header">
                        <span className="card__title">🛡️ Verification Outcome Distribution</span>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Verified' ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Kafka Traffic Chart */}
                <div className="card full-width">
                    <div className="card__header">
                        <span className="card__title">📡 Kafka Traffic by Topic</span>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={trafficData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {trafficData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
