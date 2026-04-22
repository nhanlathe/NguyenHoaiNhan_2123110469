import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

export default function Cart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      apiClient.get(`/Vouchers/my-vouchers/${user.id}`).then(res => setVouchers(res.data)).catch(console.error);
    }
  }, [user]);

  const removeFromCart = (id) => {
    const newItems = cartItems.filter(item => item.id !== id);
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.basePrice * (item.quantity || 1)), 0);
  
  let discount = 0;
  if (selectedVoucher) {
    if (selectedVoucher.isPercentage) {
      discount = subtotal * (selectedVoucher.discountValue / 100);
    } else {
      discount = selectedVoucher.discountValue;
    }
  }
  
  const total = subtotal - discount;

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      const orderReq = {
        customerId: user.id,
        items: cartItems.map(i => ({ productId: i.id, quantity: 1, price: i.basePrice })),
        totalAmount: total,
        paymentMethod: paymentMethod,
        couponCode: selectedVoucher?.couponCode
      };

      const res = await apiClient.post('/Orders/create-order', orderReq);
      localStorage.removeItem('cart');

      if (res.data.requiresPayment) {
        setPendingOrderId(res.data.orderId);
        setShowQR(true);
      } else {
        navigate('/payment-success?orderId=' + res.data.orderId);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Giỏ Hàng Của Bạn</h2>
        <button className="btn btn-outline" onClick={() => navigate('/home')}>Tiếp tục mua sắm</button>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Giỏ hàng đang trống rỗng.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/home')}>Đi xem sách ngay</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          <div className="glass-panel">
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                 <div style={{ width: '60px', height: '60px', background: '#e2d5c3', borderRadius: '4px' }}>
                    {item.imageUrl && <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5245${item.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                 </div>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                   <div style={{ fontSize: '0.9rem', color: '#666' }}>{item.category}</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ fontWeight: 'bold', color: 'var(--danger)' }}>{item.basePrice?.toLocaleString()} ₫</div>
                   <button 
                    style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                    onClick={() => removeFromCart(item.id)}
                   >
                     Gỡ bỏ
                   </button>
                 </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Voucher Section */}
            <div className="glass-panel">
               <h4 style={{ marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>🎫 Mã giảm giá</h4>
               <div className="form-group">
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Chọn báu vật ưu đãi</label>
                 <select 
                  className="input-field" 
                  onChange={(e) => setSelectedVoucher(vouchers.find(v => v.couponCode === e.target.value))}
                  value={selectedVoucher?.couponCode || ''}
                  style={{ 
                    width: '100%', padding: '0.8rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)',
                    fontSize: '1rem', fontFamily: 'inherit', background: 'white', cursor: 'pointer', marginBottom: 0
                  }}
                 >
                   <option value="">-- Không sử dụng --</option>
                   {vouchers.map(v => (
                     <option key={v.id} value={v.couponCode}>
                       {v.title} ({v.isPercentage ? `-${v.discountValue}%` : `-${v.discountValue.toLocaleString()}₫`})
                     </option>
                   ))}
                 </select>
               </div>
            </div>

            {/* Payment Method Section */}
            <div className="glass-panel">
               <h4 style={{ marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>💳 Thanh toán</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontStyle: 'normal', 
                    padding: '1rem', borderRadius: '8px', border: '1px solid',
                    borderColor: paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border-color)',
                    background: paymentMethod === 'COD' ? '#efebe0' : 'white', transition: '0.3s' 
                  }}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Tiền mặt (COD)</span>
                       <span style={{ fontSize: '0.85rem', color: '#666' }}>Thanh toán khi nhận sách</span>
                    </div>
                  </label>
                  <label style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontStyle: 'normal', 
                    padding: '1rem', borderRadius: '8px', border: '1px solid',
                    borderColor: paymentMethod === 'VNPay' ? 'var(--primary)' : 'var(--border-color)',
                    background: paymentMethod === 'VNPay' ? '#efebe0' : 'white', transition: '0.3s' 
                  }}>
                    <input type="radio" name="payment" value="VNPay" checked={paymentMethod === 'VNPay'} onChange={() => setPaymentMethod('VNPay')} style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>VN Pay QR</span>
                       <span style={{ fontSize: '0.85rem', color: '#666' }}>Thanh toán qua ứng dụng ngân hàng</span>
                    </div>
                  </label>
               </div>
            </div>

            {/* Summary Section */}
            <div className="glass-panel" style={{ background: '#f9f5f0', border: '1px solid var(--primary)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                 <span>Tạm tính:</span>
                 <span style={{ fontWeight: 600 }}>{subtotal.toLocaleString()} ₫</span>
               </div>
               {discount > 0 && (
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--success)' }}>
                   <span>Giảm giá:</span>
                   <span style={{ fontWeight: 600 }}>-{discount.toLocaleString()} ₫</span>
                 </div>
               )}
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '2px solid var(--border-color)', fontWeight: 'bold', fontSize: '1.3rem' }}>
                 <span>Tổng cộng:</span>
                 <span style={{ color: 'var(--danger)' }}>{total.toLocaleString()} ₫</span>
               </div>
               <button 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem',
                  boxShadow: '0 4px 15px rgba(140, 94, 69, 0.4)'
                }}
                onClick={handleCheckout}
                disabled={loading}
               >
                 {loading ? 'Đang xử lý...' : 'Tiến Hành Đặt Hàng'}
               </button>
            </div>
          </div>
        </div>
      )}

      {showQR && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--primary)', position: 'relative', textAlign: 'center' }}>
            <button type="button" onClick={() => setShowQR(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Quét Mã VN Pay</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>Mở ứng dụng ngân hàng và quét mã để thanh toán <b>{total.toLocaleString()} ₫</b></p>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '2px dashed var(--border-color)', marginBottom: '1.5rem' }}>
              {/* Dummy VietQR using standard VietinBank 970415 */}
              <img src={`https://img.vietqr.io/image/970415-113366668888-compact2.png?amount=${total}&addInfo=Thanh%20toan%20don%20hang%20${pendingOrderId}&accountName=Nha%20Sach%20Antiquity`} alt="VN Pay QR" style={{ width: '100%', borderRadius: '8px' }} />
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
              onClick={() => {
                setShowQR(false);
                navigate('/payment-success?orderId=' + pendingOrderId);
              }}
            >
              Tôi Đã Thanh Toán Thành Công
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
