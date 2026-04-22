import { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import apiClient from '../../api/apiClient';

export default function Staff() {
  const { showConfirm } = useAlert();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'Staff', fullName: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/Admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editId) {
        await apiClient.put(`/Admin/users/${editId}`, formData);
        setMsg('Cập nhật thông tin nhân sự thành công');
      } else {
        await apiClient.post('/Auth/register', formData);
        setMsg('Chiêu mộ nhân sự mới thành công');
      }
      setFormData({ username: '', password: '', role: 'Staff', fullName: '' });
      setEditId(null);
      fetchUsers();
    } catch (err) {
      setMsg(err.response?.data?.Error || 'Có lỗi xảy ra trong quá trình quản lý');
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      fullName: user.fullName
    });
  };

  const handleDelete = async (id) => {
    if (await showConfirm("Chắc chắn gỡ bỏ quyền truy cập của người này?")) {
      try {
        await apiClient.delete(`/Admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Không thể gỡ bỏ");
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
      <div>
        <h2>Quản Lý Nhân Sự</h2>
        <p style={{ color: 'var(--text-muted)' }}>{editId ? 'Cập nhật thẻ bài nhân viên' : 'Chiêu mộ người coi sóc thư viện'}</p>
        
        <div className="glass-panel" style={{ marginTop: '1rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            {editId ? 'Sửa Thẻ Bài' : 'Sổ Đăng Ký'}
          </h3>
          {msg && <div style={{ color: msg.includes('thành công') ? 'var(--success)' : 'var(--danger)', margin: '1rem 0', fontStyle: 'italic', fontSize: '0.9rem' }}>{msg}</div>}
          <form onSubmit={handleSubmit}>
            <label className="label-text">Tên hiệu (Username)</label>
            <input className="input-field" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required disabled={!!editId} />
            
            <label className="label-text">Mật mã {editId && '(Để trống nếu không đổi)'}</label>
            <input className="input-field" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editId} />
            
            <label className="label-text">Danh xưng (Họ Tên)</label>
            <input className="input-field" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label-text">Phân quyền cấp bậc</label>
              <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Admin">Quan Trưởng (Admin)</option>
                <option value="Staff">Phụ Việc (Staff)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Cập Nhật' : 'Lưu Thẻ Bài'}</button>
              {editId && <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setFormData({ username: '', password: '', role: 'Staff', fullName: '' }); }}>Hủy</button>}
            </div>
          </form>
        </div>
      </div>

      <div>
        <h2>Danh Sách Người Quản Thư</h2>
        <div className="glass-panel" style={{ marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Danh Xưng</th>
                <th>Cấp Bậc</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td>{u.fullName}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'Admin' ? 'gold' : 'silver'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', marginRight: '0.5rem' }} onClick={() => handleEdit(u)}>Sửa</button>
                    <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleDelete(u.id)}>Gỡ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
