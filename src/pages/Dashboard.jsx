import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { parseCommand } from '../utils/speechParser';
import VoiceCommandButton from '../components/VoiceCommandButton';
import ChartsSection from '../components/ChartsSection';
import Avatar from '../components/Avatar';
import { Trophy, History } from 'lucide-react';

const Dashboard = () => {
    const { kids, addPoints, history } = useAppContext();
    const [lastAction, setLastAction] = useState(null);

    const handleVoiceCommand = (text) => {
        // Pass full kids object for alias matching
        const result = parseCommand(text, kids);

        if (result.success) {
            const success = addPoints(result.childId, result.points, result.reason);
            if (success) {
                setLastAction({
                    type: 'success',
                    message: `已给 ${result.name} ${result.points > 0 ? '加' : '扣'} ${Math.abs(result.points)} 分！`,
                    reason: result.reason
                });

                // Speak result
                const utter = new SpeechSynthesisUtterance(`好的，已给${result.name}${result.points > 0 ? '加' : '扣'}${Math.abs(result.points)}分`);
                utter.lang = 'zh-CN';
                window.speechSynthesis.speak(utter);
            }
        } else {
            setLastAction({
                type: 'error',
                message: result.error || '没听清，请再说一遍',
                text: text
            });
        }

        // Clear message after 5s
        setTimeout(() => setLastAction(null), 5000);
    };

    return (
        <div className="dashboard" style={{ padding: 'var(--spacing-md)', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ color: 'var(--color-primary)', margin: 0 }}>儿童成长助手</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/shop" style={{ fontSize: '2rem', textDecoration: 'none' }} title="积分商城">🛍️</Link>
                    <Link to="/settings" style={{ fontSize: '2rem', textDecoration: 'none' }} title="成员管理">⚙️</Link>
                    <Link to="/rules" style={{ fontSize: '2rem', textDecoration: 'none' }} title="规则模板">🏡</Link>
                </div>
            </header>

            <section className="kids-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
                {kids.map(kid => (
                    <div key={kid.id} className="card kid-card" style={{ textAlign: 'center', borderTop: `4px solid var(--color-secondary)` }}>
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                            <Avatar avatar={kid.avatar} size="5rem" />
                        </div>
                        <h2 style={{ margin: '0.5rem 0' }}>{kid.name}</h2>
                        <div className="points" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                            {kid.points} 分
                        </div>
                        <div className="rank-badge" style={{ marginTop: '5px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            <Trophy size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'gold' }} />
                            等级 {Math.floor(kid.points / 1000) + 1}
                        </div>
                    </div>
                ))}
            </section>

            <VoiceCommandButton onCommand={handleVoiceCommand} />

            {lastAction && (
                <div className={`card animate-pop`} style={{
                    background: lastAction.type === 'success' ? '#fff' : '#fff0f0',
                    borderLeft: `5px solid ${lastAction.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <h3 style={{ margin: '0 0 5px' }}>
                        {lastAction.type === 'success' ? '🎉在这里！' : '🤔 嗯？'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>{lastAction.message}</p>
                    {lastAction.reason && <p style={{ margin: '5px 0 0', color: 'var(--color-text-muted)' }}>"{lastAction.reason}"</p>}
                </div>
            )}

            <section className="recent-history">
                <h3 style={{ borderBottom: '2px solid var(--color-background)', paddingBottom: '10px' }}>
                    <History size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    最近动态
                </h3>
                <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {history.slice(0, 5).map(event => (
                        <div key={event.id} className="card history-item" style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>{event.childName}</span>
                                <span style={{ margin: '0 8px', color: 'var(--color-text-muted)' }}>因</span>
                                <span>{event.reason}</span>
                            </div>
                            <div style={{ fontWeight: 'bold', color: event.points > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                {event.points > 0 ? '+' : ''}{event.points}
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>暂无记录</p>}
                </div>
            </section>

            <ChartsSection history={history} kids={kids} />
        </div>
    );
};

export default Dashboard;
