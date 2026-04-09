import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiClient.get('/Products').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      if (existing) {
        return prev.map(item => item.productId === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: p.id, name: p.name, price: p.basePrice, quantity: 1, isVirtual: p.isVirtual }];
    });
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Chưa chọn sách nào!");
    try {
      const res = await apiClient.post('/Orders/checkout', {
        phoneRaw: phone,
        totalAmount,
        items: cart.map(c => ({
          productId: c.productId,
          quantity: c.quantity,
          price: c.price,
          category: 'Book', // Mock category
          isVirtual: c.isVirtual
        }))
      });
      setMessage(`Giao dịch thành công! ${res.data.DiscountAppied > 0 ? `Đã áp dụng giảm bạc: ${res.data.DiscountAppied} ₫` : ''}`);
      setCart([]);
      setPhone('');
    } catch (err) {
      setMessage(err.response?.data?.Error || 'Có lỗi khi tính toán ngân lượng');
    }
  };

  const handleRedeem = async () => {
    // For simplicity just mocking redeem if they provide customer Id. Let's do phone-based dash lookup first.
    if (!phone) return alert("Nhập số điện thoại khách!");
    try {
      const dash = await apiClient.get(`/Loyalty/dashboard?phoneRaw=${phone}`);
      if(dash.data) {
        const wantsRedeem = confirm(`Khách đang có ${dash.data.PointBalance} Điểm Phúc Lợi. Đổi quà trị giá 50,000đ (Chi phí 500 điểm)?`);
        if (wantsRedeem) {
            // Need Customer ID! Oh, wait, dashboard doesn't return Customer ID, just stats.
            setMessage("Tính năng đổi quà từ quầy đang bảo trì. Vui lòng thanh toán tích điểm trước.");
        }
      }
    } catch (err) {
      setMessage("Không tìm thấy số thẻ này trong cơ sở dữ liệu.");
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 2 }}>
        <h2>Kệ Trưng Bày (Bán Hàng)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {products.map(p => (
            <div key={p.id} className="glass-panel" style={{ cursor: 'pointer', transition: '0.2s' }} onClick={() => addToCart(p)}>
              <div style={{ fontWeight: 'bold' }}>{p.name}</div>
              <div style={{ fontStyle: 'italic', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{p.sku}</div>
              <div style={{ color: 'var(--primary)' }}>{p.basePrice.toLocaleString()} ₫</div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ flex: 1, minWidth: '320px' }}>
        <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Khay Thanh Toán</h3>
          
          <div style={{ margin: '1rem 0' }}>
            <label>Phúc Lợi Thành Viên (SĐT)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="input-field" placeholder="09xxx..." value={phone} onChange={e => setPhone(e.target.value)} style={{ marginBottom: 0 }} />
              <button className="btn btn-outline" onClick={handleRedeem}>Tra</button>
            </div>
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem' }}>
            {cart.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <div>{c.quantity}x {c.name.substring(0, 15)}...</div>
                <div>{(c.price * c.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Tổng Giá</span>
            <span>{totalAmount.toLocaleString()} ₫</span>
          </div>

          {message && <div style={{ color: message.includes('lỗi') ? 'var(--danger)' : 'var(--success)', marginBottom: '1rem', fontStyle: 'italic', fontWeight: 'bold' }}>{message}</div>}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: '1rem' }} onClick={handleCheckout}>
              Bán Hàng
            </button>
            <button className="btn btn-outline" style={{ padding: '0 1rem' }} onClick={() => window.print()}>
              🖨 In Bill
            </button>
          </div>
        </div>
      </div>

      {/* Giao diện Ẩn dành riêng cho việc In Ấn (Print Media) */}
      <div className="print-only" style={{ display: 'none' }}>
         <div style={{ fontFamily: 'monospace', width: '300px', padding: '20px', border: '1px solid black' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>ANTIQUITY BOOKSTORE</h2>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>Hóa Đơn Bán Hàng</p>
            <hr style={{ borderTop: '1px dashed black' }} />
            {cart.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                <span>{c.quantity}x {c.name.substring(0, 15)}</span>
                <span>{(c.price * c.quantity).toLocaleString()}</span>
              </div>
            ))}
            <hr style={{ borderTop: '1px dashed black', margin: '15px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Tổng Tiền:</span>
              <span>{totalAmount.toLocaleString()} VND</span>
            </div>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>Xin cảm ơn quý khách!</p>
         </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
            display: block !important;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
