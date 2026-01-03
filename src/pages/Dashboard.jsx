import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { parseCommand } from '../utils/speechParser';
import VoiceCommandButton from '../components/VoiceCommandButton';
import Avatar from '../components/Avatar';
import { Trophy, Sparkles, X } from 'lucide-react';

const Dashboard = () => {
    const { kids, addPoints, history } = useAppContext();
    const [lastAction, setLastAction] = useState(null);
    const [showKeyboardInput, setShowKeyboardInput] = useState(false);
    const [inputText, setInputText] = useState('');

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

            {/* Main Interaction Area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'var(--spacing-xl) 0' }}>
                {!showKeyboardInput ? (
                    <div className="voice-control-container" style={{ textAlign: 'center' }}>
                        <button
                            onClick={() => setShowKeyboardInput(true)}
                            className="btn-voice-trigger"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6C63FF 0%, #00D9FF 100%)',
                                color: 'white',
                                border: 'none',
                                boxShadow: '0 10px 40px rgba(108, 99, 255, 0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                transform: 'scale(1)'
                            }}
                        >
                            <VoiceCommandButton.Icon size={40} />
                        </button>
                        <p style={{
                            marginTop: 'var(--spacing-md)',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 600,
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            点击说话 (调用系统输入法)
                        </p>
                    </div>
                ) : (
                    <div className="input-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBottom: '20px'
                    }}>
                        <div
                            className="card animate-slide-up"
                            style={{
                                margin: '20px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--glass-border)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <label style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>⌨️</span> 请点击键盘上的麦克风
                                </label>
                                <button
                                    onClick={() => setShowKeyboardInput(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <textarea
                                autoFocus
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="在此处语音输入..."
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    padding: '16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '2px solid var(--color-primary)',
                                    background: 'var(--color-bg-primary)',
                                    color: 'var(--color-text-primary)',
                                    marginBottom: '16px',
                                    fontSize: '1.2rem',
                                    resize: 'none'
                                }}
                            />

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (inputText.trim()) {
                                            handleVoiceCommand(inputText);
                                            setInputText('');
                                            setShowKeyboardInput(false);
                                        }
                                    }}
                                    disabled={!inputText.trim()}
                                    style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}
                                >
                                    发送指令
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
