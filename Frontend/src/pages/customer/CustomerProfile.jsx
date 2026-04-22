import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showConfirm } = useAlert();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);

  const fetchProfile = () => {
    if (user) {
      apiClient.get(`/Customers/my-profile/${user.id}`)
        .then(res => {
          setProfile(res.data);
          setLoading(false);
          // Fetch unread support count
          apiClient.get(`/Support/customer/${res.data.id}/unread-count`)
            .then(resSup => setUnreadSupportCount(resSup.data.count))
            .catch(e => console.error(e));
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleRedeemGift = async (giftName, pointsCost) => {
    if (profile.pointBalance < pointsCost) {
      alert("Không đủ điểm phúc lợi để đổi món quà này!");
      return;
    }
    if (await showConfirm(`Bạn muốn đổi ${pointsCost} điểm lấy ${giftName} chứ?`)) {
      try {
        await apiClient.post('/Loyalty/redeem-points', {
          customerId: profile.id,
          pointsToUse: pointsCost,
          giftName: giftName
        });
        alert(`Chúc mừng! Bạn đã đổi thành công ${giftName}. Quản thư sẽ liên hệ hoặc gửi quà vào tủ đồ của bạn.`);
        fetchProfile();
        setShowGiftModal(false);
      } catch (err) {
        alert(err.response?.data?.Error || "Có lỗi khi đổi quà");
      }
    }
  };

  // Support functionality moved to /support page

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center', fontSize: '1.2rem', fontStyle: 'italic' }}>Đang mở sổ danh bạ thành viên...</div>;

  if (!profile) return (
    <div style={{ padding: '5rem', textAlign: 'center' }}>
      <h2>Ố ô! Chưa tìm thấy hồ sơ.</h2>
      <p>Có vẻ như tài khoản này chưa được liên kết với hệ thống Loyalty.</p>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>Thử lại</button>
    </div>
  );

  const getTierIcon = (tier) => {
    if (tier === 'Gold') return '🏆';
    if (tier === 'Diamond') return '💎';
    if (tier === 'Silver') return '🥈';
    return '📜';
  };

  const getTierBenefit = (tier) => {
    if (tier === 'Gold') return 'Giảm 10% mọi đơn hàng + Quà tặng sinh nhật đặc biệt.';
    if (tier === 'Diamond') return 'Giảm 15% + Miễn phí vận chuyển toàn quốc + Ưu đãi đối tác.';
    if (tier === 'Silver') return 'Giảm 5% cho sách + Tích điểm nhân đôi vào cuối tuần.';
    return 'Tích điểm đổi quà + Ưu đãi thành viên mới.';
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      {/* Profile Header/Banner */}
      <div style={{ 
        height: '200px', background: 'linear-gradient(135deg, #8d6e63 0%, #5d4037 100%)', 
        position: 'relative', marginBottom: '4rem'
      }}>
        <div style={{ 
          position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)',
          width: '120px', height: '120px', borderRadius: '50%', border: '5px solid white',
          background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          {user.fullName?.[0]?.toUpperCase()}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
        <button onClick={() => navigate('/home')} className="btn btn-outline" style={{ borderColor: 'transparent', padding: '0.5rem 0', marginBottom: '1rem' }}>
          ← Quay lại trang chủ
        </button>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>{user.fullName}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
             <span>ID: {profile.id.substring(0,8)}</span>
             <span>•</span>
             <span>Gia nhập: {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          {/* Left Column: Loyalty & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getTierIcon(profile.tier)}</span>
                  Hạng Thẻ: {profile.tier}
                </h3>
                <div style={{ background: '#f9f5f0', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginBottom: '1.5rem' }}>
                   <strong>Quyền lợi của bạn:</strong> {getTierBenefit(profile.tier)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>Điểm Phúc Lợi Hiện Có</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{profile.pointBalance}</div>
                   </div>
                   <button className="btn btn-outline" onClick={() => setShowGiftModal(true)}>Đổi Quà Tặng</button>
                </div>
             </div>

             <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Thông Tin Cá Nhân</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div>
                      <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Số Điện Thoại</label>
                      <div style={{ fontWeight: 600 }}>{profile.phone}</div>
                   </div>
                   <div>
                      <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Phân Khúc</label>
                      <div style={{ fontWeight: 600 }}>{profile.persona === 'Student' ? 'Học sinh/Sinh viên' : profile.persona === 'Parent' ? 'Phụ huynh' : 'Nhân viên văn phòng'}</div>
                   </div>
                   {profile.personaDetailJson && JSON.parse(profile.personaDetailJson) && Object.entries(JSON.parse(profile.personaDetailJson)).map(([k,v]) => (
                     <div key={k}>
                        <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>
                          {k === 'Grade' ? 'Lớp / Chuyên ngành' : k === 'KidAge' ? 'Độ tuổi của con' : k}
                        </label>
                        <div style={{ fontWeight: 600 }}>{v}</div>
                     </div>
                   ))}
                </div>
              </div>
           </div>

          {/* Right Column: Actions & History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.2rem' }}>Lối Tắt Nhanh</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <button className="btn btn-outline" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => navigate('/order-history')}>📖 Lịch Sử Đơn Hàng</button>
                   <button className="btn btn-outline" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => navigate('/my-vouchers')}>🎁 Ưu Đãi Của Tôi</button>
                   <button className="btn btn-outline" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left', position: 'relative' }} onClick={() => navigate('/support')}>
                     📩 Hòm Thư Hỗ Trợ
                     {unreadSupportCount > 0 && (
                       <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                         {unreadSupportCount}
                       </span>
                     )}
                   </button>
                   <button className="btn btn-outline" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => navigate('/account-settings')}>⚙️ Cài Đặt Tài Khoản</button>
                   <button className="btn btn-danger" style={{ marginTop: '1rem' }} onClick={logout}>Đăng Xuất</button>
                </div>
             </div>

             <div className="glass-panel" style={{ padding: '1.5rem', background: '#fffbf0', border: '1px solid #e2d5c3' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Bạn cần hỗ trợ?</h4>
                <p style={{ fontSize: '0.9rem', color: '#5d4037', marginBottom: '1rem' }}>Xem lại các yêu cầu cũ hoặc gửi thắc mắc mới cho quản thư.</p>
                <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--primary)' }} onClick={() => navigate('/support')}>Mở Hòm Thư Hỗ Trợ</button>
             </div>
          </div>
         </div>
      </div>

      {showGiftModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--primary)', position: 'relative' }}>
            <button type="button" onClick={() => setShowGiftModal(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem', textAlign: 'center' }}>🎁 Cửa Hàng Quà Tặng</h3>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>Điểm hiện có của bạn: <strong>{profile.pointBalance}</strong></p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Sổ tay Antiquity', points: 300, icon: '📔' },
                { name: 'Bút máy cao cấp', points: 500, icon: '🖋️' },
                { name: 'Túi Tote Canvas', points: 1000, icon: '🛍️' },
                { name: 'Voucher Giảm 50K', points: 1500, icon: '🎫' },
              ].map(gift => (
                <div key={gift.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>{gift.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{gift.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{gift.points} điểm</div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleRedeemGift(gift.name, gift.points)}
                    disabled={profile.pointBalance < gift.points}
                    style={{ opacity: profile.pointBalance < gift.points ? 0.5 : 1 }}
                  >
                    Đổi Ngay
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
