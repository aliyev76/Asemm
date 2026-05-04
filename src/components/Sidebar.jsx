import React from 'react';
import './Sidebar.css';
import { translations } from '../lib/i18n/translations';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const t = translations.tr.sidebar; // Şimdilik varsayılan Türkçe

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: '📊' },
    { id: 'masalar', label: t.masalar, icon: '🎮' },
    { id: 'vips', label: t.vips, icon: '🌟' },
    { id: 'kantin', label: t.kantin, icon: '🍟' },
    { id: 'ayarlar', label: t.ayarlar, icon: '⚙️' },
    { id: 'yonetim', label: t.yonetim, icon: '🛠️' },
    { id: 'reports', label: t.reports, icon: '📈' },
    { id: 'kasa', label: 'Kasa', icon: '💰' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/src/assets/logo.png" alt="Logo" className="logo-img" />
        <h2>ASEMM</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className="dot online"></div>
          <span>{t.system_active}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
