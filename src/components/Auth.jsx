import React, { useState } from 'react';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Şimdilik basit bir şifre: 1453 veya istediğin bir şey
    if (pin === '1453') {
      onLogin();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="auth-overlay">
      <div className={`auth-card ${error ? 'error' : ''}`}>
        <div className="auth-header">
          <img src="/src/assets/logo.png" alt="Logo" />
          <h2>ASEMM LOGIN</h2>
          <p>Lütfen giriş şifresini giriniz</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="pin-display">
            {['', '', '', ''].map((_, i) => (
              <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`}></div>
            ))}
          </div>
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            autoFocus
            className="hidden-input"
          />
          <div className="keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((key) => (
              <button 
                key={key} 
                type="button"
                onClick={() => {
                  if (key === 'C') setPin('');
                  else if (key === '✓') handleSubmit({ preventDefault: () => {} });
                  else if (pin.length < 4) setPin(pin + key);
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
