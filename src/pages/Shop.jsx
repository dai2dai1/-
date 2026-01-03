import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Avatar from '../components/Avatar';

const EMOJI_ICONS = ['📺', '🍪', '🧸', '🎡', '📱', '🎮', '⚽', '🎨', '🍦', '🎁'];

const Shop = () => {
    const navigate = useNavigate();
    const { kids, rewards, addReward, deleteReward, redeemReward } = useAppContext();

    // Selecting which child is redeeming
    const [selectedChildId, setSelectedChildId] = useState(kids.length > 0 ? kids[0].id : null);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newReward, setNewReward] = useState({ name: '', points: 100, icon: '🎁' });

    const selectedChild = kids.find(k => k.id === selectedChildId);

    const handleRedeem = (reward) => {
        if (!selectedChild) return;

        if (window.confirm(`确定要花费 ${reward.points} 分兑换 "${reward.name}" 吗？`)) {
            const result = redeemReward(selectedChild.id, reward);
            if (result.success) {
                alert('兑换成功！🎉');
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
        <div className="page-container" style={{ padding: 'var(--spacing-md)', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ background: 'none', padding: 0, marginRight: '1rem' }}>
                    <ArrowLeft size={32} color="var(--color-text-main)" />
                </button>
                <h1 style={{ margin: 0 }}>积分商城</h1>
            </header>

            {/* Child Selector */}
            {kids.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: 'var(--spacing-md)' }}>
                    {kids.map(kid => (
                        <button
                            key={kid.id}
                            className="card"
                            onClick={() => setSelectedChildId(kid.id)}
                            style={{
                                border: selectedChildId === kid.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                                opacity: selectedChildId === kid.id ? 1 : 0.6,
                                padding: '10px',
                                minWidth: '100px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Avatar avatar={kid.avatar} size="2.5rem" />
                            <span style={{ fontWeight: 'bold' }}>{kid.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Current Balance */}
            {selectedChild && (
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))', color: 'white', marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>当前积分</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{selectedChild.points}</div>
                    <div style={{ fontSize: '0.9rem' }}>想换点什么呢？</div>
                </div>
            )}

            {/* Rewards Grid */}
            <div className="rewards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--spacing-md)' }}>
                {rewards.map(reward => {
                    const canAfford = selectedChild && selectedChild.points >= reward.points;
                    return (
                        <div key={reward.id} className="card" style={{ position: 'relative', opacity: canAfford ? 1 : 0.5, border: isAddingMode ? 'none' : 'auto' }}>
                            <button
                                onClick={() => deleteReward(reward.id)}
                                style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}
                            >
                                <Trash2 size={14} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                <div style={{ fontSize: '3rem' }}>{reward.icon}</div>
                                <h3 style={{ margin: '5px 0', fontSize: '1.1rem' }}>{reward.name}</h3>
                                <div style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{reward.points} 分</div>
                            </div>
                            <button
                                className="btn"
                                onClick={() => handleRedeem(reward)}
                                disabled={!canAfford}
                                style={{
                                    width: '100%',
                                    background: canAfford ? 'var(--color-success)' : '#ccc',
                                    color: 'white',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {canAfford ? '兑换' : '积分不足'}
                            </button>
                        </div>
                    );
                })}

                {/* Add New Reward Button */}
                {!isAddingMode ? (
                    <button
                        className="card"
                        onClick={() => setIsAddingMode(true)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed #ccc', minHeight: '200px' }}
                    >
                        <Plus size={40} color="#ccc" />
                        <span style={{ color: '#999', marginTop: '10px' }}>添加商品</span>
                    </button>
                ) : (
                    <div className="card" style={{ border: '2px dashed var(--color-primary)' }}>
                        <div style={{ marginBottom: '5px' }}>
                            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginBottom: '5px' }}>
                                {EMOJI_ICONS.map(icon => (
                                    <span key={icon} onClick={() => setNewReward({ ...newReward, icon })} style={{ cursor: 'pointer', border: newReward.icon === icon ? '2px solid black' : 'none', borderRadius: '4px' }}>{icon}</span>
                                ))}
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="商品名称"
                            value={newReward.name}
                            onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                            style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                        />
                        <input
                            type="number"
                            placeholder="所需积分"
                            value={newReward.points}
                            onChange={e => setNewReward({ ...newReward, points: parseInt(e.target.value) || 0 })}
                            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                        />
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn btn-primary" onClick={handleAddReward} style={{ flex: 1, padding: '5px' }}>添加</button>
                            <button className="btn" onClick={() => setIsAddingMode(false)} style={{ padding: '5px' }}>取消</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
