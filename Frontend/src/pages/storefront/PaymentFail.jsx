import { useNavigate } from 'react-router-dom';

export default function PaymentFail() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>❌</div>
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Thanh Toán Thất Bại</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Giao dịch đã bị hủy hoặc có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
          <button className="btn btn-outline" onClick={() => navigate('/home')}>Trang chủ</button>
        </div>
      </div>
    </div>
  );
}
