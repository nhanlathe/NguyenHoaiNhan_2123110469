import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import BookCover from '../../components/BookCover';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeDept, setActiveDept] = useState('Tất cả');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/Products');
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filterByDept = (dept) => {
    setActiveDept(dept);
    if (dept === 'Tất cả') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.department === dept));
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.find(item => item.id === product.id)) {
      alert("Sản phẩm đã có trong giỏ!");
      return;
    }
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      {/* Customer Header */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1rem 2rem', background: 'white', borderBottom: '1px solid var(--border-color)',
        position: 'sticky', top: 0, zIndex: 100, marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Bút Tích Antiquity</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/home" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>Trang Chủ</Link>
          <Link to="/cart" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>Giỏ Hàng</Link>
          <Link to="/profile" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>Thành Viên</Link>
          <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }} onClick={logout}>Đăng Xuất</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ 
          background: 'var(--primary)', color: 'white', padding: '4rem 2rem', 
          borderRadius: '16px', marginBottom: '3rem', textAlign: 'center', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #5d4037 0%, #8d6e63 100%)'
        }}>
          <h1 style={{ color: '#fffbf0', fontSize: '3rem', marginBottom: '1rem' }}>Tri Thức & Nghệ Thuật</h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.9 }}>Tìm kiếm những giá trị cổ điển cho tủ sách của bạn.</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {['Tất cả', 'Sách', 'Văn phòng phẩm', 'Quà tặng/Đồ chơi'].map(dept => (
            <button 
              key={dept}
              onClick={() => filterByDept(dept)}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: '25px', border: '1px solid var(--border-color)',
                background: activeDept === dept ? 'var(--primary)' : 'white',
                color: activeDept === dept ? 'white' : 'var(--text-main)',
                cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s'
              }}
            >
              {dept}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
          {filteredProducts.map(p => {
            let author = '';
            try {
              const meta = typeof p.metadataJson === 'string' ? JSON.parse(p.metadataJson) : (p.metadataJson || {});
              author = meta['Tác giả'] || meta['Tác Giả'] || meta['Author'] || '';
            } catch (e) {}
            return (
            <div key={p.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.3s' }}>
              <div style={{ 
                height: '220px', backgroundColor: '#f4efe6', borderRadius: '8px', 
                marginBottom: '1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:5245${p.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                ) : (
                  <BookCover name={p.name} category={p.category} author={author} size={150} />
                )}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{p.name}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                 <span className="badge badge-silver" style={{ fontSize: '0.75rem' }}>{p.category}</span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.3rem' }}>{p.basePrice?.toLocaleString()} ₫</span>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  onClick={() => addToCart(p)}
                >
                  + Giỏ Hàng
                </button>
              </div>
            </div>
            );
          })}
          {filteredProducts.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', gridColumn: 'span 4' }}>Không tìm thấy báu vật nào trong danh mục này.</div>}
        </div>
      </div>
    </div>
  );
}
