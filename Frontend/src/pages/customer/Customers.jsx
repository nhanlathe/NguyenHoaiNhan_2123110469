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

  const seedCustomer = async () => {
    try {
      await apiClient.post('/Customers/seed-test-customer?phone=0987654321');
      fetchCustomers();
    } catch (err) {
      alert("Lỗi viết thư mời");
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Thành Viên Thân Thiết</h2>
        <button className="btn btn-primary" onClick={seedCustomer}>+ Viết Thẻ Bài Thử Nghiệm</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Phiếu ID</th>
            <th>Diễn Âm (SĐT)</th>
            <th>Tước Hiệu</th>
            <th>Điểm Phúc Lợi</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td><span style={{ fontFamily: 'monospace' }}>{c.id.substring(0,8)}...</span></td>
              <td>{c.phoneDecrypted || '***'}</td>
              <td>
                <span className={`badge badge-${c.tier?.toLowerCase() === 'gold' ? 'gold' : 'silver'}`}>
                  {c.tier}
                </span>
              </td>
              <td style={{ fontWeight: 'bold' }}>{c.pointBalance}</td>
              <td>
                <select 
                  className="input-field" 
                  style={{ padding: '0.3rem', width: 'auto' }}
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
          {customers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Chưa ai vãng lai đăng ký thẻ.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
