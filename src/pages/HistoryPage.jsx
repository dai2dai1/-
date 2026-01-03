import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Avatar from '../components/Avatar';
import { Clock, Filter } from 'lucide-react';

const HistoryPage = () => {
    const { kids, history } = useAppContext();
    const [filterChildId, setFilterChildId] = useState('all');

    const filteredHistory = filterChildId === 'all'
        ? history
        : history.filter(h => h.childId === filterChildId);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };

    const getChildName = (childId) => {
        const child = kids.find(k => k.id === childId);
        return child?.name || '未知';
    };

    const getChildAvatar = (childId) => {
        const child = kids.find(k => k.id === childId);
        return child?.avatar || '👶';
    };

    return (
        <div className="page-container fade-in">
            <header style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>📋 奖惩记录</h1>
            </header>

            {/* Filter */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <Filter size={18} color="var(--color-text-muted)" />
                <select
                    value={filterChildId}
                    onChange={e => setFilterChildId(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--font-size-base)',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="all" style={{ background: 'var(--color-bg-secondary)' }}>全部成员</option>
                    {kids.map(kid => (
                        <option key={kid.id} value={kid.id} style={{ background: 'var(--color-bg-secondary)' }}>
                            {kid.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Data Table */}
            {filteredHistory.length > 0 ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>时间</th>
                                <th>成员</th>
                                <th>事件</th>
                                <th style={{ textAlign: 'right' }}>积分</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.slice(0, 50).map((event, idx) => (
                                <tr key={event.id || idx}>
                                    <td>
                                        <div style={{ fontSize: 'var(--font-size-sm)' }}>{formatDate(event.timestamp)}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {formatTime(event.timestamp)}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Avatar avatar={getChildAvatar(event.childId)} size="1.5rem" />
                                            <span>{getChildName(event.childId)}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>
                                        {event.reason || (event.points > 0 ? '表现不错' : '需要改进')}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className={`points-badge ${event.points >= 0 ? 'positive' : 'negative'}`}>
                                            {event.points >= 0 ? '+' : ''}{event.points}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-muted)' }}>
                    <Clock size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }} />
                    <p>暂无记录</p>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
