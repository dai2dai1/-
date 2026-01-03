import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, BarChart3, ShoppingBag, Settings } from 'lucide-react';

const tabs = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/history', icon: History, label: '记录' },
    { path: '/stats', icon: BarChart3, label: '统计' },
    { path: '/shop', icon: ShoppingBag, label: '商城' },
    { path: '/settings', icon: Settings, label: '设置' },
];

const BottomTabBar = () => {
    return (
        <nav className="bottom-tab-bar">
            {tabs.map(tab => (
                <NavLink
                    key={tab.path}
                    to={tab.path}
                    className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
                    end={tab.path === '/'}
                >
                    <tab.icon size={22} />
                    <span>{tab.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomTabBar;
