import React from 'react';
import './Reports.css';

const Reports = ({ logs, setLogs }) => {
  const [isConfirming, setIsConfirming] = React.useState(false);
  
  const totalRevenue = logs.reduce((sum, log) => sum + log.total, 0);
  const totalNakit = logs.filter(l => l.method === 'Nakit').reduce((sum, log) => sum + log.total, 0);
  const totalIban = logs.filter(l => l.method === 'IBAN').reduce((sum, log) => sum + log.total, 0);
  const totalProducts = logs.reduce((sum, log) => sum + log.productsTotal, 0);

  // ... (rest of the calculation stays same)
  const productStats = {};
  logs.forEach(log => {
    log.products.forEach(p => {
      if (!productStats[p.name]) {
        productStats[p.name] = { count: 0, revenue: 0 };
      }
      productStats[p.name].count += 1;
      productStats[p.name].revenue += p.price;
    });
  });

  const handleClear = () => {
    setLogs([]);
    setIsConfirming(false);
  };

  return (
    <div className="reports-container">
      {/* ... previous content ... */}
      <div className="report-summary-grid">
        {/* ... stats ... */}
        <div className="card stat-card total">
          <span className="label">Toplam Ciro</span>
          <span className="value">{totalRevenue.toFixed(2)} TL</span>
        </div>
        <div className="card stat-card nakit">
          <span className="label">💵 Toplam Nakit</span>
          <span className="value">{totalNakit.toFixed(2)} TL</span>
        </div>
        <div className="card stat-card iban">
          <span className="label">📱 Toplam IBAN</span>
          <span className="value">{totalIban.toFixed(2)} TL</span>
        </div>
        <div className="card stat-card products">
          <span className="label">🍟 Ürün Geliri</span>
          <span className="value">{totalProducts.toFixed(2)} TL</span>
        </div>
      </div>

      <div className="report-details-grid">
        <div className="card">
          <h3>📦 Ürün Satış Detayları</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Ürün Adı</th>
                <th>Adet</th>
                <th>Toplam Gelir</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(productStats).map(([name, stat], idx) => (
                <tr key={idx}>
                  <td>{name}</td>
                  <td>{stat.count}</td>
                  <td>{stat.revenue.toFixed(2)} TL</td>
                </tr>
              ))}
              {Object.keys(productStats).length === 0 && (
                <tr><td colSpan="3" style={{textAlign: 'center', color: 'var(--text-muted)'}}>Henüz satış yapılmadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>🕒 Son İşlemler</h3>
          <div className="logs-list">
             {logs.slice().reverse().map((log, idx) => (
               <div key={idx} className="log-item">
                  <div className="log-info">
                    <span className="log-table">{log.tableName}</span>
                    <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="log-data">
                    <span className={`log-method ${log.method.toLowerCase()}`}>{log.method}</span>
                    <span className="log-amount">{log.total.toFixed(2)} TL</span>
                  </div>
               </div>
             ))}
             {logs.length === 0 && <p className="empty-msg">Bugün henüz işlem yapılmadı.</p>}
          </div>
          
          {logs.length > 0 && (
            <div className="clear-report-box">
              {!isConfirming ? (
                <button className="clear-btn" onClick={() => setIsConfirming(true)}>Gün Sonunu Temizle</button>
              ) : (
                <div className="confirm-actions">
                  <p>Tüm kayıtlar silinsin mi?</p>
                  <button className="confirm-btn yes" onClick={handleClear}>Evet, Sil</button>
                  <button className="confirm-btn no" onClick={() => setIsConfirming(false)}>İptal</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
