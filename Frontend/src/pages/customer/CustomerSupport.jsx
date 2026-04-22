import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { createPortal } from 'react-dom';

export default function CustomerSupport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user) {
      apiClient.get(`/Customers/my-profile/${user.id}`)
        .then(res => {
          setProfile(res.data);
          fetchThreads(res.data.id);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const fetchThreads = async (customerId) => {
    try {
      const res = await apiClient.get(`/Support/customer/${customerId}`);
      setThreads(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSelectThread = async (thread) => {
    try {
      const res = await apiClient.get(`/Support/${thread.id}`);
      setSelectedThread(res.data);
      setReplyMessage('');
      if (!thread.isReadByCustomer) {
        await apiClient.put(`/Support/${thread.id}/mark-read-customer`);
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, isReadByCustomer: true } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return alert('Vui lòng nhập nội dung phản hồi.');
    try {
      await apiClient.post(`/Support/${selectedThread.id}/message`, { 
        senderType: 'Customer', 
        content: replyMessage 
      });
      
      const res = await apiClient.get(`/Support/${selectedThread.id}`);
      setSelectedThread(res.data);
      setReplyMessage('');
      
      setThreads(prev => prev.map(t => t.id === selectedThread.id ? { 
        ...t, 
        lastMessage: replyMessage, 
        lastUpdatedAt: new Date().toISOString() 
      } : t).sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt)));
      
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi tin nhắn.');
    }
  };

  const handleCreateRequest = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return alert('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
    try {
      await apiClient.post('/Support', {
        customerId: profile.id,
        subject: newSubject,
        message: newMessage
      });
      alert('Yêu cầu hỗ trợ đã được gửi thành công!');
      setShowNewRequestModal(false);
      setNewSubject('');
      setNewMessage('');
      fetchThreads(profile.id);
    } catch (err) {
      alert('Gửi hỗ trợ thất bại.');
    }
  };

  if (!profile) return <div style={{ padding: '5rem', textAlign: 'center' }}>Đang tải...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      {/* Mini Hero */}
      <div style={{ background: 'var(--primary)', padding: '3rem 0', color: '#fff', marginBottom: '3rem', textAlign: 'center' }}>
         <h1 style={{ color: '#fff', margin: 0 }}>Hòm Thư Hỗ Trợ</h1>
         <p style={{ opacity: 0.8 }}>Chúng tôi luôn sẵn sàng lắng nghe bạn</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/profile')} className="btn btn-outline" style={{ borderColor: 'transparent', padding: '0.5rem 0' }}>
            ← Quay lại hồ sơ
          </button>
          <button className="btn btn-primary" onClick={() => setShowNewRequestModal(true)}>+ Gửi Yêu Cầu Mới</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: '600px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            {loading ? <p>Đang tải hòm thư...</p> : threads.length === 0 ? <p>Bạn chưa có yêu cầu hỗ trợ nào.</p> : (
              threads.map(t => (
                <div 
                  key={t.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '1.2rem', 
                    cursor: 'pointer', 
                    borderLeft: t.isReadByCustomer ? '4px solid transparent' : '4px solid var(--danger)',
                    background: selectedThread?.id === t.id ? '#fdf8f5' : '#fff',
                    transition: 'all 0.2s ease',
                    boxShadow: t.isReadByCustomer ? 'none' : '0 4px 12px rgba(220, 53, 69, 0.1)'
                  }}
                  onClick={() => handleSelectThread(t)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: t.isReadByCustomer ? 'normal' : 'bold', fontSize: '1rem' }}>{t.subject}</span>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(t.lastUpdatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.lastMessage}
                  </div>
                  {!t.isReadByCustomer && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>● Có phản hồi mới</div>}
                </div>
              ))
            )}
          </div>

          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            {selectedThread ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: '#fff' }}>
                  <h3 style={{ margin: 0 }}>{selectedThread.subject}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>
                    Mã: {selectedThread.id.substring(0,8).toUpperCase()} • Ngày: {new Date(selectedThread.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#fcfaf6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedThread.messages.map(m => (
                    <div key={m.id} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: m.senderType === 'Customer' ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{ 
                        maxWidth: '85%', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        background: m.senderType === 'Customer' ? 'var(--primary)' : '#fff',
                        color: m.senderType === 'Customer' ? '#fff' : 'inherit',
                        border: m.senderType === 'Customer' ? 'none' : '1px solid #ddd',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: m.senderType === 'Customer' ? 'rgba(255,255,255,0.8)' : '#888', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                          {m.senderType === 'Customer' ? 'Bạn' : 'Quản thư'}
                        </div>
                        <div style={{ lineHeight: '1.5' }}>{m.content}</div>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '0.3rem' }}>{new Date(m.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    style={{ width: '100%', resize: 'none', marginBottom: '1rem', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    placeholder="Viết phản hồi của bạn..."
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={handleSendReply}>Gửi Phản Hồi</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontStyle: 'italic', background: '#fff' }}>
                Chọn một yêu cầu để xem nội dung trao đổi
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewRequestModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', background: '#fff' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>📩 Gửi Yêu Cầu Hỗ Trợ Mới</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tiêu đề vấn đề</label>
              <input 
                className="input-field" 
                style={{ marginBottom: 0 }}
                placeholder="Ví dụ: Lỗi tích điểm, Đổi quà..."
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nội dung chi tiết</label>
              <textarea 
                className="input-field" 
                rows="5" 
                style={{ height: 'auto', marginBottom: 0 }}
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowNewRequestModal(false)}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCreateRequest}>Gửi Yêu Cầu</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
