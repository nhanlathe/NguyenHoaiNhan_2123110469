import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function SupportInbox() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await apiClient.get('/Support');
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
      if (!thread.isReadByAdmin) {
        await apiClient.put(`/Support/${thread.id}/mark-read-admin`);
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, isReadByAdmin: true } : t));
        window.dispatchEvent(new Event('support-read'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return alert('Vui lòng nhập nội dung phản hồi.');
    try {
      await apiClient.post(`/Support/${selectedThread.id}/message`, { 
        senderType: 'Staff', 
        content: replyMessage 
      });
      
      // Refresh thread detail
      const res = await apiClient.get(`/Support/${selectedThread.id}`);
      setSelectedThread(res.data);
      setReplyMessage('');
      
      // Update thread list last message and update time
      setThreads(prev => prev.map(t => t.id === selectedThread.id ? { 
        ...t, 
        lastMessage: replyMessage, 
        lastUpdatedAt: new Date().toISOString() 
      } : t).sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt)));
      
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi tin nhắn.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: '80vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Hòm Thư Hỗ Trợ</h2>
        {loading ? <p>Đang tải hòm thư...</p> : threads.length === 0 ? <p>Không có yêu cầu hỗ trợ nào.</p> : (
          threads.map(t => (
            <div 
              key={t.id} 
              className="glass-panel" 
              style={{ 
                padding: '1rem', 
                cursor: 'pointer', 
                borderLeft: t.isReadByAdmin ? '4px solid transparent' : '4px solid var(--danger)',
                background: selectedThread?.id === t.id ? '#fdf8f5' : 'transparent',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onClick={() => handleSelectThread(t)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: t.isReadByAdmin ? 'normal' : 'bold', fontSize: '0.95rem' }}>{t.subject}</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(t.lastUpdatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.customerName}: {t.lastMessage}
              </div>
              {t.status === 'Closed' && <span style={{ fontSize: '0.7rem', background: '#eee', padding: '2px 6px', borderRadius: '4px', marginTop: '0.5rem', display: 'inline-block' }}>Đã đóng</span>}
            </div>
          ))
        )}
      </div>

      <div style={{ flex: 2 }} className="glass-panel">
        {selectedThread ? (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h3 style={{ margin: 0 }}>{selectedThread.subject}</h3>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.4rem' }}>
                    Người gửi: <strong>{selectedThread.customerName}</strong> • Bắt đầu: {new Date(selectedThread.createdAt).toLocaleString('vi-VN')}
                  </div>
               </div>
               <button className="btn btn-outline" style={{ borderColor: 'var(--text-main)', color: 'var(--text-main)' }} onClick={() => window.location.href = `tel:${selectedThread.customerName}`}>📞 Gọi khách</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', padding: '1rem', background: '#fcfaf6', borderRadius: '8px' }}>
              {selectedThread.messages.map(m => (
                <div key={m.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: m.senderType === 'Staff' ? 'flex-end' : 'flex-start',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    maxWidth: '80%', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    background: m.senderType === 'Staff' ? '#e1f5fe' : '#fff',
                    border: m.senderType === 'Staff' ? '1px solid #b3e5fc' : '1px solid #eee',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                      {m.senderType === 'Staff' ? 'Phản hồi từ bạn' : 'Khách hàng'}
                    </div>
                    <div style={{ lineHeight: '1.5' }}>{m.content}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '0.3rem' }}>{new Date(m.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <textarea 
                className="form-control" 
                rows="3" 
                style={{ width: '100%', resize: 'none', marginBottom: '1rem', padding: '1rem' }}
                placeholder="Nhập nội dung phản hồi tiếp theo..."
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSendReply}>Gửi Phản Hồi</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontStyle: 'italic' }}>
            Chọn một cuộc hội thoại để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
}
