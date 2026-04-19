import React, { useState } from 'react';
import './AdminSettings.css';

const AdminSettings = ({ tables, vips, onUpdateTableGames, onSwapTables }) => {
  const allItems = [...vips, ...tables];
  const [selectedTableId, setSelectedTableId] = useState(allItems[0]?.id || '');
  const [newGameName, setNewGameName] = useState('');
  
  const [swapA, setSwapA] = useState('');
  const [swapB, setSwapB] = useState('');

  // Use string comparison because select values are always strings
  const selectedTable = allItems.find(t => String(t.id) === String(selectedTableId));

  const handleAddGame = () => {
    if (!newGameName.trim()) return;
    const updatedGames = [...(selectedTable.games || []), newGameName.trim()];
    onUpdateTableGames(selectedTableId, updatedGames);
    setNewGameName('');
  };

  const handleRemoveGame = (gameToRemove) => {
    const updatedGames = selectedTable.games.filter(g => g !== gameToRemove);
    onUpdateTableGames(selectedTableId, updatedGames);
  };

  const handleSwap = () => {
    if (!swapA || !swapB || swapA === swapB) {
      alert("Lütfen iki farklı masa seçin.");
      return;
    }
    onSwapTables(swapA, swapB);
    setSwapA('');
    setSwapB('');
    alert("Masalar başarıyla takas edildi!");
  };

  return (
    <div className="admin-settings-container">
      <div className="admin-grid">
        {/* Oyun Yönetimi */}
        <div className="card admin-card">
          <h3>🎮 Masa Oyunlarını Düzenle</h3>
          <div className="admin-form-group">
            <label>Masa Seçin</label>
            <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)}>
              {allItems.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.type.toUpperCase()})</option>
              ))}
            </select>
          </div>

          {selectedTable && (
            <div className="game-edit-section">
              <div className="current-games-list">
                <h4>Mevcut Oyunlar:</h4>
                <div className="admin-game-tags">
                  {selectedTable.games?.map((g, idx) => (
                    <span key={idx} className="admin-game-tag">
                      {g} 
                      <button className="remove-game-btn" onClick={() => handleRemoveGame(g)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="add-game-input">
                <input 
                  type="text" 
                  placeholder="Yeni oyun adı..." 
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGame()}
                />
                <button className="add-btn" onClick={handleAddGame}>Ekle</button>
              </div>
            </div>
          )}
        </div>

        {/* Masa Takas Yerleşimi */}
        <div className="card admin-card">
          <h3>🔄 PS / Masa Yerlerini Değiştir</h3>
          <p className="admin-hint">Seçilen iki masanın tüm durumunu (İsim, Oyunlar, Aktiflik süresi vb.) takas eder.</p>
          
          <div className="swap-controls">
            <div className="admin-form-group">
              <label>1. Masa</label>
              <select value={swapA} onChange={(e) => setSwapA(e.target.value)}>
                <option value="">Seçiniz...</option>
                {allItems.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            <div className="swap-icon">⇅</div>

            <div className="admin-form-group">
              <label>2. Masa</label>
              <select value={swapB} onChange={(e) => setSwapB(e.target.value)}>
                <option value="">Seçiniz...</option>
                {allItems.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <button className="main-btn swap-action-btn" onClick={handleSwap}>
              Yerlerini Değiştir
            </button>
          </div>
        </div>
      </div>
      
      <div className="admin-footer-actions">
          <button className="main-btn save-all-btn" onClick={() => alert("Tüm değişiklikler kalıcı olarak kaydedildi! ✅")}>
             💾 DEĞİŞİKLİKLERİ KAYDET
          </button>
          <p className="admin-save-hint">Sistem tüm değişiklikleri otomatik olarak tarayıcıya kaydeder.</p>
      </div>
    </div>
  );
};

export default AdminSettings;
