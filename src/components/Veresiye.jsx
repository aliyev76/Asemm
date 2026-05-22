import React, { useState } from 'react';
import './Veresiye.css';

const Veresiye = ({ debts, setDebts, setLogs, openingBalance, setOpeningBalance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [payAmount, setPayAmount] = useState({});
  const [payMethod, setPayMethod] = useState({});

  const filteredDebts = debts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);

  const handlePay = (debtId) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const amountToPay = parseFloat(payAmount[debtId]) || debt.amount;
    const method = payMethod[debtId] || 'nakit';

    if (amountToPay <= 0 || amountToPay > debt.amount) {
      alert("Geçerli bir tutar girin.");
      return;
    }

    // Kalan borcu hesapla
    const remaining = debt.amount - amountToPay;

    if (remaining > 0) {
      // Kısmi ödeme
      setDebts(prev => prev.map(d => d.id === debtId ? { ...d, amount: remaining } : d));
    } else {
      // Tamamı ödendi
      setDebts(prev => prev.filter(d => d.id !== debtId));
    }

    // Günlük kasa loglarına (ve nakit bakiyesine) ekle
    const paymentLog = {
      tableName: `Tahsilat: ${debt.name} (${debt.tableName})`,
      total: amountToPay,
      nakit: method === 'nakit' ? amountToPay : 0,
      iban: method === 'iban' ? amountToPay : 0,
      debt: 0,
      discount: 0,
      note: 'Veresiye Tahsilatı',
      timestamp: new Date(),
      productsTotal: 0,
      timeTotal: 0,
      products: [],
      exactMinutes: 0
    };

    setLogs(prev => [...prev, paymentLog]);
    
    if (method === 'nakit') {
      setOpeningBalance(prev => (parseFloat(prev) + amountToPay).toFixed(2));
    }

    alert(`Başarıyla ${amountToPay} TL tahsil edildi!`);
  };

  return (
    <div className="veresiye-container">
      <div className="v-header">
        <h2>📒 Veresiye Defteri (Açık Hesaplar)</h2>
        <div className="v-stats">
          <div className="stat-box warning">
            <span>Toplam Alacak:</span>
            <strong>{totalDebt.toFixed(2)} TL</strong>
          </div>
        </div>
      </div>

      <div className="v-toolbar">
        <input 
          type="text" 
          placeholder="İsim veya Masa ara..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="v-search"
        />
      </div>

      <div className="v-list">
        {filteredDebts.length === 0 ? (
          <div className="empty-msg">Kayıtlı veresiye bulunmamaktadır.</div>
        ) : (
          filteredDebts.map(debt => (
            <div key={debt.id} className="v-card">
              <div className="v-info">
                <h4>{debt.name}</h4>
                <p className="v-date">{debt.date} - {debt.tableName}</p>
              </div>
              <div className="v-amount">
                {debt.amount.toFixed(2)} TL
              </div>
              <div className="v-actions">
                <input 
                  type="number" 
                  placeholder="Ödenen Tutar" 
                  defaultValue={debt.amount}
                  onChange={e => setPayAmount(prev => ({ ...prev, [debt.id]: e.target.value }))}
                  className="v-input"
                />
                <select 
                  onChange={e => setPayMethod(prev => ({ ...prev, [debt.id]: e.target.value }))}
                  defaultValue="nakit"
                  className="v-select"
                >
                  <option value="nakit">Nakit</option>
                  <option value="iban">IBAN</option>
                </select>
                <button className="v-btn success" onClick={() => handlePay(debt.id)}>Tahsil Et</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Veresiye;
