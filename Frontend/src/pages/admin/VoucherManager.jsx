import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAlert } from '../../context/AlertContext';
import apiClient from '../../api/apiClient';

export default function VoucherManager() {
  const { showConfirm } = useAlert();
  const [vouchers, setVouchers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: '', title: '', description: '', discountValue: 0, isPercentage: true, expiryDate: '', usageLimit: 100
  });
  const [issuingCode, setIssuingCode] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await apiClient.get('/Vouchers');
      setVouchers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/Vouchers', newVoucher);
      setShowCreate(false);
      fetchVouchers();
      alert('Tạo mã ưu đãi thành công!');
    } catch (err) {
      alert(err.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleIssueToAll = async (code) => {
    if (!(await showConfirm(`Phát hành mã ${code} cho TẤT CẢ thành viên?`))) return;
    try {
      await apiClient.post('/Vouchers/issue', { couponCode: code, targetAll: true });
      alert('Đã phát hành ưu đãi tới tất cả thành viên!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Quản Lý Thẻ Ưu Đãi</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Tạo Mã Mới</button>
      </div>

      <div className="grid-layout">
        {vouchers.map(v => (
          <div key={v.code} className="glass-panel" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{v.title}</div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>{v.description}</div>
            <div style={{ marginBottom: '1rem' }}>
               <span className="badge badge-primary">{v.code}</span>
               <span style={{ marginLeft: '1rem', fontWeight: 'bold' }}>
                 {v.isPercentage ? `Giảm ${v.discountValue}%` : `Giảm ${v.discountValue.toLocaleString()} ₫`}
               </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.5rem' }}>
              Hết hạn: {new Date(v.expiryDate).toLocaleDateString()} | Đã dùng: {v.usageCount}/{v.usageLimit}
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => handleIssueToAll(v.code)}>Phát Hành Cho Tất Cả</button>
          </div>
        ))}
      </div>

      {showCreate && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '550px', backgroundColor: 'var(--card-bg)', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--primary)', position: 'relative' }}>
            <button type="button" onClick={() => setShowCreate(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            <h2 style={{ color: 'var(--primary)', borderBottom: '2px dashed var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '2rem' }}>
              Tạo Mã Ưu Đãi Mới
            </h2>
            <form onSubmit={handleCreate} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Mã Ưu Đãi</label>
                <input 
                  className="input-field" placeholder="VD: CHAOHE2024" 
                  onChange={e => setNewVoucher({...newVoucher, code: e.target.value})} required 
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div className="form-group">
                <label>Tiêu Đề</label>
                <input 
                  className="input-field" placeholder="Tên hiển thị cho khách" 
                  onChange={e => setNewVoucher({...newVoucher, title: e.target.value})} required 
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <textarea 
                  className="input-field" placeholder="Nội dung chi tiết ưu đãi" 
                  onChange={e => setNewVoucher({...newVoucher, description: e.target.value})} required 
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Giá Trị</label>
                  <input 
                    type="number" className="input-field" placeholder="0" 
                    onChange={e => setNewVoucher({...newVoucher, discountValue: parseFloat(e.target.value)})} required 
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Loại</label>
                  <select className="input-field" onChange={e => setNewVoucher({...newVoucher, isPercentage: e.target.value === 'true'})} style={{ marginBottom: 0 }}>
                    <option value="true">% (Phần trăm)</option>
                    <option value="false">₫ (Số tiền)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Ngày Hết Hạn</label>
                <input 
                  type="date" className="input-field" 
                  onChange={e => setNewVoucher({...newVoucher, expiryDate: e.target.value})} required 
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Tạo Thẻ</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
