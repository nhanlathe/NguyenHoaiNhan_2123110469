import { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import apiClient from '../../api/apiClient';
import BookCover from '../../components/BookCover';

export default function POS() {
  const { showConfirm } = useAlert();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [redeemDiscount, setRedeemDiscount] = useState(0);

  useEffect(() => {
    apiClient.get('/Products').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      if (existing) {
        return prev.map(item => item.productId === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        productId: p.id, 
        name: p.name, 
        price: p.basePrice, 
        quantity: 1, 
        isVirtual: p.isVirtual,
        category: p.category,
        department: p.department
      }];
    });
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Chưa chọn sách nào!");
    try {
      const res = await apiClient.post('/Orders/checkout', {
        phoneRaw: phone,
        totalAmount,
        redeemPoints,
        items: cart.map(c => ({
          productId: c.productId,
          quantity: c.quantity,
          price: c.price,
          category: c.category,
          isVirtual: c.isVirtual
        }))
      });
      setMessage(`Giao dịch thành công! ${res.data.DiscountApplied > 0 ? `Đã áp dụng ưu đãi hạng thẻ: -${res.data.DiscountApplied.toLocaleString()} ₫.` : ''} ${redeemDiscount > 0 ? `Đổi điểm: -${redeemDiscount.toLocaleString()} ₫.` : ''}`);
      setCart([]);
      setPhone('');
      setRedeemPoints(0);
      setRedeemDiscount(0);
    } catch (err) {
      setMessage(err.response?.data?.Error || 'Có lỗi khi tính toán ngân lượng');
    }
  };

  const handleRedeem = async () => {
    if (!phone) return alert("Nhập số điện thoại khách!");
    if (totalAmount === 0) return alert("Cần có sản phẩm trong giỏ để kiểm tra đổi điểm!");
    
    try {
      const dash = await apiClient.get(`/Loyalty/dashboard?phoneRaw=${phone}`);
      if(dash.data) {
        const points = dash.data.pointBalance;
        if (points <= 0) {
            setMessage(`Khách hạng ${dash.data.currentTier}. Chưa có điểm phúc lợi.`);
            return;
        }

        const pointToVnd = 100; // 1 điểm = 100 VNĐ
        const maxDiscount = totalAmount * 0.2; // Tối đa 20% đơn hàng
        const maxPointsCanUse = Math.min(points, Math.floor(maxDiscount / pointToVnd));
        
        if (maxPointsCanUse <= 0) {
            setMessage(`Khách có ${points} điểm, nhưng không đủ để giảm giá cho đơn này.`);
            return;
        }

        const discountAmount = maxPointsCanUse * pointToVnd;
        const wantsRedeem = await showConfirm(`Khách đang có ${points} Điểm. Dùng ${maxPointsCanUse} điểm để giảm ${discountAmount.toLocaleString()} ₫ (tối đa 20%) cho đơn này không?`);
        
        if (wantsRedeem) {
            setRedeemPoints(maxPointsCanUse);
            setRedeemDiscount(discountAmount);
            setMessage(`Đã chọn dùng ${maxPointsCanUse} điểm. Sẽ giảm ${discountAmount.toLocaleString()} ₫ khi thanh toán.`);
        } else {
            setMessage(`Khách hạng ${dash.data.currentTier}. Đã giữ lại ${points} điểm.`);
        }
      }
    } catch (err) {
      setMessage("Không tìm thấy số thẻ này trong hệ thống.");
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem' }}>
      <div style={{ flex: 2 }}>
        <h2>Kệ Trưng Bày (Bán Hàng)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {products.map(p => {
            let author = '';
            try {
              const meta = typeof p.metadataJson === 'string' ? JSON.parse(p.metadataJson) : (p.metadataJson || {});
              author = meta['Tác giả'] || meta['Tác Giả'] || meta['Author'] || '';
            } catch (e) {}
            return (
            <div key={p.id} className="glass-panel" style={{ cursor: 'pointer', transition: '0.2s', position: 'relative', overflow: 'hidden', display: 'flex', gap: '0.75rem', alignItems: 'center' }} onClick={() => addToCart(p)}>
              <BookCover name={p.name} category={p.category} author={author} size={50} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                  {p.isVirtual && <span className="badge badge-silver" style={{ fontSize: '0.6rem' }}>Combo</span>}
                </div>
                <div style={{ fontStyle: 'italic', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#666' }}>{p.sku} | {p.uoM}</div>
                <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{p.basePrice.toLocaleString()} ₫</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>{p.department} - {p.category}</div>
              </div>
            </div>
            );
          })}
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

          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {cart.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <div>{c.quantity}x {c.name.substring(0, 15)}...</div>
                <div>{(c.price * c.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Tổng Giá</span>
            <span>{totalAmount.toLocaleString()} ₫</span>
          </div>

          {redeemDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 'bold', marginBottom: '1rem' }}>
              <span>Dùng {redeemPoints} điểm:</span>
              <span>-{redeemDiscount.toLocaleString()} ₫</span>
            </div>
          )}

          {message && <div style={{ color: message.includes('lỗi') || message.includes('Không tìm thấy') ? 'var(--danger)' : 'var(--success)', marginBottom: '1rem', fontStyle: 'italic', fontWeight: 'bold' }}>{message}</div>}

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
