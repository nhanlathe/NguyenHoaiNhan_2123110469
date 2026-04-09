import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    try {
      if (isLogin) {
        const res = await apiClient.post('/Auth/login', { username, password });
        login(res.data);
        navigate('/dashboard');
      } else {
        await apiClient.post('/Auth/register', { 
          username, password, fullName: fullName || username, role: 'Admin'
        });
        setSuccess('Đăng ký thành viên bút tích thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.Error || 'Có lỗi xảy ra trong thư viện, xin thử lại.');
    }
  };

  return (
    <div className="auth-container" style={{
      backgroundImage: "url('/login-bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Overlay làm tối nền một chút để chữ dễ đọc */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(62, 39, 35, 0.4)', zIndex: 0 }}></div>

      <div className="glass-panel auth-box animate-fade-in" style={{ 
        backgroundColor: 'rgba(255, 251, 240, 0.85)', 
        backdropFilter: 'blur(10px)',
        zIndex: 1, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' 
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem' }}>
          {isLogin ? 'Antiquity Bookstore' : 'Gia Nhập Thư Viện'}
        </h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontStyle: 'italic', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontStyle: 'italic', textAlign: 'center' }}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Tên định danh (Username)</label>
            <input type="text" className="input-field" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          
          {!isLogin && (
            <div>
              <label>Danh xưng (Họ và Tên)</label>
              <input type="text" className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} required={!isLogin} />
            </div>
          )}

          <div>
            <label>Mật mã bảo vệ</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>
            {isLogin ? 'Tiến Vào' : 'Đăng Ký'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
          {isLogin ? (
            <p>Khách vãng lai? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsLogin(false)}>Đăng ký thẻ</span></p>
          ) : (
            <p>Đã có thẻ? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsLogin(true)}>Mở cửa vào</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
