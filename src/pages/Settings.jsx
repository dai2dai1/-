import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Trash2, Save, Camera, User, Upload, ImagePlus } from 'lucide-react';
import Avatar from '../components/Avatar';

const EMOJI_OPTIONS = ['👦', '👧', '👶', '🦸', '🧚', '🐼', '🐯', '🐰', '🦁', '🦄', '🎀', '⚽'];

const Settings = () => {
    const { kids, addChild, updateChild, deleteChild } = useAppContext();
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', aliases: '', avatar: '👶' });
    const fileInputRef = useRef(null);

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
            updateChild(editingId, { name: formData.name, aliases: aliasesArray, avatar: formData.avatar });
        } else {
            addChild({ name: formData.name, aliases: aliasesArray, avatar: formData.avatar });
        }
        handleCancel();
    };

    const handleDelete = (id) => {
        if (window.confirm('确定要删除这个宝宝吗？')) {
            deleteChild(id);
            if (editingId === id) handleCancel();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_SIZE = 120;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                setFormData(prev => ({ ...prev, avatar: canvas.toDataURL('image/jpeg', 0.8) }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="page-container fade-in">
            <header style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>
                    <User size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    成员管理
                </h1>
            </header>

            {/* Member List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                {kids.map(kid => (
                    <div key={kid.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <Avatar avatar={kid.avatar} size="3.5rem" />
                            <div>
                                <h3 style={{ margin: '0 0 4px', fontWeight: 700 }}>{kid.name}</h3>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                    别名: {kid.aliases?.join(', ') || '无'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn" onClick={() => handleEdit(kid)} style={{ background: 'var(--glass-bg)', color: 'var(--color-text-primary)', padding: '8px 16px' }}>
                                编辑
                            </button>
                            <button className="btn" onClick={() => handleDelete(kid.id)} style={{ background: 'rgba(255,82,82,0.15)', color: 'var(--color-danger)', padding: '8px' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Form */}
            <div className="card card-premium">
                <h3 style={{ margin: '0 0 var(--spacing-md)', fontWeight: 700 }}>
                    {editingId ? '✏️ 编辑成员' : '➕ 添加新成员'}
                </h3>

                {/* Avatar Selection */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: '12px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>头像</label>

                    {/* Current Avatar Preview */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                        <div style={{
                            position: 'relative',
                            border: '3px solid var(--color-primary)',
                            borderRadius: '50%',
                            padding: '4px'
                        }}>
                            <Avatar avatar={formData.avatar} size="5rem" />
                        </div>

                        {/* Upload Photo Button - PROMINENT */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px'
                            }}
                        >
                            <ImagePlus size={20} />
                            上传照片
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Or choose emoji */}
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginBottom: '8px' }}>
                        或选择表情头像：
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {EMOJI_OPTIONS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => setFormData({ ...formData, avatar: emoji })}
                                style={{
                                    fontSize: '1.5rem',
                                    background: formData.avatar === emoji ? 'var(--color-primary)' : 'var(--glass-bg)',
                                    border: formData.avatar === emoji ? '2px solid var(--color-secondary)' : '2px solid transparent',
                                    borderRadius: '50%',
                                    width: '44px',
                                    height: '44px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name Input */}
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>名字 *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="例如：萱萱"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: 'var(--radius-sm)',
                            border: '2px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'var(--color-text-primary)',
                            fontSize: 'var(--font-size-base)',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Aliases Input */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>别名 (用于语音识别)</label>
                    <input
                        type="text"
                        value={formData.aliases}
                        onChange={e => setFormData({ ...formData, aliases: e.target.value })}
                        placeholder="用逗号分隔，例如：小萱, 宣宣"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: 'var(--radius-sm)',
                            border: '2px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'var(--color-text-primary)',
                            fontSize: 'var(--font-size-base)',
                            outline: 'none'
                        }}
                    />
                    <div style={{ marginTop: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        💡 添加多个别名可以提高语音识别准确率
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!formData.name} style={{ flex: 1, padding: '14px' }}>
                        <Save size={18} /> 保存
                    </button>
                    {editingId && (
                        <button className="btn" onClick={handleCancel} style={{ background: 'var(--glass-bg)', color: 'var(--color-text-primary)', padding: '14px 24px' }}>
                            取消
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
