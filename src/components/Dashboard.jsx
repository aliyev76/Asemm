import React, { useState, useEffect, useMemo } from 'react';
import MachineCard from './MachineCard';
import Kantin from './Kantin';
import Settings from './Settings';
import Reports from './Reports';
import AdminSettings from './AdminSettings';
import Kasa from './Kasa';
import './Dashboard.css';
import { translations } from '../lib/i18n/translations';

const INITIAL_PRICES = {
  standart: { 2: 120, 3: 180, 4: 240 },
  vip: { 2: 150, 3: 210, 4: 270 },
  ps5: { 2: 175, 3: 235, 4: 295 } // PS5 Özel Fiyat
};

const MACHINE_GAMES = {
  1: ["PES 15", "PES 18", "PES 21", "FIFA 22", "FIFA 26", "GTA", "Mortal Kombat", "Netflix"],
  2: ["PES 18", "PES 21", "FIFA 24", "FIFA 26", "GTA", "Mortal Kombat", "Assassins Creed", "Netflix"],
  3: ["Netflix"],
  4: ["Netflix"],
  5: ["PES 21", "PES 26", "FIFA 26", "Asphalt", "Mortal Kombat", "Netflix"],
  6: ["PES 18", "PES 21", "PES 26", "FIFA 24", "Netflix"], // Masa 6 (Eski v2)
  7: ["PES 21", "PES 26", "FIFA 26", "Mortal Kombat", "NBA", "Netflix"], // Masa 7 (Eski 10'un cihazı)
  8: ["PES 18", "PES 21", "PES 26", "FIFA 26", "Netflix"],
  9: ["PES 26", "FIFA 24", "FIFA 25", "FIFA 26", "Asphalt", "Mortal Kombat", "Netflix"],
  10: ["PS5", "PES 21", "PES 26", "FIFA 25", "FIFA 26", "NBA 2K25", "Mortal Kombat 1", "Netflix"], // Masa 10 (Yeni PS5)
  11: ["Netflix"],
  12: ["PES 18", "PES 21", "PES 26", "FIFA 25", "Mortal Kombat", "Netflix"],
  13: ["PES 21", "PES 26", "FIFA 24", "Netflix"],
  'v1': ["PES 21", "PES 26", "FIFA 26", "Mortal Kombat", "Netflix"], // Sinema (Eski 7'nin cihazı)
  'v2': ["PES 18", "PES 20", "PES 21", "PES 26", "FIFA 20", "FIFA 24", "FIFA 26", "Mortal Kombat", "Assassins Creed", "Netflix"] // Loca (Eski 6'nın cihazı)
};

const INITIAL_TABLES = [
  ...Array.from({ length: 13 }, (_, i) => ({
    id: i + 1,
    name: `Masa ${i + 1}`,
    type: i + 1 === 10 ? 'ps5' : 'standart',
    status: 'idle',
    startTime: null,
    controllers: 2,
    products: [],
    games: MACHINE_GAMES[i + 1] || []
  }))
];

const INITIAL_VIP = [
  { id: 'v1', name: 'Sinema Odası', type: 'vip', status: 'idle', startTime: null, controllers: 2, products: [], games: MACHINE_GAMES['v1'] },
  { id: 'v2', name: 'Loca', type: 'vip', status: 'idle', startTime: null, controllers: 2, products: [], games: MACHINE_GAMES['v2'] },
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
};

const Dashboard = ({ activeTab }) => {
  // Persistence Loading Helpers
  const getSaved = (key, fallback) => {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    try {
      const parsed = JSON.parse(saved);
      // Sadece masalar ve vips için Date dönüşümü yap (startTime varsa)
      if (Array.isArray(parsed) && (key === 'asemm_tables' || key === 'asemm_vips')) {
        return parsed.map(item => ({
          ...item,
          startTime: item.startTime ? new Date(item.startTime) : null
        }));
      }
      return parsed;
    } catch (e) {
      console.error(`Error loading state for ${key}:`, e);
      return fallback;
    }
  };

  const [tables, setTables] = React.useState(() => getSaved('asemm_tables', INITIAL_TABLES));
  const [vips, setVips] = React.useState(() => getSaved('asemm_vips', INITIAL_VIP));
  const [prices, setPrices] = React.useState(() => getSaved('asemm_prices', INITIAL_PRICES));
  const [logs, setLogs] = React.useState(() => getSaved('asemm_logs', []));
  const [history, setHistory] = React.useState(() => getSaved('asemm_history', []));
  const [products, setProducts] = React.useState(() => getSaved('asemm_products', [
    {"id":1,"name":"COCA COLA TENEKE","price":60,"stock":50, "category": "Soğuk İçecek"},
    {"id":2,"name":"TOST","price":60,"stock":20, "category": "Yemek"},
    {"id":3,"name":"SU","price":15,"stock":100, "category": "Soğuk İçecek"},
    {"id":4,"name":"SADE SODA","price":25,"stock":0, "category": "Soğuk İçecek"},
    {"id":5,"name":"MEYVELİ SODA","price":30,"stock":0, "category": "Soğuk İçecek"},
    {"id":1776542698600,"name":"KURUVASAN","price":50,"stock":0, "category": "Yemek"},
    {"id":1776542770577,"name":"DÖNER YARIM","price":100,"stock":0, "category": "Yemek"},
    {"id":1776542785476,"name":"ALMAN PASTASI","price":50,"stock":0, "category": "Yemek"},
    {"id":1776542800421,"name":"CİĞER YARIM","price":100,"stock":0, "category": "Yemek"},
    {"id":1776542811440,"name":"DÖNER TAM","price":150,"stock":0, "category": "Yemek"},
    {"id":1776542826514,"name":"CİĞER TAM","price":150,"stock":0, "category": "Yemek"},
    {"id":1776542916675,"name":"KEK","price":30,"stock":0, "category": "Yemek"},
    {"id":1776542945319,"name":"COCA COLA 1 LİTRE","price":100,"stock":0, "category": "Soğuk İçecek"},
    {"id":1776542989204,"name":"POĞAÇA","price":30,"stock":0, "category": "Yemek"},
    {"id":1776543038711,"name":"HALLEY","price":50,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543049971,"name":"COCA STAR ÇİKOLATA","price":25,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543071673,"name":"COCO STAR ATIŞTIRMALIK","price":40,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543084100,"name":"ALBENİ ÇİKOLATA","price":30,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543093128,"name":"ALBENİ ATIŞTIRMALIK","price":50,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543107154,"name":"PİKO","price":20,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543129017,"name":"ÜLKER ÇİKOLATALI GOFRET","price":30,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543147512,"name":"PROBİS","price":50,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543271772,"name":"SAKLIKÖY","price":50,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543297137,"name":"ÜLKER NAPOLİTEN","price":60,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543319928,"name":"KARAM ÇİKOLATA","price":50,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543334153,"name":"ÜLKER GOLD GOFRET","price":30,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543339711,"name":"DORE","price":50,"stock":0, "category": "Atıştırmalık"},
    {"id":1776543385180,"name":"TORKU ÇITIR GOFRET","price":20,"stock":0, "category": "Atıştırmalık"},
    {"id":1776544812908,"name":"CİĞER POĞAÇA","price":100,"stock":0, "category": "Yemek"},
    {"id":1776547389874,"name":"PELUŞ OYUNCAK KÜÇÜK","price":100,"stock":0, "category": "Diğer"},
    {"id":1776547400805,"name":"PELUŞ OYUNCAK BÜYÜK","price":150,"stock":0, "category": "Diğer"},
    {"id":1776547418358,"name":"PELUŞ OYUNCAK EN BÜYÜK BOY","price":400,"stock":0, "category": "Diğer"},
    {"id":1777899732000,"name":"CİĞ KÖFTE DÜRÜM","price":70,"stock":0, "category": "Yemek"},
    {"id":1777899732001,"name":"CİĞ KÖFTE PORSİYON","price":100,"stock":0, "category": "Yemek"},
    {"id":1777900000001,"name":"KAHVE","price":40,"stock":0, "category": "Sıcak İçecek"},
    {"id":1777900000002,"name":"ORALET","price":40,"stock":0, "category": "Sıcak İçecek"},
    {"id":1777900000003,"name":"ÇAY","price":30,"stock":0, "category": "Sıcak İçecek"},
    {"id":1777900000004,"name":"ÇOKONAT","price":50,"stock":0, "category": "Atıştırmalık"}
  ]));

  const [openingBalance, setOpeningBalance] = React.useState(() => getSaved('asemm_opening_balance', 0));
  const [expenses, setExpenses] = React.useState(() => getSaved('asemm_expenses', []));

  const [selectedTableInfo, setSelectedTableInfo] = React.useState(null); 
  const [selectedGame, setSelectedGame] = React.useState(null); 
  const [selectedStatus, setSelectedStatus] = React.useState(null); 

  // Tab değişince modalı kapat (üst üste binme hatasını önler)
  React.useEffect(() => {
    setSelectedTableInfo(null);
  }, [activeTab]);

  const t = translations.tr.dashboard; // Şimdilik varsayılan Türkçe

  // EMERGENCY RESCUE: Tüm localStorage'ı tara ve kaybolan verileri bulmaya çalış
  React.useEffect(() => {
    console.log("--- [RESCUE MODE] Scanning LocalStorage for lost data ---");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          // Eğer içinde ürünlere benzeyen bir şeyler varsa logla
          const looksLikeProducts = parsed.some(item => item && (item.name === 'Kola' || (item.price && item.name)));
          if (looksLikeProducts) {
            console.log(`[RESCUE] Potential Product List Found at key: "${key}" (${parsed.length} items)`);
            console.log(JSON.stringify(parsed)); // Kullanıcı bunu kopyalayabilir
          }
        }
      } catch(e) {}
    }
    console.log("--- [RESCUE MODE] Scan Complete ---");
  }, []);

  // Auto-Save Effect & One-time Migration Fix
  React.useEffect(() => {
    const normalizedVips = vips.map(v => {
      if (v.name === 'Loca' && String(v.id) === '6') return { ...v, id: 'v2' };
      // Status - StartTime senkronizasyonu
      if (v.status === 'active' && !v.startTime) return { ...v, status: 'idle' };
      return v;
    });

    const normalizedTables = tables.map(t => {
      if (t.name === 'Masa 6' && String(t.id) === 'v2') return { ...t, id: 6 };
      // Status - StartTime senkronizasyonu
      if (t.status === 'active' && !t.startTime) return { ...t, status: 'idle' };
      // Masa 10 Migration: type -> ps5
      if (t.id === 10 && t.type !== 'ps5') return { ...t, type: 'ps5' };
      return t;
    });

    if (JSON.stringify(normalizedTables) !== JSON.stringify(tables)) setTables(normalizedTables);
    if (JSON.stringify(normalizedVips) !== JSON.stringify(vips)) setVips(normalizedVips);

    // Ürün Listesi Zorunlu Güncelleme: Eğer yeni ürünlerden biri listede yoksa zorla güncelle
    const hasCokonat = products.some(p => p.name === 'ÇOKONAT');
    if (!hasCokonat) {
       console.log("[MIGRATION] Full product list not found, forcing update...");
       const fullList = [
        {"id":1,"name":"COCA COLA TENEKE","price":60,"stock":50, "category": "Soğuk İçecek"},
        {"id":2,"name":"TOST","price":60,"stock":20, "category": "Yemek"},
        {"id":3,"name":"SU","price":15,"stock":100, "category": "Soğuk İçecek"},
        {"id":4,"name":"SADE SODA","price":25,"stock":0, "category": "Soğuk İçecek"},
        {"id":5,"name":"MEYVELİ SODA","price":30,"stock":0, "category": "Soğuk İçecek"},
        {"id":1776542698600,"name":"KURUVASAN","price":50,"stock":0, "category": "Yemek"},
        {"id":1776542770577,"name":"DÖNER YARIM","price":100,"stock":0, "category": "Yemek"},
        {"id":1776542785476,"name":"ALMAN PASTASI","price":50,"stock":0, "category": "Yemek"},
        {"id":1776542800421,"name":"CİĞER YARIM","price":100,"stock":0, "category": "Yemek"},
        {"id":1776542811440,"name":"DÖNER TAM","price":150,"stock":0, "category": "Yemek"},
        {"id":1776542826514,"name":"CİĞER TAM","price":150,"stock":0, "category": "Yemek"},
        {"id":1776542916675,"name":"KEK","price":30,"stock":0, "category": "Yemek"},
        {"id":1776542945319,"name":"COCA COLA 1 LİTRE","price":100,"stock":0, "category": "Soğuk İçecek"},
        {"id":1776542989204,"name":"POĞAÇA","price":30,"stock":0, "category": "Yemek"},
        {"id":1776543038711,"name":"HALLEY","price":50,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543049971,"name":"COCA STAR ÇİKOLATA","price":25,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543071673,"name":"COCO STAR ATIŞTIRMALIK","price":40,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543084100,"name":"ALBENİ ÇİKOLATA","price":30,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543093128,"name":"ALBENİ ATIŞTIRMALIK","price":50,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543107154,"name":"PİKO","price":20,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543129017,"name":"ÜLKER ÇİKOLATALI GOFRET","price":30,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543147512,"name":"PROBİS","price":50,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543271772,"name":"SAKLIKÖY","price":50,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543297137,"name":"ÜLKER NAPOLİTEN","price":60,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543319928,"name":"KARAM ÇİKOLATA","price":50,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543334153,"name":"ÜLKER GOLD GOFRET","price":30,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543339711,"name":"DORE","price":50,"stock":0, "category": "Atıştırmalık"},
        {"id":1776543385180,"name":"TORKU ÇITIR GOFRET","price":20,"stock":0, "category": "Atıştırmalık"},
        {"id":1776544812908,"name":"CİĞER POĞAÇA","price":100,"stock":0, "category": "Yemek"},
        {"id":1776547389874,"name":"PELUŞ OYUNCAK KÜÇÜK","price":100,"stock":0, "category": "Diğer"},
        {"id":1776547400805,"name":"PELUŞ OYUNCAK BÜYÜK","price":150,"stock":0, "category": "Diğer"},
        {"id":1776547418358,"name":"PELUŞ OYUNCAK EN BÜYÜK BOY","price":400,"stock":0, "category": "Diğer"},
        {"id":1777899732000,"name":"CİĞ KÖFTE DÜRÜM","price":70,"stock":0, "category": "Yemek"},
        {"id":1777899732001,"name":"CİĞ KÖFTE PORSİYON","price":100,"stock":0, "category": "Yemek"},
        {"id":1777900000001,"name":"KAHVE","price":40,"stock":0, "category": "Sıcak İçecek"},
        {"id":1777900000002,"name":"ORALET","price":40,"stock":0, "category": "Sıcak İçecek"},
        {"id":1777900000003,"name":"ÇAY","price":30,"stock":0, "category": "Sıcak İçecek"},
        {"id":1777900000004,"name":"ÇOKONAT","price":50,"stock":0, "category": "Atıştırmalık"}
       ];
       setProducts(fullList);
    }

    // Prices Migration: regular -> standart
    if (prices && prices.regular && !prices.standart) {
       console.log("[MIGRATION] Migrating prices from regular to standart...");
       setPrices(prev => ({
         ...prev,
         standart: prev.regular,
         regular: undefined
       }));
    }

    localStorage.setItem('asemm_tables', JSON.stringify(tables));
    localStorage.setItem('asemm_vips', JSON.stringify(vips));
    localStorage.setItem('asemm_prices', JSON.stringify(prices));
    localStorage.setItem('asemm_logs', JSON.stringify(logs));
    localStorage.setItem('asemm_history', JSON.stringify(history));
    localStorage.setItem('asemm_products', JSON.stringify(products));
    localStorage.setItem('asemm_opening_balance', JSON.stringify(openingBalance));
    localStorage.setItem('asemm_expenses', JSON.stringify(expenses));
  }, [tables, vips, prices, logs, history, products, openingBalance, expenses]);

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

  const handleTransferSession = (fromId, fromIsVip, toId) => {
    const fromTable = (fromIsVip ? vips : tables).find(t => t.id === fromId);
    if (!fromTable) return;

    // Hedef masayı bul (VIP mi değil mi kontrol et)
    const isToVip = vips.some(v => v.id === toId);
    const toSetter = isToVip ? setVips : setTables;

    // Hedef masaya klonla
    toSetter(prev => prev.map(t => t.id === toId ? {
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
    const isVip = vips.some(v => String(v.id) === String(id));
    const setter = isVip ? setVips : setTables;
    setter(prev => prev.map(t => String(t.id) === String(id) ? { ...t, games } : t));
  };

  const handleSwapTables = (idA, idB) => {
    const isVipA = vips.some(v => String(v.id) === String(idA));
    const isVipB = vips.some(v => String(v.id) === String(idB));

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

    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const netCashInHand = (parseFloat(openingBalance) || 0) + nakitCount - totalExpenses;

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
      openingBalance: parseFloat(openingBalance) || 0,
      expenses: [...expenses],
      totalExpenses,
      netCashInHand,
      numTransactions: logs.length
    };

    setHistory(prev => [daySummary, ...prev]);
    setLogs([]);
    setExpenses([]);
    setOpeningBalance(netCashInHand.toFixed(2));
    alert("Gün sonu başarıyla alındı ve arşivlendi!");
  };

  const getActiveView = () => {
    if (activeTab === 'kantin') return <Kantin products={products} setProducts={setProducts} />;
    if (activeTab === 'ayarlar') return <Settings prices={prices} setPrices={setPrices} />;
    if (activeTab === 'reports') return (
      <Reports 
        logs={logs} 
        setLogs={setLogs} 
        history={history} 
        onEndDay={handleEndDay} 
        openingBalance={openingBalance}
        expenses={expenses}
      />
    );
    if (activeTab === 'kasa') return (
      <Kasa 
        logs={logs} 
        openingBalance={openingBalance} 
        setOpeningBalance={setOpeningBalance} 
        expenses={expenses} 
        setExpenses={setExpenses} 
      />
    );
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

  const selectedTable = useMemo(() => {
    if (!selectedTableInfo) return null;
    const list = selectedTableInfo.isVip ? vips : tables;
    let table = list.find(t => String(t.id) === String(selectedTableInfo.id));
    
    // Güvenlik: Eğer yanlış listede arandıysa diğerine de bak
    if (!table) {
      table = [...tables, ...vips].find(t => String(t.id) === String(selectedTableInfo.id));
    }
    return table;
  }, [selectedTableInfo, tables, vips]);

  return (
    <div className="dashboard-wrapper">
      {getActiveView()}

      {selectedTable && (
        <div className="modal-overlay" onClick={() => setSelectedTableInfo(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedTableInfo(null)}>✕</button>
            <MachineCard 
              key={selectedTable.id} // Masa değişince state'i sıfırla
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
