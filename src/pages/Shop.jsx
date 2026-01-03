import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Avatar from '../components/Avatar';
import { ShoppingBag, Plus, Trash2, Gift } from 'lucide-react';

const EMOJI_ICONS = ['📺', '🍪', '🧸', '🎡', '📱', '🎮', '⚽', '🎨', '🍦', '🎁', '🎢', '🎪'];

const Shop = () => {
    const { kids, rewards, addReward, deleteReward, redeemReward } = useAppContext();
    const [selectedChildId, setSelectedChildId] = useState(kids[0]?.id || null);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newReward, setNewReward] = useState({ name: '', points: 100, icon: '🎁' });

    const selectedChild = kids.find(k => k.id === selectedChildId);

    const handleRedeem = (reward) => {
        if (!selectedChild) return;
        if (window.confirm(`确定要花费 ${reward.points} 分兑换 "${reward.name}" 吗？`)) {
            const result = redeemReward(selectedChild.id, reward);
            if (result.success) {
                alert('🎉 兑换成功！');
            } else {
                alert(`兑换失败：${result.error}`);
            }
        }
    };

    const handleAddReward = () => {
        if (newReward.name && newReward.points > 0) {
            addReward(newReward);
            setIsAddingMode(false);
            setNewReward({ name: '', points: 100, icon: '🎁' });
        }
    };

    return (
        <div className="page-container fade-in">
            <header style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>
                    <ShoppingBag size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    积分商城
                </h1>
            </header>

            {/* Child Selector */}
            {kids.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: 'var(--spacing-lg)', overflowX: 'auto', paddingBottom: '8px' }}>
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

            {/* Balance Card */}
            {selectedChild && (
                <div className="card card-premium" style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {selectedChild.name} 的积分余额
                    </div>
                    <div className="stat-value" style={{ margin: '8px 0' }}>{selectedChild.points}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        <Gift size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        选择下面的奖品兑换吧
                    </div>
                </div>
            )}

            {/* Rewards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'var(--spacing-md)' }}>
                {rewards.map(reward => {
                    const canAfford = selectedChild && selectedChild.points >= reward.points;
                    return (
                        <div key={reward.id} className="card" style={{ position: 'relative', opacity: canAfford ? 1 : 0.5, textAlign: 'center' }}>
                            <button
                                onClick={() => deleteReward(reward.id)}
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    opacity: 0.5
                                }}
                            >
                                <Trash2 size={12} />
                            </button>
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{reward.icon}</div>
                            <h4 style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{reward.name}</h4>
                            <div style={{ color: 'var(--color-warning)', fontWeight: 700, marginBottom: '12px' }}>{reward.points} 分</div>
                            <button
                                className={`btn ${canAfford ? 'btn-success' : ''}`}
                                onClick={() => handleRedeem(reward)}
                                disabled={!canAfford}
                                style={{ width: '100%', fontSize: 'var(--font-size-xs)', padding: '8px' }}
                            >
                                {canAfford ? '兑换' : '积分不足'}
                            </button>
                        </div>
                    );
                })}

                {/* Add New Reward */}
                {!isAddingMode ? (
                    <button
                        onClick={() => setIsAddingMode(true)}
                        className="card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '160px',
                            border: '2px dashed rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            background: 'transparent'
                        }}
                    >
                        <Plus size={32} color="var(--color-text-muted)" />
                        <span style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontSize: 'var(--font-size-sm)' }}>添加奖品</span>
                    </button>
                ) : (
                    <div className="card" style={{ border: '2px solid var(--color-primary)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                            {EMOJI_ICONS.map(icon => (
                                <span
                                    key={icon}
                                    onClick={() => setNewReward({ ...newReward, icon })}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        background: newReward.icon === icon ? 'var(--color-primary)' : 'transparent'
                                    }}
                                >
                                    {icon}
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="奖品名称"
                            value={newReward.name}
                            onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                            style={{
                                width: '100%',
                                marginBottom: '8px',
                                padding: '8px',
                                borderRadius: 'var(--radius-sm)',
                                border: 'var(--glass-border)',
                                background: 'var(--glass-bg)',
                                color: 'var(--color-text-primary)',
                                outline: 'none'
                            }}
                        />
                        <input
                            type="number"
                            placeholder="积分"
                            value={newReward.points}
                            onChange={e => setNewReward({ ...newReward, points: parseInt(e.target.value) || 0 })}
                            style={{
                                width: '100%',
                                marginBottom: '8px',
                                padding: '8px',
                                borderRadius: 'var(--radius-sm)',
                                border: 'var(--glass-border)',
                                background: 'var(--glass-bg)',
                                color: 'var(--color-text-primary)',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-primary" onClick={handleAddReward} style={{ flex: 1, padding: '8px', fontSize: 'var(--font-size-xs)' }}>添加</button>
                            <button className="btn" onClick={() => setIsAddingMode(false)} style={{ padding: '8px', background: 'var(--glass-bg)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-xs)' }}>取消</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
