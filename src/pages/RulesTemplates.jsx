import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Home, School, Smile } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TEMPLATES = [
    {
        category: '学习',
        icon: <BookOpen size={24} />,
        color: 'var(--color-primary)',
        rules: [
            { text: '完成作业', points: 100 },
            { text: '认真阅读30分钟', points: 50 },
            { text: '考试满分', points: 200 },
            { text: '作业字迹潦草', points: -50 }
        ]
    },
    {
        category: '生活',
        icon: <Smile size={24} />,
        color: 'var(--color-accent)',
        rules: [
            { text: '按时睡觉', points: 50 },
            { text: '自己收拾房间', points: 80 },
            { text: '不爱吃蔬菜', points: -20 },
            { text: '帮忙做家务', points: 100 }
        ]
    },
    {
        category: '学校',
        icon: <School size={24} />,
        color: 'var(--color-secondary)',
        rules: [
            { text: '得到老师表扬', points: 100 },
            { text: '团结同学', points: 50 },
            { text: '上课迟到', points: -50 }
        ]
    }
];

const RulesTemplates = () => {
    const navigate = useNavigate();
    const { addPoints, kids } = useAppContext();

    const handleApply = (rule) => {
        // For simplicity in this demo, apply to the first kid or prompt?
        // Let's just prompt "Applied to all" or pick the first one usually selected.
        // Or better, just copy text to clipboard? 
        // The user requirement said "Templates...". 
        // Let's make it interactive: Click -> Show simple modal to pick kid?
        // For MVP, I'll just apply to the first kid (Hero action) and show toast.
        if (kids.length > 0) {
            addPoints(kids[0].id, rule.points, rule.text);
            alert(`已给 ${kids[0].name} ${rule.points > 0 ? '+' : ''}${rule.points}: ${rule.text}`);
        }
    };

    return (
        <div className="page-container" style={{ padding: 'var(--spacing-md)', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ background: 'none', padding: 0, marginRight: '1rem' }}>
                    <ArrowLeft size={32} color="var(--color-text-main)" />
                </button>
                <h1 style={{ margin: 0 }}>规则模板</h1>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {TEMPLATES.map(cat => (
                    <section key={cat.category}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cat.color }}>
                            {cat.icon} {cat.category}
                        </h2>
                        <div className="rules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                            {cat.rules.map((rule, idx) => (
                                <button
                                    key={idx}
                                    className="card"
                                    onClick={() => handleApply(rule)}
                                    style={{
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        borderLeft: `3px solid ${rule.points > 0 ? 'var(--color-success)' : 'var(--color-danger)'}`
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{rule.text}</div>
                                    <div style={{ color: rule.points > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {rule.points > 0 ? '+' : ''}{rule.points}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default RulesTemplates;
