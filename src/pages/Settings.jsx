import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Avatar from '../components/Avatar';

const EMOJI_OPTIONS = ['👦', '👧', '👶', '🦸', '🧚', '🐼', '🐯', '🐰', '🦁', '🦄'];

const Settings = () => {
    const navigate = useNavigate();
    const { kids, addChild, updateChild, deleteChild } = useAppContext();
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', aliases: '', avatar: '👶' });

    const handleEdit = (kid) => {
        setEditingId(kid.id);
        setFormData({
            name: kid.name,
            aliases: kid.aliases ? kid.aliases.join(', ') : '',
            avatar: kid.avatar
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', aliases: '', avatar: '👶' });
    };

    const handleSave = () => {
        const aliasesArray = formData.aliases.split(/[,，]/).map(s => s.trim()).filter(s => s);

        if (editingId) {
            updateChild(editingId, {
                name: formData.name,
                aliases: aliasesArray,
                avatar: formData.avatar
            });
        } else {
            addChild({
                name: formData.name,
                aliases: aliasesArray,
                avatar: formData.avatar
            });
        }
        handleCancel();
    };

    const handleDelete = (id) => {
        if (window.confirm('确定要删除这个宝宝吗？数据将无法恢复。')) {
            deleteChild(id);
            if (editingId === id) handleCancel();
        }
    };

    return (
        <div className="page-container" style={{ padding: 'var(--spacing-md)', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ background: 'none', padding: 0, marginRight: '1rem' }}>
                    <ArrowLeft size={32} color="var(--color-text-main)" />
                </button>
                <h1 style={{ margin: 0 }}>家庭成员管理</h1>
            </header>

            <div className="settings-grid" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {kids.map(kid => (
                    <div key={kid.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '2.5rem' }}>{kid.avatar}</span>
                            <div>
                                <h3 style={{ margin: '0 0 5px' }}>{kid.name}</h3>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    小名: {kid.aliases?.join(', ') || '无'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn" onClick={() => handleEdit(kid)} style={{ background: 'var(--color-background)' }}>编辑</button>
                            <button className="btn" onClick={() => handleDelete(kid.id)} style={{ background: '#ffe0e0', color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card editor-panel" style={{ marginTop: 'var(--spacing-lg)', borderTop: '4px solid var(--color-primary)' }}>
                <h3>{editingId ? '编辑成员' : '添加新成员'}</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>头像</label>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {EMOJI_OPTIONS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => setFormData({ ...formData, avatar: emoji })}
                                style={{
                                    fontSize: '1.5rem',
                                    background: formData.avatar === emoji ? 'var(--color-secondary)' : 'var(--color-background)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer'
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>名字</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        placeholder="例如：萱萱"
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>小名 / 别名</label>
                    <input
                        type="text"
                        value={formData.aliases}
                        onChange={e => setFormData({ ...formData, aliases: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        placeholder="用逗号分隔，例如：小萱, 宣宣"
                    />
                    <small style={{ color: 'var(--color-text-muted)' }}>语音识别时也会匹配这些名字哦</small>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!formData.name}>
                        <Save size={18} /> 保存
                    </button>
                    {editingId && (
                        <button className="btn" onClick={handleCancel}>取消</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
