import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function SalesHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    apiClient.get('/Orders')
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleApprove = async (orderId) => {
    try {
      await apiClient.put(`/Orders/${orderId}/approve`);
      alert("Duyệt đơn hàng thành công! Thành viên đã được cộng điểm.");
      fetchHistory();
      setSelectedOrder(null);
    } catch (err) {
      alert(err.response?.data?.Error || err.response?.data || "Có lỗi xảy ra khi duyệt đơn");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Group orders by date
  const groupedByDate = history.reduce((groups, order) => {
    const date = formatDate(order.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(order);
    return groups;
  }, {});

  const totalRevenue = history.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>📜 Lịch Sử Bán Hàng</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Theo dõi tất cả giao dịch bán hàng tại quầy.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          🔄 Làm mới
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tổng đơn hàng</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'Playfair Display' }}>
            {history.length}
          </div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tổng doanh thu</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'Playfair Display' }}>
            {totalRevenue.toLocaleString()} ₫
          </div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Trung bình / đơn</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'Playfair Display' }}>
            {history.length > 0 ? Math.round(totalRevenue / history.length).toLocaleString() : 0} ₫
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ fontStyle: 'italic', color: '#888' }}>Đang tải dữ liệu...</p>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Chưa có giao dịch nào được ghi nhận.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {/* Orders List */}
          <div style={{ flex: 2 }}>
            {Object.entries(groupedByDate).map(([date, orders]) => (
              <div key={date} style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                  padding: '0.5rem 0',
                  borderBottom: '2px solid var(--primary)',
                  display: 'inline-block'
                }}>
                  📅 {date}
                </div>
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="glass-panel"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    style={{
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      padding: '1rem 1.25rem',
                      transition: 'all 0.2s ease',
                      border: selectedOrder?.id === order.id ? '2px solid var(--primary)' : '2px solid transparent',
                      transform: selectedOrder?.id === order.id ? 'scale(1.01)' : 'scale(1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          #{order.orderNumber?.split('-').pop().substring(0, 6)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.15rem' }}>
                          🕐 {formatTime(order.createdAt)} • {order.items?.length || 0} sản phẩm
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                          {order.totalAmount.toLocaleString()} ₫
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          backgroundColor: order.status === 'Completed' ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
                          color: order.status === 'Completed' ? '#2e7d32' : '#e65100',
                          display: 'inline-block',
                          marginTop: '0.25rem'
                        }}>
                          {order.status === 'Completed' ? 'Hoàn thành' : order.status || 'Đã xử lý'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Order Detail Panel */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="glass-panel" style={{ position: 'sticky', top: '2rem', padding: '1.5rem' }}>
              {selectedOrder ? (
                <>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    Chi Tiết Đơn #{selectedOrder.orderNumber?.split('-').pop().substring(0, 6)}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
                    🕐 {formatTime(selectedOrder.createdAt)} — {formatDate(selectedOrder.createdAt)}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Danh sách sản phẩm:</div>
                    {selectedOrder.items?.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderBottom: '1px dashed rgba(0,0,0,0.08)',
                          fontSize: '0.9rem'
                        }}>
                          <span>{item.quantity}x {item.productName || `SP #${item.productId}`}</span>
                          <span style={{ fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()} ₫</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontStyle: 'italic', color: '#aaa', fontSize: '0.85rem' }}>Không có chi tiết sản phẩm</div>
                    )}
                  </div>

                  <div style={{
                    borderTop: '2px solid var(--primary)',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    marginBottom: '1.5rem'
                  }}>
                    <span>Tổng tiền</span>
                    <span style={{ color: 'var(--primary)' }}>{selectedOrder.totalAmount.toLocaleString()} ₫</span>
                  </div>

                  {selectedOrder.status === 'Pending' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
                      onClick={() => handleApprove(selectedOrder.id)}
                    >
                      Duyệt Đơn & Tích Điểm
                    </button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧾</div>
                  <p>Chọn một đơn hàng để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
