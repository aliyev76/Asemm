import React, { useState, useEffect } from 'react';
import MachineCard from './MachineCard';
import Kantin from './Kantin';
import Settings from './Settings';
import Reports from './Reports';
import './Dashboard.css';

const INITIAL_PRICES = {
  regular: { 2: 120, 3: 180, 4: 240 },
  vip: { 2: 150, 3: 210, 4: 270 } // VIP için 3 ve 4 kol ekledim (varsayılan artışla)
};

const INITIAL_TABLES = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  name: `Masa ${i + 1}`,
  type: 'regular',
  status: 'idle',
  startTime: null,
  controllers: 2,
  products: [],
}));

const INITIAL_VIP = [
  { id: 'v1', name: 'Sinema Odası', type: 'vip', status: 'idle', startTime: null, controllers: 2, products: [] },
  { id: 'v2', name: 'Loca', type: 'vip', status: 'idle', startTime: null, controllers: 2, products: [] },
];

const Dashboard = ({ activeTab }) => {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [vips, setVips] = useState(INITIAL_VIP);
  const [selectedTableInfo, setSelectedTableInfo] = useState(null); // { id, isVip }
  const [prices, setPrices] = useState(INITIAL_PRICES);
  const [logs, setLogs] = useState([]); // Günlük ödeme kayıtları
  const [products, setProducts] = useState([
    { id: 1, name: 'Kola', price: 30, stock: 50 },
    { id: 2, name: 'Tost', price: 60, stock: 20 },
    { id: 3, name: 'Su', price: 10, stock: 100 },
  ]);

  const handleStartSession = (id, isVip) => {
    const setter = isVip ? setVips : setTables;
    setter(prev => prev.map(t => t.id === id ? { ...t, status: 'active', startTime: new Date() } : t));
  };

  const handleEndSession = (id, isVip, paymentData) => {
    const currentTable = isVip ? vips.find(v => v.id === id) : tables.find(t => t.id === id);
    // Kaydı loglara ekle
    setLogs(prev => [...prev, {
      ...paymentData,
      timestamp: new Date(),
      tableName: currentTable.name
    }]);

    const setter = isVip ? setVips : setTables;
    setter(prev => prev.map(t => t.id === id ? { ...t, status: 'idle', startTime: null, products: [] } : t));
    setSelectedTableInfo(null);
  };

  const handleUpdateControllers = (id, isVip, count) => {
    const setter = isVip ? setVips : setTables;
    setter(prev => prev.map(t => t.id === id ? { ...t, controllers: count } : t));
  };

  const handleAddProductToTable = (tableId, isVip, product) => {
     const setter = isVip ? setVips : setTables;
     setter(prev => prev.map(t => t.id === tableId ? { ...t, products: [...t.products, product] } : t));
  };

  const getActiveView = () => {
    if (activeTab === 'kantin') return <Kantin products={products} setProducts={setProducts} />;
    if (activeTab === 'ayarlar') return <Settings prices={prices} setPrices={setPrices} />;
    if (activeTab === 'reports') return <Reports logs={logs} setLogs={setLogs} />;
    
    let displayItems = [];
    if (activeTab === 'dashboard') displayItems = [...vips, ...tables];
    if (activeTab === 'masalar') displayItems = tables;
    if (activeTab === 'vips') displayItems = vips;

    return (
      <div className="grid">
        {displayItems.map(item => (
          <div key={item.id} className={`simple-card ${item.status}`} onClick={() => setSelectedTableInfo({ id: item.id, isVip: item.type === 'vip' })}>
            <div className="card-top">
              <span className="name">{item.name}</span>
              <span className={`status-dot ${item.status}`}></span>
            </div>
            <div className="card-bottom">
               <span>{item.type.toUpperCase()}</span>
               {item.status === 'active' && <span className="active-timer">AKTİF</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Seçili masayı bul
  const selectedTable = selectedTableInfo 
    ? (selectedTableInfo.isVip ? vips : tables).find(t => t.id === selectedTableInfo.id)
    : null;

  return (
    <div className="dashboard-wrapper">
      {getActiveView()}

      {selectedTable && (
        <div className="modal-overlay" onClick={() => setSelectedTableInfo(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedTableInfo(null)}>✕</button>
            <MachineCard 
              table={selectedTable}
              prices={prices}
              onStart={() => handleStartSession(selectedTable.id, selectedTableInfo.isVip)}
              onEnd={(paymentData) => handleEndSession(selectedTable.id, selectedTableInfo.isVip, paymentData)}
              onUpdateControllers={(count) => handleUpdateControllers(selectedTable.id, selectedTableInfo.isVip, count)}
              onAddProduct={(p) => handleAddProductToTable(selectedTable.id, selectedTableInfo.isVip, p)}
              availableProducts={products}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
