import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ sku: '', name: '', uoM: 'Quyển', basePrice: 0, category: '', isVirtual: false, imageUrl: '' });
  const [editId, setEditId] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    try {
      const res = await apiClient.post('/Upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData({ ...formData, imageUrl: res.data.url });
    } catch (err) {
      alert("Lỗi tải ảnh lên");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/Products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.put(`/Products/${editId}`, formData);
      } else {
        await apiClient.post('/Products', formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert("Cập nhật sách gặp lỗi");
    }
  };

  const handleEdit = (p) => {
    setFormData({
      sku: p.sku, name: p.name, uoM: p.uoM || 'Quyển', basePrice: p.basePrice, category: p.category, isVirtual: p.isVirtual, imageUrl: p.imageUrl || ''
    });
    setEditId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Chắc chắn gỡ ấn phẩm khỏi kệ?")) {
      await apiClient.delete(`/Products/${id}`);
      fetchProducts();
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Tủ Sách / Sản Phẩm</h2>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditId(null); setFormData({ sku: '', name: '', uoM: 'Quyển', basePrice: 0, category: 'Văn học cổ điển', isVirtual: false, imageUrl: '' }); }}>
          + Thêm Ấn Phẩm Mới
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Mã Sổ (SKU)</th>
            <th>Tên Ấn Phẩm</th>
            <th>Thể Loại</th>
            <th>Giá Tiền</th>
            <th>Tồn Khổ</th>
            <th>Hình Thức</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td><span style={{ fontFamily: 'monospace' }}>{p.sku}</span></td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {p.imageUrl ? (
                    <img src={`http://localhost:5245${p.imageUrl}`} alt="img" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: '#e2d5c3', borderRadius: '4px' }}></div>
                  )}
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                </div>
              </td>
              <td style={{ fontStyle: 'italic' }}>{p.category}</td>
              <td>{p.basePrice.toLocaleString()} ₫</td>
              <td>{p.inventoryQuantity}</td>
              <td>{p.isVirtual ? <span className="badge badge-silver">E-Book/Combo</span> : <span className="badge badge-gold">Sách Giấy</span>}</td>
              <td>
                <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', marginRight: '0.5rem' }} onClick={() => handleEdit(p)}>Biên Tạp</button>
                <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleDelete(p.id)}>Xóa Chép</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Trong kho chưa sách.</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(62, 39, 35, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fffbf0' }}>
            <h2>{editId ? 'Biên Tập Sách' : 'Ghi Danh Sách Mới'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              <input className="input-field" placeholder="Mã SKU (Vd: BOOK-01)" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
              <input className="input-field" placeholder="Tên tác phẩm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input className="input-field" placeholder="Thể loại mộc mạc" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              <input className="input-field" type="number" placeholder="Giá lượng bạc" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})} required />
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tranh Kèm Theo (Ảnh)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {formData.imageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={`http://localhost:5245${formData.imageUrl}`} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isVirtual} onChange={e => setFormData({...formData, isVirtual: e.target.checked})} /> Phụ bản ảo (Combo / EBook)
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Thu lại</button>
                <button type="submit" className="btn btn-primary">Ghi Sổ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
