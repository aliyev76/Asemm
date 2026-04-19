import React, { useState, useEffect } from 'react';
import './MachineCard.css';
import { translations } from '../lib/i18n/translations';

const MachineCard = ({ table, prices, onStart, onEnd, onCancel, onTransfer, onUpdateStartTime, availableIdleTables, onUpdateControllers, onAddProduct, availableProducts }) => {
  const t = translations.tr; // Genel çeviri nesnesi
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [showTransferMenu, setShowTransferMenu] = useState(false);
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [tempEntryTime, setTempEntryTime] = useState('');
  
  // Ödeme Yönetimi
  const [cashAmount, setCashAmount] = useState(0);
  const [ibanAmount, setIbanAmount] = useState(0);
  const [debtAmount, setDebtAmount] = useState(0);
  const [debtorNote, setDebtorNote] = useState('');

  const formatHHMM = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');

  useEffect(() => {
    let interval;
    if (table.status === 'active') {
      const update = () => {
        const now = new Date();
        const start = new Date(table.startTime);
        setElapsedTime(Math.floor((now - start) / 1000));
      };
      update();
      interval = setInterval(update, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [table.status, table.startTime]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateEffectiveMinutes = () => {
    if (!showPaymentSelection) {
      return Math.max(elapsedTime / 60, 60);
    }
    
    // Parse manual inputs
    if (!customStartTime || !customEndTime) return 60;
    const [startH, startM] = customStartTime.split(':').map(Number);
    const [endH, endM] = customEndTime.split(':').map(Number);
    
    let mins = (endH * 60 + endM) - (startH * 60 + startM);
    if (mins < 0) mins += 24 * 60; // crossed midnight
    return Math.max(mins, 60); // min 1 hour
  };

  const calculateCost = () => {
    const hourlyRate = prices[table.type][table.controllers] || 120;
    const effectiveMinutes = calculateEffectiveMinutes();
    const timeCost = (effectiveMinutes * hourlyRate) / 60;
    const productCost = table.products.reduce((sum, p) => sum + p.price, 0);
    return (timeCost + productCost).toFixed(2);
  };

  const productCostOnly = table.products.reduce((sum, p) => sum + p.price, 0);

  const handleFinish = () => {
    const total = calculateCost();
    const productsTotal = productCostOnly;
    const timeTotal = (total - productsTotal).toFixed(2);

    onEnd({
      total: parseFloat(total),
      productsTotal: parseFloat(productsTotal),
      timeTotal: parseFloat(timeTotal),
      nakit: parseFloat(cashAmount) || 0,
      iban: parseFloat(ibanAmount) || 0,
      debt: parseFloat(debtAmount) || 0,
      note: debtorNote,
      products: [...table.products],
      exactMinutes: calculateEffectiveMinutes()
    });
    setShowPaymentSelection(false);
  };

  const triggerPaymentPhase = () => {
    const total = calculateCost();
    setCustomStartTime(formatHHMM(new Date(table.startTime)));
    setCustomEndTime(formatHHMM(new Date()));
    setCashAmount(total); // Varsayılan nakit
    setIbanAmount(0);
    setDebtAmount(0);
    setDebtorNote('');
    setShowPaymentSelection(true);
  };

  useEffect(() => {
    if (showPaymentSelection) {
      const total = parseFloat(calculateCost());
      const paid = (parseFloat(cashAmount) || 0) + (parseFloat(ibanAmount) || 0);
      setDebtAmount(Math.max(0, total - paid).toFixed(2));
    }
  }, [cashAmount, ibanAmount, showPaymentSelection, customStartTime, customEndTime]);

  const handleEntryEditSave = () => {
    onUpdateStartTime(tempEntryTime);
    setIsEditingEntry(false);
  };

  return (
    <div className={`modal-content-inner ${table.type}`}>
      <div className="modal-header-info">
        <h2 className="modal-title">{table.name}</h2>
        <span className={`type-badge ${table.type}`}>{t.dashboard[table.type]}</span>
      </div>

      <div className="large-timer">
        {!showPaymentSelection ? (
           <div className="active-timer-content">
             {formatTime(elapsedTime)}
             {!isEditingEntry ? (
               <button className="edit-entry-btn" onClick={() => { 
                 setTempEntryTime(formatHHMM(new Date(table.startTime)));
                 setIsEditingEntry(true); 
               }}>🕒 Düzenle</button>
             ) : (
               <div className="entry-edit-box">
                 <input type="time" value={tempEntryTime} onChange={e => setTempEntryTime(e.target.value)} />
                 <button className="save-entry-btn" onClick={handleEntryEditSave}>Set</button>
                 <button className="cancel-entry-btn" onClick={() => setIsEditingEntry(false)}>×</button>
               </div>
             )}
           </div>
        ) : (
          <div className="manual-time-inputs">
             <div className="time-col">
               <label>Giriş</label>
               <input type="time" value={customStartTime} onChange={e => setCustomStartTime(e.target.value)} />
             </div>
             <div className="time-col">
               <label>Çıkış</label>
               <input type="time" value={customEndTime} onChange={e => setCustomEndTime(e.target.value)} />
             </div>
          </div>
        )}
      </div>

      <div className="modal-body-grid">
        <div className="modal-section controllers">
          <h3>🎮 Oyun Kolu Sayısı</h3>
          <div className="controller-selector">
            {[2, 3, 4].map(num => (
              <button 
                key={num} 
                className={`c-btn ${table.controllers === num ? 'selected' : ''}`}
                onClick={() => onUpdateControllers(num)}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="price-info">Saatlik: {prices[table.type][table.controllers]} TL</p>
        </div>

        <div className="modal-section billing">
          <h3>💰 Ücret Bilgisi</h3>
          <div className="billing-details">
            <div className="row">
              <span>Süre Bedeli:</span>
              <span>{(calculateCost() - productCostOnly).toFixed(2)} TL</span>
            </div>
            <div className="row">
              <span>Ürünler:</span>
              <span>{productCostOnly} TL</span>
            </div>
            <div className="divider"></div>
            <div className="row total">
              <span>TOPLAM:</span>
              <span>{calculateCost()} TL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-section products">
          <div className="section-header">
            <h3>🍟 Ekstra Ürünler</h3>
            <button className="add-btn-main" onClick={() => setShowProductMenu(!showProductMenu)}>Ürün Ekle +</button>
          </div>
          
          {showProductMenu && (
            <div className="p-selector-pop">
               {availableProducts.map(p => (
                 <button key={p.id} className="p-option" onClick={() => { onAddProduct(p); setShowProductMenu(false); }}>
                   {p.name} ({p.price} TL)
                 </button>
               ))}
            </div>
          )}

          <div className="p-list-mini">
            {table.products.map((p, idx) => (
              <div key={idx} className="p-tag">{p.name} - {p.price} TL</div>
            ))}
          </div>
      </div>

      <div className="modal-actions">
        {table.status === 'idle' ? (
          <button className="action-btn start-session" onClick={onStart}>Masayı Başlat</button>
        ) : !showPaymentSelection ? (
          <div className="active-actions-grid">
             <button className="action-btn end-session" onClick={triggerPaymentPhase}>Kapat & Ödeme Al</button>
             <div className="secondary-actions">
                <button className="sec-btn danger" onClick={onCancel}>İptal Et</button>
                <div className="transfer-wrapper">
                  <button className="sec-btn info" onClick={() => setShowTransferMenu(!showTransferMenu)}>Aktar</button>
                  {showTransferMenu && (
                    <div className="transfer-menu">
                      {availableIdleTables.length === 0 ? <span className="empty-msg">Boş masa yok</span> : 
                        availableIdleTables.map(t => (
                          <button key={t.id} onClick={() => onTransfer(t.id)}>{t.name}</button>
                        ))
                      }
                    </div>
                  )}
                </div>
             </div>
          </div>
        ) : (
          <div className="payment-selection-box split-payment">
             <div className="split-header">
                <h3>Ödeme Detayları</h3>
                <span className="total-to-pay">Toplam: {calculateCost()} TL</span>
             </div>
             
             <div className="split-inputs">
                <div className="pay-input-group">
                   <label>💵 Nakit Alınan</label>
                   <input 
                      type="number" 
                      value={cashAmount} 
                      onChange={e => setCashAmount(e.target.value)}
                      onClick={(e) => e.target.select()}
                   />
                </div>
                <div className="pay-input-group">
                   <label>📱 IBAN Alınan</label>
                   <input 
                      type="number" 
                      value={ibanAmount} 
                      onChange={e => setIbanAmount(e.target.value)}
                      onClick={(e) => e.target.select()}
                   />
                </div>
             </div>

             {debtAmount > 0 && (
                <div className="debt-notice-box">
                   <div className="debt-row">
                      <span className="debt-label">⚠️ EKSİK / BORÇ:</span>
                      <span className="debt-val">{debtAmount} TL</span>
                   </div>
                   <input 
                      type="text" 
                      placeholder="Müşteri Adı / Not..." 
                      className="debtor-input"
                      value={debtorNote}
                      onChange={e => setDebtorNote(e.target.value)}
                   />
                </div>
             )}

             <div className="pay-btns">
                <button className="pay-btn finish" onClick={handleFinish}>✅ Ödemeyi Tamamla</button>
                <button className="pay-btn cancel" onClick={() => setShowPaymentSelection(false)}>Geri Dön</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineCard;
