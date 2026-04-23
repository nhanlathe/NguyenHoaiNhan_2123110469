import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

export default function MyVouchers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiClient.get(`/Vouchers/my-vouchers/${user.id}`)
        .then(res => {
          setVouchers(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Đang tìm kiếm kho báu ưu đãi...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate('/profile')} className="btn btn-outline" style={{ borderColor: 'transparent', padding: '0.5rem 0', marginBottom: '1rem' }}>
        ← Quay lại hồ sơ
      </button>
      <h2 style={{ marginBottom: '2rem' }}>Ưu Đãi Của Tôi</h2>
      
      {vouchers.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Hiện chưa có thẻ ưu đãi nào dành cho bạn. Hãy tích cực mua sắm nhé!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {vouchers.map(v => (
            <div key={v.id} className="glass-panel" style={{ 
              padding: '1.5rem', borderLeft: '8px solid var(--primary)', 
              position: 'relative', overflow: 'hidden', background: 'white' 
            }}>
              <div style={{ 
                position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', 
                background: '#f4efe6', borderRadius: '50%', zIndex: 0 
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary)' }}>{v.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>{v.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {v.isPercentage ? `Giảm ${v.discountValue}%` : `Giảm ${v.discountValue.toLocaleString()} ₫`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
                      HSD: {new Date(v.expiryDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div style={{ 
                    padding: '0.4rem 0.8rem', background: '#f4efe6', borderRadius: '4px', 
                    fontSize: '0.9rem', fontWeight: 'bold', border: '1px dashed #8d6e63' 
                  }}>
                    {v.couponCode}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
