import React from 'react';
import './Reports.css';

const Reports = ({ logs, setLogs, history, onEndDay, openingBalance = 0, expenses = [] }) => {
  const [view, setView] = React.useState('live'); // 'live' or 'history'
  const [selectedDay, setSelectedDay] = React.useState(null);
  const [isConfirming, setIsConfirming] = React.useState(false);
  
  const totalRevenue = logs.reduce((sum, log) => sum + (parseFloat(log.total) || 0), 0);
  const totalNakit = logs.reduce((sum, log) => sum + (parseFloat(log.nakit) || 0), 0);
  const totalIban = logs.reduce((sum, log) => sum + (parseFloat(log.iban) || 0), 0);
  const totalDebt = logs.reduce((sum, log) => sum + (parseFloat(log.debt) || 0), 0);
  const totalProducts = logs.reduce((sum, log) => sum + (parseFloat(log.productsTotal) || 0), 0);
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const netCashInHand = (parseFloat(openingBalance) || 0) + totalNakit - totalExpenses;

  const calculateProductStats = (data) => {
    const stats = {};
    data.forEach(log => {
      log.products.forEach(p => {
        if (!stats[p.name]) {
          stats[p.name] = { count: 0, revenue: 0 };
        }
        stats[p.name].count += 1;
        stats[p.name].revenue += p.price;
      });
    });
    return stats;
  };

  const currentProductStats = calculateProductStats(logs);

  const handleEndDay = () => {
    onEndDay();
    setIsConfirming(false);
  };

  return (
    <div className="reports-container">
      <div className="reports-nav">
        <button className={`rpt-tab ${view === 'live' ? 'active' : ''}`} onClick={() => setView('live')}>Canlı Rapor</button>
        <button className={`rpt-tab ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>Geçmiş Arşiv ({history.length})</button>
      </div>

      {view === 'live' ? (
        <>
          <div className="report-summary-grid">
            <div className="card stat-card total">
              <span className="label">Bugünkü Ciro</span>
              <span className="value">{totalRevenue.toFixed(2)} TL</span>
            </div>
            <div className="card stat-card nakit">
              <span className="label">💵 Nakit</span>
              <span className="value">{totalNakit.toFixed(2)} TL</span>
            </div>
            <div className="card stat-card iban">
              <span className="label">📱 IBAN</span>
              <span className="value">{totalIban.toFixed(2)} TL</span>
            </div>
            <div className="card stat-card debt">
              <span className="label">⚠️ Borç</span>
              <span className="value">{totalDebt.toFixed(2)} TL</span>
            </div>
            <div className="card stat-card expense">
              <span className="label">📉 Gider</span>
              <span className="value">-{totalExpenses.toFixed(2)} TL</span>
            </div>
            <div className="card stat-card total-cash">
              <span className="label">💰 Kasa (Nakit)</span>
              <span className="value highlight">{netCashInHand.toFixed(2)} TL</span>
            </div>
          </div>

          <div className="report-details-grid">
            <div className="card">
              <h3>📦 Bugünkü Ürün Satışları</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(currentProductStats).map(([name, stat]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{stat.count}</td>
                      <td>{stat.revenue.toFixed(2)} TL</td>
                    </tr>
                  ))}
                  {Object.keys(currentProductStats).length === 0 && <tr><td colSpan="3" className="empty-row">Kayıt yok.</td></tr>}
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
                      <div className="log-methods">
                         {log.nakit > 0 && <span className="m-tag n">N:{log.nakit}</span>}
                         {log.iban > 0 && <span className="m-tag i">I:{log.iban}</span>}
                         {log.debt > 0 && <span className="m-tag d" title={log.note}>B:{log.debt}</span>}
                      </div>
                      <span className="log-amount">{log.total.toFixed(2)} TL</span>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <p className="empty-msg">Kayıt yok.</p>}
              </div>

              {logs.length > 0 && (
                <div className="end-day-box">
                  {!isConfirming ? (
                    <button className="end-day-btn" onClick={() => setIsConfirming(true)}>Günü Bitir ve Arşivle 📁</button>
                  ) : (
                    <div className="confirm-end-day">
                      <p>Günü kapatmak istediğine emin misin? </p>
                      <button className="confirm-btn yes" onClick={handleEndDay}>Evet, Bitir</button>
                      <button className="confirm-btn no" onClick={() => setIsConfirming(false)}>İptal</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="history-sec">
          <div className="history-list">
            <h3>📂 Arşivlenmiş Günler</h3>
            {history.length === 0 ? <p className="empty-msg">Henüz arşivlenmiş gün yok.</p> : (
              <div className="history-grid">
                {history.map(day => (
                  <div key={day.id} className={`history-card ${selectedDay?.id === day.id ? 'selected' : ''}`} onClick={() => setSelectedDay(day)}>
                    <div className="h-top">
                      <span className="h-date">{day.date}</span>
                      <span className="h-total">{day.total.toFixed(2)} TL</span>
                    </div>
                    <div className="h-bottom">
                      <span>{day.numTransactions} İşlem</span>
                      <span>{day.fullDate.split(' ')[1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedDay && (
            <div className="history-details card">
              <div className="detail-header">
                <h3>📊 {selectedDay.date} Detayları</h3>
                <button className="close-details" onClick={() => setSelectedDay(null)}>×</button>
              </div>
              <div className="summary-pills">
                <div className="pill"><span>Nakit:</span> {selectedDay.nakit.toFixed(2)} TL</div>
                <div className="pill"><span>IBAN:</span> {selectedDay.iban.toFixed(2)} TL</div>
                <div className="pill"><span>Borç:</span> {selectedDay.debt?.toFixed(2) || '0.00'} TL</div>
                <div className="pill"><span>Ürün:</span> {selectedDay.productsTotal.toFixed(2)} TL</div>
                <div className="pill"><span>Oyun:</span> {selectedDay.timeTotal.toFixed(2)} TL</div>
                <div className="pill danger"><span>Gider:</span> {selectedDay.totalExpenses?.toFixed(2) || '0.00'} TL</div>
                <div className="pill success"><span>Net Kasa:</span> {selectedDay.netCashInHand?.toFixed(2) || '0.00'} TL</div>
              </div>

              {selectedDay.expenses && selectedDay.expenses.length > 0 && (
                <div className="history-expenses">
                  <h4>💸 Günlük Giderler</h4>
                  <div className="d-list">
                    {selectedDay.expenses.map((e, i) => (
                      <div key={i} className="d-item expense">
                        <strong>{e.time}</strong> - {e.description}: <span className="d-val">-{e.amount} TL</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.debtorLogs && selectedDay.debtorLogs.length > 0 && (
                <div className="history-debts">
                   <h4>⚠️ Borçlu Listesi</h4>
                   <div className="d-list">
                      {selectedDay.debtorLogs.map((d, i) => (
                        <div key={i} className="d-item">
                           <strong>{d.tableName}</strong> - {d.note}: <span className="d-val">{d.debt} TL</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              <table className="report-table">
                <thead>
                  <tr><th>Ürün</th><th>Adet</th><th>Gelir</th></tr>
                </thead>
                <tbody>
                  {Object.entries(selectedDay.productStats).map(([name, stat]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{stat.count}</td>
                      <td>{stat.revenue.toFixed(2)} TL</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
