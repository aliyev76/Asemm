import React from 'react';
import './Settings.css';

const Settings = ({ prices, setPrices }) => {
  const handlePriceChange = (type, controllers, value) => {
    setPrices(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [controllers]: parseFloat(value) || 0
      }
    }));
  };

  return (
    <div className="settings-container">
      <div className="card">
        <h2>⚙️ Fiyatlandırma Ayarları</h2>
        <p className="subtitle">Saatlik ücretleri buradan düzenleyebilirsiniz.</p>
        
        <div className="price-sections">
          <div className="settings-section">
            <h3>🎮 Normal Masalar</h3>
            <div className="input-grid">
              {[2, 3, 4].map(num => (
                <div key={num} className="price-input">
                  <label>{num} Kol (TL/Saat)</label>
                  <input 
                    type="number" 
                    value={prices.regular[num]} 
                    onChange={(e) => handlePriceChange('regular', num, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>🌟 VIP Odalar</h3>
            <div className="input-grid">
              {[2, 3, 4].map(num => (
                <div key={num} className="price-input">
                  <label>{num} Kol (TL/Saat)</label>
                  <input 
                    type="number" 
                    value={prices.vip[num]} 
                    onChange={(e) => handlePriceChange('vip', num, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
