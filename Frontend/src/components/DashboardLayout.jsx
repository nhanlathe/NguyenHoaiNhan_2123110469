import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = () => {
    if (user && (user.role === 'Admin' || user.role === 'Staff')) {
      apiClient.get('/Support/unread-count-admin')
        .then(res => setUnreadCount(res.data.count))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    window.addEventListener('support-read', fetchUnreadCount);
    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      window.removeEventListener('support-read', fetchUnreadCount);
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          Antiquity <br/> <span style={{fontSize: '1.2rem', color: 'var(--text-main)'}}>Bookstore</span>
        </div>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#fcf9f2' }}>
          <div>Xin chào, <strong style={{color: 'var(--primary)'}}>{user.fullName || user.username}</strong></div>
          <div style={{marginTop: '0.5rem'}}><span className={`badge badge-${user.role?.toLowerCase()}`}>{user.role}</span></div>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              Trang Chủ Thống Kê
            </Link>
          </li>
          <li>
            <Link to="/dashboard/pos" className={`nav-link ${location.pathname === '/dashboard/pos' ? 'active' : ''}`}>
               Bán Hàng & Tích Điểm
            </Link>
          </li>
          <li>
            <Link to="/dashboard/sales-history" className={`nav-link ${location.pathname.includes('/sales-history') ? 'active' : ''}`}>
              Lịch Sử Bán Hàng
            </Link>
          </li>
          <li>
            <Link to="/dashboard/products" className={`nav-link ${location.pathname.includes('/products') ? 'active' : ''}`}>
              Tủ Sách (Sản Phẩm)
            </Link>
          </li>
          <li>
            <Link to="/dashboard/customers" className={`nav-link ${location.pathname.includes('/customers') ? 'active' : ''}`}>
              Thành Viên Thân Thiết
            </Link>
          </li>
          {user.role === 'Admin' && (
            <>
              <li>
                <Link to="/dashboard/staff" className={`nav-link ${location.pathname.includes('/staff') ? 'active' : ''}`}>
                  Quản Lý Nhân Viên
                </Link>
              </li>
              <li>
                <Link to="/dashboard/vouchers" className={`nav-link ${location.pathname.includes('/vouchers') ? 'active' : ''}`}>
                  Quản Lý Ưu Đãi
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/dashboard/support" className={`nav-link ${location.pathname.includes('/support') ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Hòm Thư Hỗ Trợ</span>
              {unreadCount > 0 && (
                <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          </li>
        </ul>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="glass-panel" style={{ minHeight: 'calc(100vh - 5rem)' }}>
           <Outlet />
        </div>
      </main>
    </div>
  );
}
