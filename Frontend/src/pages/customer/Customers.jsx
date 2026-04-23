import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/Customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTierChange = async (id, newTier) => {
    if (newTier) {
      try {
        await apiClient.put(`/Customers/${id}/tier?newTier=${newTier}`);
        fetchCustomers();
      } catch (err) {
        alert("Lỗi phong tước");
      }
    }
  };

  const handlePointsChange = async (id, newPoints) => {
    if (newPoints >= 0) {
      try {
        await apiClient.put(`/Customers/${id}/points?newPoints=${newPoints}`);
        fetchCustomers();
      } catch (err) {
        alert("Lỗi cập nhật điểm");
      }
    }
  };

  const translatePersona = (p) => {
    const map = { 'Student': 'Học sinh/SV', 'Parent': 'Phụ huynh', 'Office': 'Văn phòng/DN' };
    return map[p] || p;
  };

  const renderDetails = (json) => {
    if (!json) return '-';
    try {
      const d = JSON.parse(json);
      return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
    } catch { return json; }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Thành Viên Thân Thiết</h2>
      </div>

      <table>
        <thead>
          <tr>
            <th>Phiếu ID</th>
            <th>Tên Thành Viên</th>
            <th>SĐT Thành Viên</th>
            <th>Chân Dung</th>
            <th>Chi Tiết Phân Khúc</th>
            <th>Tước Hiệu</th>
            <th>Điểm Phúc Lợi</th>
            <th>Thay Đổi Hạng</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.id.substring(0, 8)}</span></td>
              <td style={{ fontWeight: 600 }}>{c.fullName}</td>
              <td style={{ fontWeight: 600 }}>{c.phone}</td>
              <td>
                <span className="badge badge-silver" style={{ fontSize: '0.8rem' }}>
                  {translatePersona(c.persona)}
                </span>
              </td>
              <td style={{ fontSize: '0.85rem', color: '#5d4037' }}>{renderDetails(c.personaDetailJson)}</td>
              <td>
                <span className={`badge badge-${c.tier?.toLowerCase() === 'gold' ? 'gold' : (c.tier?.toLowerCase() === 'diamond' ? 'gold' : 'silver')}`}>
                  {c.tier}
                </span>
              </td>
              <td style={{ fontWeight: 'bold' }}>
                <input
                  type="number"
                  className="input-field"
                  style={{ width: '80px', padding: '0.3rem', marginBottom: 0, fontWeight: 'bold' }}
                  defaultValue={c.pointBalance}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (val !== c.pointBalance && val >= 0) handlePointsChange(c.id, val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    }
                  }}
                  min="0"
                />
              </td>
              <td>
                <select
                  className="input-field"
                  style={{ padding: '0.3rem', width: 'auto', marginBottom: 0 }}
                  value={c.tier || 'Member'}
                  onChange={(e) => handleTierChange(c.id, e.target.value)}
                >
                  <option value="Member">Khách Thường (Member)</option>
                  <option value="Silver">Bạc (Silver)</option>
                  <option value="Gold">Vàng (Gold)</option>
                  <option value="Diamond">Kim Cương (Diamond)</option>
                </select>
              </td>
            </tr>
          ))}
          {customers.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có ai đăng ký thành viên thật.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
