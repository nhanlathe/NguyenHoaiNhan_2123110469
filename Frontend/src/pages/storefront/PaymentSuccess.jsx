import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
        <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Thanh Toán Thành Công!</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Cảm ơn bạn đã tin tưởng Bút Tích Antiquity. Đơn hàng <strong>#{orderId?.substring(0,8)}</strong> của bạn đang được xử lý.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/order-history')}>Xem đơn hàng</button>
          <button className="btn btn-outline" onClick={() => navigate('/home')}>Tiếp tục mua sắm</button>
        </div>
      </div>
    </div>
  );
}
