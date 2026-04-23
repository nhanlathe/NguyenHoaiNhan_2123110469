import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await apiClient.put('/Auth/profile', {
        userId: user.id,
        fullName,
        phone
      });
      updateUser({ fullName: res.data.fullName, phoneNumber: res.data.phoneNumber });
      setMessage('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error(err);
      setMessage('Có lỗi xảy ra khi cập nhật.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <button onClick={() => navigate('/profile')} className="btn btn-outline" style={{ borderColor: 'transparent', padding: '0.5rem 0', marginBottom: '1rem' }}>
          ← Quay lại hồ sơ
        </button>
        <h2 style={{ marginBottom: '2rem' }}>Cài Đặt Tài Khoản</h2>
        
        {message && (
          <div style={{ 
            padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px',
            background: message.includes('thành công') ? '#e8f5e9' : '#ffebee',
            color: message.includes('thành công') ? '#2e7d32' : '#c62828',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Họ và Tên</label>
            <input 
              type="text" 
              className="input-field" 
              style={{ 
                width: '100%', padding: '0.8rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)',
                fontSize: '1.05rem', fontFamily: 'inherit', background: 'white'
              }}
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Số Điện Thoại</label>
            <input 
              type="tel" 
              className="input-field" 
              style={{ 
                width: '100%', padding: '0.8rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)',
                fontSize: '1.05rem', fontFamily: 'inherit', background: 'white'
              }}
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', padding: '1rem', fontSize: '1.1rem', 
              boxShadow: '0 4px 10px rgba(140, 94, 69, 0.3)' 
            }}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
