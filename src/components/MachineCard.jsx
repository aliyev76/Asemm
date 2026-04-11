import React, { useState, useEffect } from 'react';
import './MachineCard.css';

const MachineCard = ({ table, prices, onStart, onEnd, onUpdateControllers, onAddProduct, availableProducts }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);

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

  const calculateCost = () => {
    const hourlyRate = prices[table.type][table.controllers] || 120;
    let effectiveMinutes = elapsedTime / 60;
    
    // İlk 1 saat dolana kadar 60 dakika olarak hesapla
    if (effectiveMinutes < 60) {
      effectiveMinutes = 60;
    }

    const timeCost = (effectiveMinutes * hourlyRate) / 60;
    const productCost = table.products.reduce((sum, p) => sum + p.price, 0);
    return (timeCost + productCost).toFixed(2);
  };

  const productCostOnly = table.products.reduce((sum, p) => sum + p.price, 0);

  const handleFinish = (method) => {
    const total = calculateCost();
    const productsTotal = productCostOnly;
    const timeTotal = (total - productsTotal).toFixed(2);

    onEnd({
      total: parseFloat(total),
      productsTotal: parseFloat(productsTotal),
      timeTotal: parseFloat(timeTotal),
      method, // 'Nakit' or 'IBAN'
      products: [...table.products]
    });
    setShowPaymentSelection(false);
  };

  return (
    <div className={`modal-content-inner ${table.type}`}>
      <div className="modal-header-info">
        <h2 className="modal-title">{table.name}</h2>
        <span className={`type-badge ${table.type}`}>{table.type.toUpperCase()}</span>
      </div>

      <div className="large-timer">
        {formatTime(elapsedTime)}
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
          <button className="action-btn end-session" onClick={() => setShowPaymentSelection(true)}>Masayı Kapat & Ödeme Al</button>
        ) : (
          <div className="payment-selection-box">
             <p>Ödeme Yöntemi Seçin:</p>
             <div className="pay-btns">
                <button className="pay-btn nakit" onClick={() => handleFinish('Nakit')}>💵 Nakit</button>
                <button className="pay-btn iban" onClick={() => handleFinish('IBAN')}>📱 IBAN</button>
                <button className="pay-btn cancel" onClick={() => setShowPaymentSelection(false)}>İptal</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineCard;
