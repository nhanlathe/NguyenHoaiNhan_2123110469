import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/Admin/reports/loyalty-efficiency');
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats");
    }
  };

  return (
    <div className="animate-fade-in">
      <h2>Thống Kê Thư Viện (Dashboard)</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Theo dõi các ấn phẩm và thành viên thưởng lãm của nhà sách.</p>
      
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Tổng điểm đã cấp</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'Playfair Display' }}>
              {stats.totalPointsDistributed}
            </div>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Tem / Quà đã đổi</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-hover)', fontFamily: 'Playfair Display' }}>
              {stats.totalStampsRedeemed}
            </div>
          </div>
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center' }}>Phân Bố Hạng Thẻ</h3>
            <ul style={{ listStyle: 'none' }}>
              {stats.membersByTier?.map(t => (
                <li key={t.tier ?? 'Unknown'} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <span>{t.tier ?? 'Vô danh'}</span>
                  <span className="badge badge-gold" style={{ fontSize: '1rem' }}>{t.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>Đang mài mực đọc sổ sách...</p>
      )}
    </div>
  );
}
