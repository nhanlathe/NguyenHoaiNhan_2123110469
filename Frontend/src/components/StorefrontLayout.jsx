import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StorefrontLayout() {
  const { user } = useAuth();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontFamily: 'Playfair Display', fontSize: '1.8rem', fontWeight: 'bold', fontStyle: 'italic' }}>
            Cửa hàng Cổ Điển
          </Link>

          <div style={{ flex: 1, margin: '0 2rem', display: 'flex' }}>
            <input type="text" placeholder="Tìm kiếm sản phẩm..." style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '4px 0 0 4px', border: '1px solid var(--border-color)' }} />
            <button className="btn btn-primary" style={{ borderRadius: '0 4px 4px 0' }}>Tìm kiếm</button>
          </div>

          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/products" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>Tủ Sách</Link>
            <Link to="/cart" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600 }}>🛒 Giỏ Hàng</Link>
            {user ? (
               <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>Cá Nhân</Link>
            ) : (
               <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>Đăng Nhập</Link>
            )}
          </nav>
        </div>
      </header>
      
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem' }}>
        <Outlet />
      </main>

      <footer style={{ background: '#3e2723', color: '#f4efe6', padding: '3rem 2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#f4efe6', marginBottom: '1rem' }}>Antiquity Bookstore & Stationery</h3>
        <p>Bút Tích Cổ Điển - Tinh Hoa Tri Thức</p>
      </footer>
    </div>
  );
}
