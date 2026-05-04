import React, { useState, useMemo } from 'react';
import './Kasa.css';

const Kasa = ({ logs, openingBalance, setOpeningBalance, expenses, setExpenses }) => {
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });

  // Bugünkü nakit gelirleri loglardan hesapla
  const todayCashIncome = useMemo(() => {
    return logs.reduce((sum, log) => sum + (parseFloat(log.nakit) || 0), 0);
  }, [logs]);

  // Bugünkü toplam gideri hesapla
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  }, [expenses]);

  // Kasada olması gereken toplam nakit
  const netCashInHand = (parseFloat(openingBalance) || 0) + todayCashIncome - totalExpenses;

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    setExpenses([{
      id: Date.now(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }, ...expenses]);

    setNewExpense({ description: '', amount: '' });
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="kasa-container">
      <div className="kasa-summary-grid">
        <div className="card kasa-stat-card opening">
          <span className="label">🌅 Geceden Devreden</span>
          <div className="input-with-symbol">
            <input 
              type="number" 
              value={openingBalance} 
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0.00"
            />
            <span className="symbol">TL</span>
          </div>
        </div>

        <div className="card kasa-stat-card income">
          <span className="label">📈 Bugün Gelen Nakit</span>
          <span className="value">+{todayCashIncome.toFixed(2)} TL</span>
        </div>

        <div className="card kasa-stat-card spending">
          <span className="label">📉 Toplam Gider</span>
          <span className="value">-{totalExpenses.toFixed(2)} TL</span>
        </div>

        <div className="card kasa-stat-card total-cash">
          <span className="label">💰 Kasadaki Net Nakit</span>
          <span className="value highlight">{netCashInHand.toFixed(2)} TL</span>
        </div>
      </div>

      <div className="kasa-main-grid">
        <div className="card expense-form-card">
          <h3>💸 Gider Ekle</h3>
          <form onSubmit={handleAddExpense}>
            <div className="input-group">
              <label>Açıklama</label>
              <input 
                type="text" 
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                placeholder="Örn: Ekmek, Temizlik malzemesi..."
              />
            </div>
            <div className="input-group">
              <label>Tutar (TL)</label>
              <input 
                type="number" 
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <button className="main-btn danger" type="submit">Gideri Kaydet</button>
          </form>
        </div>

        <div className="card expense-list-card">
          <h3>📋 Bugünkü Giderler</h3>
          <div className="expense-list">
            {expenses.map(exp => (
              <div key={exp.id} className="expense-item">
                <div className="exp-info">
                  <span className="exp-time">{exp.time}</span>
                  <span className="exp-desc">{exp.description}</span>
                </div>
                <div className="exp-actions">
                  <span className="exp-amount">-{exp.amount.toFixed(2)} TL</span>
                  <button className="del-btn" onClick={() => removeExpense(exp.id)}>🗑️</button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <p className="empty-msg">Henüz gider girilmedi.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kasa;
