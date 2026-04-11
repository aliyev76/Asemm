import React, { useState } from 'react';
import './Kantin.css';

const Kantin = ({ products, setProducts }) => {
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    setProducts([...products, {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0
    }]);
    
    setNewProduct({ name: '', price: '', stock: '' });
  };

  return (
    <div className="kantin-container">
      <div className="grid">
        <div className="card kantin-form">
          <h3>📦 Yeni Ürün Ekle</h3>
          <form onSubmit={handleAdd}>
            <div className="input-group">
              <label>Ürün Adı</label>
              <input 
                type="text" 
                value={newProduct.name} 
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Örn: Coca Cola"
              />
            </div>
            <div className="input-group">
              <label>Fiyat (TL)</label>
              <input 
                type="number" 
                value={newProduct.price} 
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="input-group">
              <label>Stok</label>
              <input 
                type="number" 
                value={newProduct.stock} 
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                placeholder="Opsiyonel"
              />
            </div>
            <button className="main-btn start" type="submit">Ürünü Kaydet</button>
          </form>
        </div>

        <div className="card kantin-list">
          <h3>📋 Ürün Listesi</h3>
          <table className="p-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.price} TL</td>
                  <td>{p.stock}</td>
                  <td>
                    <button className="del-btn" onClick={() => setProducts(products.filter(item => item.id !== p.id))}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Kantin;
