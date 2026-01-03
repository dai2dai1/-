import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { parseCommand } from '../utils/speechParser';
import VoiceCommandButton from '../components/VoiceCommandButton';
import Avatar from '../components/Avatar';
import { Trophy, Sparkles } from 'lucide-react';

const Dashboard = () => {
    const { kids, addPoints, history } = useAppContext();
    const [lastAction, setLastAction] = useState(null);

    const handleVoiceCommand = (text) => {
        const result = parseCommand(text, kids);

        if (result.success) {
            const success = addPoints(result.childId, result.points, result.reason);
            if (success) {
                setLastAction({
                    type: 'success',
                    message: `已给 ${result.name} ${result.points > 0 ? '加' : '扣'} ${Math.abs(result.points)} 分！`,
                    reason: result.reason
                });

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

        setTimeout(() => setLastAction(null), 5000);
    };

    return (
        <div className="page-container fade-in">
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={28} color="var(--color-warning)" />
                    <h1 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                        儿童成长助手
                    </h1>
                </div>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    点击麦克风，说出奖惩指令
                </p>
            </header>

            {/* Kids Cards */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                {kids.map(kid => (
                    <div key={kid.id} className="card card-premium" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <Avatar avatar={kid.avatar} size="4.5rem" />
                        </div>
                        <h2 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{kid.name}</h2>
                        <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                            {kid.points}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
                            <Trophy size={14} color="var(--color-warning)" />
                            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                                Lv.{Math.floor(kid.points / 1000) + 1}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Voice Command */}
            <VoiceCommandButton onCommand={handleVoiceCommand} />

            {/* Feedback Message */}
            {lastAction && (
                <div className={`card fade-in`} style={{
                    marginTop: 'var(--spacing-lg)',
                    background: lastAction.type === 'success'
                        ? 'rgba(0, 230, 118, 0.1)'
                        : 'rgba(255, 82, 82, 0.1)',
                    borderLeft: `4px solid ${lastAction.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-base)' }}>
                        {lastAction.type === 'success' ? '✅ 操作成功' : '⚠️ 提示'}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{lastAction.message}</p>
                    {lastAction.reason && (
                        <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            "{lastAction.reason}"
                        </p>
                    )}
                </div>
            )}

            {/* Recent Activity Preview */}
            <section style={{ marginTop: 'var(--spacing-xl)' }}>
                <h3 className="section-title" style={{ fontSize: 'var(--font-size-base)' }}>
                    ⚡ 最近动态
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    {history.slice(0, 3).map(event => (
                        <div key={event.id} className="card" style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Avatar avatar={kids.find(k => k.id === event.childId)?.avatar} size="2rem" />
                                <div>
                                    <span style={{ fontWeight: 600 }}>{event.childName}</span>
                                    <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px', fontSize: 'var(--font-size-sm)' }}>
                                        {event.reason}
                                    </span>
                                </div>
                            </div>
                            <span className={`points-badge ${event.points >= 0 ? 'positive' : 'negative'}`}>
                                {event.points >= 0 ? '+' : ''}{event.points}
                            </span>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                            暂无记录，试试说"给萱萱加10分"
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
