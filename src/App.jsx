import React, { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-wrapper">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <header className="content-header">
          <h1>{activeTab.toUpperCase()}</h1>
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
