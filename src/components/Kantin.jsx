import React, { useState, useMemo } from 'react';
import './Kantin.css';
import { translations } from '../lib/i18n/translations';

const Kantin = ({ products, setProducts }) => {
  const t = translations.tr.kantin; // Şimdilik varsayılan Türkçe
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const [editId, setEditId] = useState(null);
  const [editedProduct, setEditedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'alpha'

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    setProducts([{
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      createdAt: new Date().toISOString()
    }, ...products]); // Rule: New items on top
    
    setNewProduct({ name: '', price: '', stock: '' });
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setEditedProduct({ ...p });
  };

  const handleSaveEdit = () => {
    setProducts(products.map(p => p.id === editId ? editedProduct : p));
    setEditId(null);
    setEditedProduct(null);
  };

  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } else if (sortBy === 'newest') {
      // Rule: Newest at top
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        return dateB - dateA;
      });
    }

    return result;
  }, [products, searchTerm, sortBy]);

  return (
    <div className="kantin-container">
      <div className="grid">
        <div className="card kantin-form">
          <h3>📦 {t.add_product}</h3>
          <form onSubmit={handleAdd}>
            <div className="input-group">
              <label>{t.product_name}</label>
              <input 
                type="text" 
                value={newProduct.name} 
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Örn: Coca Cola"
              />
            </div>
            <div className="input-group">
              <label>{t.price}</label>
              <input 
                type="number" 
                value={newProduct.price} 
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="input-group">
              <label>{t.stock}</label>
              <input 
                type="number" 
                value={newProduct.stock} 
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                placeholder="Opsiyonel"
              />
            </div>
            <button className="main-btn start" type="submit">{t.save_product}</button>
          </form>
        </div>

        <div className="card kantin-list">
          <div className="list-header">
            <h3>📋 {t.product_list}</h3>
            <div className="list-controls">
              <input 
                type="text" 
                className="search-input" 
                placeholder={t.search} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">{t.sort_newest}</option>
                <option value="alpha">{t.sort_alpha}</option>
              </select>
            </div>
          </div>
          <table className="p-table">
            <thead>
              <tr>
                <th>{t.product_name}</th>
                <th>Fiyat</th>
                <th>{t.stock}</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {processedProducts.map(p => (
                <tr key={p.id}>
                  {editId === p.id ? (
                    <>
                      <td><input className="edit-input" type="text" value={editedProduct.name} onChange={e => setEditedProduct({...editedProduct, name: e.target.value})} /></td>
                      <td><input className="edit-input small" type="number" value={editedProduct.price} onChange={e => setEditedProduct({...editedProduct, price: parseFloat(e.target.value)})} /></td>
                      <td><input className="edit-input small" type="number" value={editedProduct.stock} onChange={e => setEditedProduct({...editedProduct, stock: parseInt(e.target.value)})} /></td>
                      <td>
                        <button className="save-btn" onClick={handleSaveEdit}>✅</button>
                        <button className="cancel-btn" onClick={() => setEditId(null)}>❌</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{p.name}</td>
                      <td>{p.price} TL</td>
                      <td>{p.stock}</td>
                      <td className="actions-cell">
                        <button className="edit-btn" onClick={() => startEdit(p)}>✏️</button>
                        <button className="del-btn" onClick={() => setProducts(products.filter(item => item.id !== p.id))}>🗑️</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="kantin-footer">
        <button className="main-btn save-all-btn" onClick={() => alert("Kantin ürünleri kaydedildi! 🍟")}>
           💾 {t.save_all}
        </button>
      </div>
    </div>
  );
};

export default Kantin;
