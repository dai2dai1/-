import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Avatar from '../components/Avatar';
import { Calendar, TrendingUp, Award, Target } from 'lucide-react';

const StatsPage = () => {
    const { kids, history } = useAppContext();
    const [selectedChildId, setSelectedChildId] = useState(kids[0]?.id || null);

    const selectedChild = kids.find(k => k.id === selectedChildId);

    // Calculate monthly stats
    const monthlyStats = useMemo(() => {
        if (!selectedChildId) return null;

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const childHistory = history.filter(h => h.childId === selectedChildId);

        // This month's events
        const thisMonthEvents = childHistory.filter(h => {
            const eventDate = new Date(h.timestamp);
            return eventDate.getMonth() === thisMonth && eventDate.getFullYear() === thisYear;
        });

        const totalGained = thisMonthEvents.filter(e => e.points > 0).reduce((sum, e) => sum + e.points, 0);
        const totalLost = thisMonthEvents.filter(e => e.points < 0).reduce((sum, e) => sum + Math.abs(e.points), 0);
        const netChange = totalGained - totalLost;
        const eventCount = thisMonthEvents.length;

        // Best day (most points gained)
        const dayMap = {};
        thisMonthEvents.forEach(e => {
            const day = new Date(e.timestamp).toDateString();
            dayMap[day] = (dayMap[day] || 0) + e.points;
        });
        const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

        return {
            totalGained,
            totalLost,
            netChange,
            eventCount,
            bestDay: bestDay ? { date: bestDay[0], points: bestDay[1] } : null
        };
    }, [selectedChildId, history]);

    return (
        <div className="page-container fade-in">
            <header style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>📊 数据统计</h1>
            </header>

            {/* Child Selector */}
            {kids.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: 'var(--spacing-lg)', overflowX: 'auto' }}>
                    {kids.map(kid => (
                        <button
                            key={kid.id}
                            onClick={() => setSelectedChildId(kid.id)}
                            className="card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: '80px',
                                opacity: selectedChildId === kid.id ? 1 : 0.5,
                                border: selectedChildId === kid.id ? '2px solid var(--color-primary)' : 'var(--glass-border)',
                                cursor: 'pointer'
                            }}
                        >
                            <Avatar avatar={kid.avatar} size="2.5rem" />
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{kid.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {selectedChild && monthlyStats && (
                <>
                    {/* Current Points */}
                    <div className="card card-premium" style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                            当前总积分
                        </div>
                        <div className="stat-value">{selectedChild.points}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                            等级 {Math.floor(selectedChild.points / 1000) + 1}
                        </div>
                    </div>

                    {/* Monthly Summary */}
                    <h2 className="section-title">
                        <Calendar size={20} /> 本月统计
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                        <div className="card stat-card">
                            <div style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
                                +{monthlyStats.totalGained}
                            </div>
                            <div className="stat-label">获得积分</div>
                        </div>
                        <div className="card stat-card">
                            <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
                                -{monthlyStats.totalLost}
                            </div>
                            <div className="stat-label">扣除积分</div>
                        </div>
                        <div className="card stat-card">
                            <div style={{
                                color: monthlyStats.netChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 800
                            }}>
                                {monthlyStats.netChange >= 0 ? '+' : ''}{monthlyStats.netChange}
                            </div>
                            <div className="stat-label">净变化</div>
                        </div>
                        <div className="card stat-card">
                            <div style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
                                {monthlyStats.eventCount}
                            </div>
                            <div className="stat-label">事件总数</div>
                        </div>
                    </div>

                    {/* Best Day */}
                    {monthlyStats.bestDay && (
                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'var(--gradient-accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Award size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>最佳一天</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                    {new Date(monthlyStats.bestDay.date).toLocaleDateString('zh-CN')} · +{monthlyStats.bestDay.points} 分
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StatsPage;
