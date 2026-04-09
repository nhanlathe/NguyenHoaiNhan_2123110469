import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiClient.get('/Products').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--primary)', color: 'white', padding: '3rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}>
        <h1 style={{ color: '#fffbf0', fontSize: '2.5rem' }}>Khám Phá Tri Thức Qua Thời Gian</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Combo Văn Phòng Phẩm & Sách Cổ Điển Đặc Biệt.</p>
        <Link to="/products" className="btn" style={{ background: '#f4efe6', color: 'var(--text-main)', marginTop: '1.5rem', border: '1px solid var(--border-color)' }}>
          Khám Phá Ngay
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
         <h2 style={{ margin: 0 }}>Sản Phẩm Bán Chạy / Nổi Bật</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {products.slice(0, 8).map(p => (
          <div key={p.id} className="glass-panel" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', backgroundColor: '#e2d5c3', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
               [Ảnh Sản Phẩm]
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{p.name}</div>
            <div style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{p.category}</div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{p.basePrice.toLocaleString()} ₫</span>
              <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.9rem' }}>+ Giỏ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
