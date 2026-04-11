import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'masalar', label: 'Masalar', icon: '🎮' },
    { id: 'vips', label: 'VİP Odalar', icon: '🌟' },
    { id: 'kantin', label: 'Kantin', icon: '🍟' },
    { id: 'ayarlar', label: 'Ayarlar', icon: '⚙️' },
    { id: 'reports', label: 'Gün Sonu', icon: '💰' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🚀</span>
        <h2>PS KAFE</h2>
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
          <span>Sistem Aktif</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
