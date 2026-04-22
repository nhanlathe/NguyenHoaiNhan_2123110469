import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAlert } from '../../context/AlertContext';
import apiClient from '../../api/apiClient';
import BookCover from '../../components/BookCover';

const HIERARCHY = {
  'Sách': {
    categories: ['Giáo khoa', 'Ngoại văn', 'Kinh tế', 'Văn học'],
    metadata: ['Tác giả'],
    uom: ['Cuốn', 'Bộ']
  },
  'Văn phòng phẩm': {
    categories: ['Bút', 'Tập vở', 'Dụng cụ vẽ', 'Đồ dùng VP'],
    metadata: ['Thương hiệu', 'Màu sắc', 'Định lượng giấy (gsm)', 'Kích thước ngòi'],
    uom: ['Cái', 'Hộp', 'Lố (12 cái)', 'Ram (giấy)']
  },
  'Quà tặng/Đồ chơi': {
    categories: ['Gấu bông', 'Boardgame', 'Lưu niệm'],
    metadata: ['Chất liệu', 'Độ tuổi khuyến nghị', 'Xuất xứ'],
    uom: ['Con', 'Bộ', 'Cái']
  }
};

export default function Products() {
  const { showConfirm } = useAlert();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    sku: '', name: '', department: 'Sách', category: 'Giáo khoa', uoM: 'Cuốn', 
    basePrice: 0, inventoryQuantity: 0, isVirtual: false, imageUrl: '', metadata: {},
    batchDate: '', expiryDate: '',
    comboComponents: []
  });
  const [editId, setEditId] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      sku: formData.sku,
      name: formData.name,
      department: formData.department,
      category: formData.category,
      imageUrl: formData.imageUrl,
      isVirtual: formData.isVirtual,
      UoM: formData.uoM,
      BasePrice: formData.basePrice,
      InventoryQuantity: parseInt(formData.inventoryQuantity) || 0,
      metadataJson: JSON.stringify(formData.metadata),
      batchDate: formData.batchDate || null,
      expiryDate: formData.expiryDate || null,
      comboComponents: formData.isVirtual ? formData.comboComponents.filter(c => c.componentId).map(c => ({ componentId: c.componentId, quantity: c.quantity })) : []
    };
    try {
      if (editId) {
        await apiClient.put(`/Products/${editId}`, payload);
      } else {
        await apiClient.post('/Products', payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.errors 
        ? Object.values(data.errors).flat().join(', ') 
        : (data?.detail ? `${data.title}: ${data.detail}` : (data?.title || "Cập nhật sản phẩm gặp lỗi"));
      alert(errorMsg);
    }
  };

  const handleEdit = (p) => {
    let meta = {};
    try {
      meta = p.metadata ? JSON.parse(p.metadata) : {};
    } catch (e) {
      meta = {};
    }
    setFormData({
      sku: p.sku, 
      name: p.name, 
      department: p.department || 'Sách',
      category: p.category, 
      uoM: p.uoM || 'Cái', 
      basePrice: p.basePrice, 
      inventoryQuantity: p.inventoryQuantity || 0,
      isVirtual: p.isVirtual, 
      imageUrl: p.imageUrl || '',
      metadata: meta,
      batchDate: p.batchDate ? p.batchDate.split('T')[0] : '',
      expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '',
      comboComponents: p.comboComponents || []
    });
    setEditId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (await showConfirm("Chắc chắn gỡ sản phẩm này?")) {
      await apiClient.delete(`/Products/${id}`);
      fetchProducts();
    }
  };

  const handleDeptChange = (dept) => {
    const firstCat = HIERARCHY[dept].categories[0];
    const firstUom = HIERARCHY[dept].uom[0];
    setFormData({ ...formData, department: dept, category: firstCat, uoM: firstUom, metadata: {} });
  };

  const handleMetaChange = (key, val) => {
    setFormData({ ...formData, metadata: { ...formData.metadata, [key]: val } });
  };

  const isNearingExpiry = (dateStr) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return expiry <= sixMonthsFromNow;
  };

  const addComboComponent = () => {
    setFormData({ ...formData, comboComponents: [...formData.comboComponents, { componentId: '', quantity: 1 }] });
  };

  const removeComboComponent = (index) => {
    const newComps = [...formData.comboComponents];
    newComps.splice(index, 1);
    setFormData({ ...formData, comboComponents: newComps });
  };

  const updateComboComponent = (index, key, val) => {
    const newComps = [...formData.comboComponents];
    newComps[index][key] = val;
    setFormData({ ...formData, comboComponents: newComps });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Hệ Thống / Danh Mục Sản Phẩm</h2>
        <button className="btn btn-primary" onClick={() => { 
          setShowModal(true); 
          setEditId(null); 
          setFormData({ sku: '', name: '', department: 'Sách', category: 'Giáo khoa', uoM: 'Cuốn', basePrice: 0, inventoryQuantity: 0, isVirtual: false, imageUrl: '', metadata: {}, batchDate: '', expiryDate: '', comboComponents: [] }); 
        }}>
          + Thêm Sản Phẩm Mới
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Tên Sản Phẩm</th>
            <th>Tác Giả</th>
            <th>Ngành Hàng</th>
            <th>Phân Loại</th>
            <th>Giá Bán</th>
            <th>Tồn Kho</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const nearExpiry = isNearingExpiry(p.expiryDate);
            return (
              <tr key={p.id}>
                <td><span style={{ fontFamily: 'monospace' }}>{p.sku}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:5245${p.imageUrl}`} alt="img" style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      (() => {
                        let author = '';
                        try {
                          const metaStr = p.metadataJson || p.metadata;
                          const meta = typeof metaStr === 'string' ? JSON.parse(metaStr) : (metaStr || {});
                          author = meta['Tác giả'] || meta['Tác Giả'] || meta['Author'] || '';
                        } catch (e) {}
                        return <BookCover name={p.name} category={p.category} author={author} size={40} />;
                      })()
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.isVirtual && <span className="badge badge-silver" style={{ fontSize: '0.7rem' }}>Combo</span>}
                    </div>
                  </div>
                </td>
                <td>{(() => {
                  try {
                    const metaStr = p.metadataJson || p.metadata;
                    const meta = typeof metaStr === 'string' ? JSON.parse(metaStr) : (metaStr || {});
                    return meta['Tác giả'] || meta['Tác Giả'] || meta['Author'] || '-';
                  } catch { return '-'; }
                })()}</td>
                <td>{p.department}</td>
                <td style={{ fontStyle: 'italic' }}>{p.category}</td>
                <td>{p.basePrice?.toLocaleString()} ₫</td>
                <td>{p.inventoryQuantity} {p.uoM}</td>
                <td>
                  <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', marginRight: '0.5rem' }} onClick={() => handleEdit(p)}>Sửa</button>
                  <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleDelete(p.id)}>Xóa</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '650px', backgroundColor: 'var(--card-bg)', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--primary)', position: 'relative' }}>
            <button type="button" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            <h2 style={{ color: 'var(--primary)', borderBottom: '2px dashed var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '2rem' }}>
              {editId ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label className="label-text">Tên Sản Phẩm</label>
                <input className="input-field" placeholder="Nhập tên sản phẩm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div>
                <label className="label-text">Mã SKU</label>
                <input className="input-field" placeholder="Vd: BOOK-001" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
              </div>

              <div>
                <label className="label-text">Giá Bán</label>
                <input className="input-field" type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})} required />
              </div>

              <div>
                <label className="label-text">Tồn Kho</label>
                <input className="input-field" type="number" value={formData.inventoryQuantity} onChange={e => setFormData({...formData, inventoryQuantity: parseInt(e.target.value) || 0})} required />
              </div>

              <div>
                <label className="label-text">Ngành Hàng</label>
                <select className="input-field" value={formData.department} onChange={e => handleDeptChange(e.target.value)}>
                  {Object.keys(HIERARCHY).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              <div>
                <label className="label-text">Phân Loại</label>
                <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {HIERARCHY[formData.department].categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="label-text">Đơn Vị Tính (UoM)</label>
                <select className="input-field" value={formData.uoM} onChange={e => setFormData({...formData, uoM: e.target.value})}>
                  {HIERARCHY[formData.department].uom.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Removed BatchDate and ExpiryDate */}

              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                  <input type="checkbox" checked={formData.isVirtual} onChange={e => setFormData({...formData, isVirtual: e.target.checked})} /> 
                  <span>Virtual SKU (Combo) - Tự động trừ tồn thành phần</span>
                </div>
                {formData.isVirtual && (
                  <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px', marginTop: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Thành phần trong Combo:</div>
                    {formData.comboComponents.map((comp, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <select className="input-field" style={{ flex: 2, marginBottom: 0 }} value={comp.componentId} onChange={e => updateComboComponent(idx, 'componentId', e.target.value)}>
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.filter(p => !p.isVirtual && p.id !== editId).map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                        <input type="number" className="input-field" style={{ flex: 1, marginBottom: 0 }} placeholder="SL" value={comp.quantity} onChange={e => updateComboComponent(idx, 'quantity', parseInt(e.target.value))} />
                        <button type="button" className="btn btn-danger" style={{ padding: '0 0.5rem' }} onClick={() => removeComboComponent(idx)}>×</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline" style={{ width: '100%', fontSize: '0.8rem', padding: '0.3rem' }} onClick={addComboComponent}>+ Thêm thành phần</button>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>Thông tin đặc thù (Metadata)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {HIERARCHY[formData.department].metadata.map(meta => (
                    <div key={meta}>
                      <label style={{ fontSize: '0.8rem', color: '#666' }}>{meta}</label>
                      <input className="input-field" placeholder={meta} value={formData.metadata[meta] || ''} onChange={e => handleMetaChange(meta, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="label-text">Ảnh Sản Phẩm</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {formData.imageUrl && (
                  <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:5245${formData.imageUrl}`} alt="preview" style={{ width: '60px', height: '60px', marginTop: '0.5rem', borderRadius: '4px' }} />
                )}
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ minWidth: '120px' }} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Lưu Sản Phẩm</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
