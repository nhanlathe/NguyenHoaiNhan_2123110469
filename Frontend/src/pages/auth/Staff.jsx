import { useState } from 'react';
import apiClient from '../../api/apiClient';

export default function Staff() {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'Staff', fullName: '' });
  const [msg, setMsg] = useState('');

  const registerStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/Auth/register', formData);
      setMsg(res.data.Message || 'Lập danh sách người phụ việc thành công');
      setFormData({ username: '', password: '', role: 'Staff', fullName: '' });
    } catch (err) {
      setMsg(err.response?.data?.Error || 'Có lỗi khi chiêu mộ người làm');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2>Tuyển Người Quản Thư (Nhân Viên)</h2>
      <p style={{ color: 'var(--text-muted)' }}>Chỉ định người coi sóc thư viện.</p>
      
      <div className="glass-panel" style={{ marginTop: '2rem', maxWidth: '500px' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Sổ Đăng Ký</h3>
        {msg && <div style={{ color: msg.includes('thành công') ? 'var(--success)' : 'var(--danger)', margin: '1rem 0', fontStyle: 'italic' }}>{msg}</div>}
        <form onSubmit={registerStaff}>
          <input className="input-field" placeholder="Tên hiệu / Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input className="input-field" type="password" placeholder="Mật mã thẻ bài" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          <input className="input-field" placeholder="Danh xưng" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Phân quyền cấp bậc</label>
            <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Admin">Quan Trưởng (Admin)</option>
              <option value="Staff">Phụ Việc (Staff)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Lưu Thẻ Bài</button>
        </form>
      </div>
    </div>
  );
}
