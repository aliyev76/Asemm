import React, { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Auth from './components/Auth'
import { translations } from './lib/i18n/translations'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('asemm_auth') === 'true';
  });

  const t = translations.tr.sidebar; 

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('asemm_auth', 'true');
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const getHeaderTitle = () => {
    if (activeTab === 'dashboard') return t.dashboard.toUpperCase();
    return activeTab.toUpperCase();
  };

  return (
    <div className="app-wrapper">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <header className="content-header">
          <h1>{getHeaderTitle()}</h1>
          <div className="user-profile">
            <span>Yönetici Paneli</span>
            <div className="avatar">A</div>
          </div>
        </header>
        <Dashboard activeTab={activeTab} />
      </main>
    </div>
  )
}

export default App
