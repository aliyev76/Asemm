import React, { useState, useEffect, useMemo } from 'react';
import MachineCard from './MachineCard';
import Kantin from './Kantin';
import Settings from './Settings';
import Reports from './Reports';
import AdminSettings from './AdminSettings';
import './Dashboard.css';
import { translations } from '../lib/i18n/translations';

const INITIAL_PRICES = {
  standart: { 2: 120, 3: 180, 4: 240 },
  vip: { 2: 150, 3: 210, 4: 270 } // VIP için 3 ve 4 kol ekledim (varsayılan artışla)
};

const MACHINE_GAMES = {
  1: ["PES 15", "PES 18", "PES 21", "FIFA 22", "FIFA 26", "GTA", "Mortal Kombat", "Netflix"],
  2: ["PES 18", "PES 21", "FIFA 24", "FIFA 26", "GTA", "Mortal Kombat", "Assassins Creed", "Netflix"],
  3: ["Netflix"],
  4: ["Netflix"],
  5: ["PES 21", "PES 26", "FIFA 26", "Asphalt", "Mortal Kombat", "Netflix"],
  6: ["PES 18", "PES 20", "PES 21", "PES 26", "FIFA 20", "FIFA 24", "FIFA 26", "Mortal Kombat", "Assassins Creed", "Netflix"],
  7: ["PES 21", "PES 26", "FIFA 26", "Mortal Kombat", "Netflix"],
  8: ["PES 18", "PES 21", "PES 26", "FIFA 26", "Netflix"],
  9: ["PES 26", "FIFA 24", "FIFA 25", "FIFA 26", "Asphalt", "Mortal Kombat", "Netflix"],
  10: ["PES 21", "PES 26", "FIFA 26", "Mortal Kombat", "NBA", "Netflix"],
  11: ["Netflix"],
  12: ["PES 18", "PES 21", "PES 26", "FIFA 25", "Mortal Kombat", "Netflix"],
  13: ["PES 21", "PES 26", "FIFA 24", "Netflix"],
  'v1': ["Netflix"],
  'v2': ["PES 18", "PES 21", "PES 26", "FIFA 24", "Netflix"]
};

const INITIAL_TABLES = [
  ...Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `Masa ${i + 1}`,
    type: 'standart',
    status: 'idle',
    startTime: null,
    controllers: 2,
    products: [],
    games: MACHINE_GAMES[i + 1] || []
  })),
  { id: 'v2', name: 'Masa 6', type: 'standart', status: 'idle', startTime: null, controllers: 2, products: [], games: MACHINE_GAMES[6] },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: i + 7,
    name: `Masa ${i + 7}`,
    type: 'standart',
    status: 'idle',
    startTime: null,
    controllers: 2,
    products: [],
    games: MACHINE_GAMES[i + 7] || []
  }))
];

const INITIAL_VIP = [
  { id: 'v1', name: 'Sinema Odası', type: 'vip', status: 'idle', startTime: null, controllers: 2, products: [], games: MACHINE_GAMES['v1'] },
  { id: 6, name: 'Loca', type: 'vip', status: 'idle', startTime: null, controllers: 2, products: [], games: MACHINE_GAMES['v2'] },
];

const sortGames = (a, b) => {
  const getWeight = (game) => {
    if (game.startsWith('PES')) return 1;
    if (game.startsWith('FIFA')) return 2;
    return 3;
  };
  const weightA = getWeight(a);
  const weightB = getWeight(b);
  if (weightA !== weightB) return weightA - weightB;
  return a.localeCompare(b, undefined, { numeric: true }); // e.g. PES 15 before PES 18
};

const Dashboard = ({ activeTab }) => {
  // Persistence Loading Helpers
  const getSaved = (key, fallback) => {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    try {
      const parsed = JSON.parse(saved);
      // Date nesnelerini geri yükle (startTime varsa)
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          ...item,
          startTime: item.startTime ? new Date(item.startTime) : null
        }));
      }
      return parsed;
    } catch (e) {
      return fallback;
    }
  };

  const [tables, setTables] = useState(() => getSaved('asemm_tables', INITIAL_TABLES));
  const [vips, setVips] = useState(() => getSaved('asemm_vips', INITIAL_VIP));
  const [prices, setPrices] = useState(() => getSaved('asemm_prices', INITIAL_PRICES));
  const [logs, setLogs] = useState(() => getSaved('asemm_logs', []));
  const [history, setHistory] = useState(() => getSaved('asemm_history', []));
  const [products, setProducts] = useState(() => getSaved('asemm_products', [
    { id: 1, name: 'Kola', price: 30, stock: 50 },
    { id: 2, name: 'Tost', price: 60, stock: 20 },
    { id: 3, name: 'Su', price: 10, stock: 100 },
  ]));

  const [selectedTableInfo, setSelectedTableInfo] = useState(null); 
  const [selectedGame, setSelectedGame] = useState(null); 
  const [selectedStatus, setSelectedStatus] = useState(null); 

  const t = translations.tr.dashboard; // Şimdilik varsayılan Türkçe

  // Auto-Save Effect & One-time Migration Fix
  useEffect(() => {
    // Veri Tutarlılığı Kontrolü (Masa 6 / Loca Swap Fix if needed)
    const fixMasa6 = (items) => items.map(t => {
      // Type 'regular' -> 'standart' migration
      let item = t;
      if (item.type === 'regular') item = { ...item, type: 'standart' };

      // Eğer Masa 6 boşsa veya oyunları eksikse INITIAL_...'daki güncel oyunları bas
      if ((item.name === 'Masa 6' || item.id === 6 || item.id === 'v2') && (!item.games || item.games.length === 0)) {
        const sourceId = item.name === 'Masa 6' ? 6 : (item.name === 'Loca' ? 'v2' : item.id);
        return { ...item, games: MACHINE_GAMES[sourceId] || [] };
      }
      return item;
    });

    // Prices migration (regular -> standart)
    if (prices.regular) {
      setPrices(prev => {
        const newPrices = { ...prev, standart: prev.regular };
        delete newPrices.regular;
        return newPrices;
      });
    }

    const fixedTables = fixMasa6(tables);
    const fixedVips = fixMasa6(vips);

    if (JSON.stringify(fixedTables) !== JSON.stringify(tables)) setTables(fixedTables);
    if (JSON.stringify(fixedVips) !== JSON.stringify(vips)) setVips(fixedVips);

    localStorage.setItem('asemm_tables', JSON.stringify(tables));
    localStorage.setItem('asemm_vips', JSON.stringify(vips));
    localStorage.setItem('asemm_prices', JSON.stringify(prices));
    localStorage.setItem('asemm_logs', JSON.stringify(logs));
    localStorage.setItem('asemm_history', JSON.stringify(history));
    localStorage.setItem('asemm_products', JSON.stringify(products));
  }, [tables, vips, prices, logs, history, products]);

  const allGames = useMemo(() => {
    const games = new Set();
    Object.values(MACHINE_GAMES).forEach(list => list.forEach(g => games.add(g)));
    return Array.from(games).sort(sortGames);
  }, []);

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

  const handleCancelSession = (id, isVip) => {
    const setter = isVip ? setVips : setTables;
    setter(prev => prev.map(t => t.id === id ? { ...t, status: 'idle', startTime: null, products: [] } : t));
    setSelectedTableInfo(null);
  };

  const handleTransferSession = (fromId, fromIsVip, toIdStr) => {
    const isToVip = String(toIdStr).startsWith('v');
    const toIdParsed = isToVip ? toIdStr : Number(toIdStr);

    const fromTable = (fromIsVip ? vips : tables).find(t => t.id === fromId);
    if (!fromTable) return;

    // Hedef masaya klonla
    const toSetter = isToVip ? setVips : setTables;
    toSetter(prev => prev.map(t => t.id === toIdParsed ? {
      ...t,
      status: 'active',
      startTime: fromTable.startTime,
      products: fromTable.products,
      controllers: fromTable.controllers
    } : t));

    // Eski masayı sıfırla
    const fromSetter = fromIsVip ? setVips : setTables;
    fromSetter(prev => prev.map(t => t.id === fromId ? { ...t, status: 'idle', startTime: null, products: [] } : t));

    setSelectedTableInfo(null);
  };

  const handleUpdateTableGames = (id, games) => {
    const isVip = String(id).startsWith('v');
    const setter = isVip ? setVips : setTables;
    setter(prev => prev.map(t => String(t.id) === String(id) ? { ...t, games } : t));
  };

  const handleSwapTables = (idA, idB) => {
    const isVipA = String(idA).startsWith('v');
    const isVipB = String(idB).startsWith('v');

    const tableA = [...vips, ...tables].find(t => String(t.id) === String(idA));
    const tableB = [...vips, ...tables].find(t => String(t.id) === String(idB));

    if (!tableA || !tableB) return;

    setTables(prev => prev.map(t => {
      if (String(t.id) === String(idA)) return { ...t, ...tableB, id: tableA.id, name: tableA.name }; 
      if (String(t.id) === String(idB)) return { ...t, ...tableA, id: tableB.id, name: tableB.name };
      return t;
    }));

    if (isVipA || isVipB) {
      setVips(prev => prev.map(t => {
        if (String(t.id) === String(idA)) return { ...t, ...tableB, id: tableA.id, name: tableA.name };
        if (String(t.id) === String(idB)) return { ...t, ...tableA, id: tableB.id, name: tableB.name };
        return t;
      }));
    }
  };

  const handleUpdateStartTime = (id, isVip, timeStr) => {
    if (!timeStr) return;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const setter = isVip ? setVips : setTables;
    
    setter(prev => prev.map(t => {
      if (String(t.id) !== String(id)) return t;
      // Mevcut tarihin gün/ay/yıl bilgisini koru, sadece saat ve dakikayı güncelle
      const newStart = new Date(t.startTime);
      newStart.setHours(hours, minutes, 0, 0);
      
      // Eğer girilen saat şu andan ilerideyse ve biz gece yarısını geçtiysek 
      // (Örn: Saat gece 01:00 am, biz başlangıcı 23:00 yaptık), başlangıç gününü bir geri al.
      const now = new Date();
      if (newStart > now) {
         newStart.setDate(newStart.getDate() - 1);
      }

      return { ...t, startTime: newStart };
    }));
  };

  const handleEndDay = () => {
    if (logs.length === 0) {
      alert("Henüz işlem yapılmamış, gün sonu alınamaz.");
      return;
    }

    const total = logs.reduce((sum, l) => sum + (parseFloat(l.total) || 0), 0);
    const nakitCount = logs.reduce((sum, l) => sum + (parseFloat(l.nakit) || 0), 0);
    const ibanCount = logs.reduce((sum, l) => sum + (parseFloat(l.iban) || 0), 0);
    const debtCount = logs.reduce((sum, l) => sum + (parseFloat(l.debt) || 0), 0);
    const productsTotal = logs.reduce((sum, l) => sum + (parseFloat(l.productsTotal) || 0), 0);
    const timeTotal = logs.reduce((sum, l) => sum + (parseFloat(l.timeTotal) || 0), 0);

    const productStats = {};
    const debtorLogs = logs.filter(l => l.debt > 0).map(l => ({
      tableName: l.tableName,
      debt: l.debt,
      note: l.note || 'İsimsiz',
      timestamp: l.timestamp
    }));

    logs.forEach(log => {
      log.products.forEach(p => {
        if (!productStats[p.name]) productStats[p.name] = { count: 0, revenue: 0 };
        productStats[p.name].count += 1;
        productStats[p.name].revenue += p.price;
      });
    });

    const daySummary = {
      id: Date.now(),
      date: new Date().toLocaleDateString('tr-TR'),
      fullDate: new Date().toLocaleString('tr-TR'),
      total,
      nakit: nakitCount,
      iban: ibanCount,
      debt: debtCount,
      productsTotal,
      timeTotal,
      productStats,
      debtorLogs,
      numTransactions: logs.length
    };

    setHistory(prev => [daySummary, ...prev]);
    setLogs([]);
    alert("Gün sonu başarıyla alındı ve arşivlendi!");
  };

  const getActiveView = () => {
    if (activeTab === 'kantin') return <Kantin products={products} setProducts={setProducts} />;
    if (activeTab === 'ayarlar') return <Settings prices={prices} setPrices={setPrices} />;
    if (activeTab === 'reports') return <Reports logs={logs} setLogs={setLogs} history={history} onEndDay={handleEndDay} />;
    if (activeTab === 'yonetim') return (
      <AdminSettings 
        tables={tables} 
        vips={vips} 
        onUpdateTableGames={handleUpdateTableGames} 
        onSwapTables={handleSwapTables}
      />
    );
    
    let displayItems = [];
    if (activeTab === 'dashboard') displayItems = [...vips, ...tables];
    if (activeTab === 'masalar') displayItems = tables;
    if (activeTab === 'vips') displayItems = vips;

    // Duruma göre filtrele
    if (selectedStatus && ['dashboard', 'masalar', 'vips'].includes(activeTab)) {
      displayItems = displayItems.filter(item => item.status === selectedStatus);
    }

    // Oyuna göre filtrele
    if (selectedGame && ['dashboard', 'masalar', 'vips'].includes(activeTab)) {
      displayItems = displayItems.filter(item => item.games && item.games.includes(selectedGame));
    }

    return (
      <div className="dashboard-content-wrapper">
        {['dashboard', 'masalar', 'vips'].includes(activeTab) && (
          <div className="filters-container">
            <div className="filter-group">
              <span className="filter-label">{t.filter_status}</span>
              <div className="chips-container">
                 <button className={`game-chip ${selectedStatus === null ? 'active' : ''}`} onClick={() => setSelectedStatus(null)}>{t.all}</button>
                 <button className={`game-chip status-active ${selectedStatus === 'active' ? 'active' : ''}`} onClick={() => setSelectedStatus('active')}>{t.status_active}</button>
                 <button className={`game-chip status-idle ${selectedStatus === 'idle' ? 'active' : ''}`} onClick={() => setSelectedStatus('idle')}>{t.status_idle}</button>
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">{t.filter_game}</span>
              <div className="chips-container">
                <button 
                  className={`game-chip ${selectedGame === null ? 'active' : ''}`}
                  onClick={() => setSelectedGame(null)}
                >
                  {t.all}
                </button>
                {allGames.map(game => (
                  <button 
                    key={game}
                    className={`game-chip ${selectedGame === game ? 'active' : ''}`}
                    onClick={() => setSelectedGame(game)}
                  >
                    {game}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="grid">
          {displayItems.map(item => (
            <div key={item.id} className={`simple-card ${item.status}`} onClick={() => setSelectedTableInfo({ id: item.id, isVip: item.type === 'vip' })}>
              <div className="card-top">
                <span className="name">{item.name}</span>
                <span className={`status-dot ${item.status}`}></span>
              </div>
              {item.games && item.games.length > 0 && (
                <div className="card-games">
                  {item.games.slice(0, 3).map(g => <span key={g} className="game-tag">{g}</span>)}
                  {item.games.length > 3 && <span className="game-tag">+{item.games.length - 3}</span>}
                </div>
              )}
              <div className="card-bottom">
                 <span>{t[item.type]}</span>
                 {item.status === 'active' ? (
                   <span className="active-timer">{t.status_active.toUpperCase()}</span>
                 ) : (
                   <span style={{color: 'var(--success)'}}>{t.status_idle.toUpperCase()}</span>
                 )}
              </div>
            </div>
          ))}
        </div>
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
              onCancel={() => handleCancelSession(selectedTable.id, selectedTableInfo.isVip)}
              onTransfer={(toId) => handleTransferSession(selectedTable.id, selectedTableInfo.isVip, toId)}
              onUpdateStartTime={(timeStr) => handleUpdateStartTime(selectedTable.id, selectedTableInfo.isVip, timeStr)}
              availableIdleTables={[...tables, ...vips].filter(t => t.status === 'idle' && t.id !== selectedTable.id)}
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
