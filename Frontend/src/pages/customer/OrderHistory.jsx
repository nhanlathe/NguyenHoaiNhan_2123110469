import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiClient.get(`/Orders/my-orders/${user.id}`)
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Đang tìm lại lịch sử báu vật đã mua...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Lịch Sử Đơn Hàng</h2>
      
      {orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Bạn chưa thực hiện giao dịch nào.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>#{order.orderNumber}</span>
                  <span style={{ color: '#888', marginLeft: '1rem' }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-silver'}`}>
                     {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                   </span>
                   <span className="badge badge-primary">{order.status}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                 {order.items.map(item => (
                   <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>Sản phẩm ID: {item.productId.substring(0,8)} x {item.quantity}</span>
                      <span>{item.price.toLocaleString()} ₫</span>
                   </div>
                 ))}
              </div>
              
              <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>
                Tổng cộng: <span style={{ color: 'var(--danger)' }}>{order.totalAmount.toLocaleString()} ₫</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
