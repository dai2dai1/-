import { createContext, useContext, useState, useEffect } from 'react';
import { playSuccessSound, playCoinSound } from '../utils/sounds';

const AppContext = createContext();

const INITIAL_CHILDREN = [
    { id: '1', name: '萱萱', aliases: ['小萱', '宣宣', '轩轩', '喧喧'], points: 1000, avatar: '👧' },
    { id: '2', name: '闹闹', aliases: ['小闹', '挠挠', '恼恼'], points: 1000, avatar: '👦' }
];

export const AppProvider = ({ children }) => {
    // Load from localStorage or use initial
    const [kids, setKids] = useState(() => {
        const saved = localStorage.getItem('growth_app_kids');
        return saved ? JSON.parse(saved) : INITIAL_CHILDREN;
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('growth_app_history');
        return saved ? JSON.parse(saved) : [];
    });

    const [rewards, setRewards] = useState(() => {
        const saved = localStorage.getItem('growth_app_rewards');
        return saved ? JSON.parse(saved) : [
            { id: 'r1', name: '看电视30分钟', points: 100, icon: '📺' },
            { id: 'r2', name: '吃零食', points: 50, icon: '🍪' },
            { id: 'r3', name: '买新玩具', points: 1000, icon: '🧸' },
            { id: 'r4', name: '去游乐园', points: 2000, icon: '🎡' }
        ];
    });

    // Save on change
    useEffect(() => {
        localStorage.setItem('growth_app_kids', JSON.stringify(kids));
    }, [kids]);

    useEffect(() => {
        localStorage.setItem('growth_app_history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('growth_app_rewards', JSON.stringify(rewards));
    }, [rewards]);

    const addPoints = (childId, points, reason) => {
        // Find by ID first, then fallback to name check for legacy
        const kid = kids.find(k => k.id === childId || k.name === childId);
        if (!kid) return false;

        const timestamp = new Date().toISOString();
        const newEvent = {
            id: Date.now().toString(),
            childId: kid.id, // Ensure we save ID
            childName: kid.name, // Snapshot name in case it changes later
            points,
            reason,
            timestamp
        };

        setKids(prev => prev.map(k =>
            k.id === kid.id ? { ...k, points: k.points + points } : k
        ));
        setHistory(prev => [newEvent, ...prev]);

        // Play Sound
        if (points > 0) {
            playCoinSound();
        }

        return true;
    };

    const addChild = (childData) => {
        const newChild = {
            id: Date.now().toString(),
            points: 0,
            avatar: '👶',
            aliases: [],
            ...childData
        };
        setKids(prev => [...prev, newChild]);
    };

    const updateChild = (id, data) => {
        setKids(prev => prev.map(k => k.id === id ? { ...k, ...data } : k));
    };

    const deleteChild = (id) => {
        setKids(prev => prev.filter(k => k.id !== id));
    };

    const addReward = (reward) => {
        setRewards(prev => [...prev, { id: Date.now().toString(), ...reward }]);
    };

    const deleteReward = (id) => {
        setRewards(prev => prev.filter(r => r.id !== id));
    };

    const redeemReward = (childId, reward) => {
        const kid = kids.find(k => k.id === childId);
        if (!kid) return { success: false, error: '找不到孩子' };
        if (kid.points < reward.points) return { success: false, error: '积分不足' };

        // Reuse addPoints to handle deduction and history
        addPoints(kid.id, -reward.points, `兑换：${reward.name}`);
        return { success: true };
    };

    return (
        <AppContext.Provider value={{
            kids, history, rewards,
            addPoints, addChild, updateChild, deleteChild,
            addReward, deleteReward, redeemReward
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
