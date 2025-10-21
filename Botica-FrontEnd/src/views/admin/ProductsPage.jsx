import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: { idCategoria: '' },
    imagenUrl: ''
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/productos');
      if (!res.ok) throw new Error('No se pudo cargar productos');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/categorias/todas');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error al cargar categorías:', e);
    }
  };

  useEffect(() => { 
    load(); 
    loadCategories();
  }, []);

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Productos</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={() => openModal()}>Nuevo producto</button>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={load} disabled={loading}>{loading ? 'Actualizando...' : 'Refrescar'}</button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', opacity: 0.7 }}>Sin datos</td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.idProducto ?? p.id ?? p.nombre}>
                  <td>{p.idProducto ?? '-'}</td>
                  <td>{p.nombre ?? '-'}</td>
                  <td>S/. {p.precio ?? '0.00'}</td>
                  <td>{p.stock ?? '0'}</td>
                  <td>{p.categoria?.nombre ?? '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => openModal(p)}>Editar</button>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0, background: 'rgba(220, 53, 69, 0.9)' }} onClick={() => deleteProduct(p.idProducto)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para crear/editar producto */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
              <h3>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Descripción:</label>
                  <textarea
                    className="form-input"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="3"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Stock:</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Categoría:</label>
                  <select
                    className="form-input"
                    value={formData.categoria.idCategoria}
                    onChange={(e) => setFormData({...formData, categoria: { idCategoria: e.target.value }})}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>URL de Imagen:</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.imagen}
                    onChange={(e) => setFormData({...formData, imagen: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={closeModal} style={{ padding: '8px 16px' }}>Cancelar</button>
                  <button type="submit" className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }}>
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        stock: product.stock || '',
        categoria: { idCategoria: product.categoria?.idCategoria || '' },
        imagen: product.imagen || ''
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: { idCategoria: '' },
        imagen: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingProduct 
        ? `http://localhost:8080/api/productos/${editingProduct.idProducto}`
        : 'http://localhost:8080/api/productos';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Error al guardar producto');
      
      closeModal();
      load();
      alert(editingProduct ? 'Producto actualizado' : 'Producto creado');
    } catch (e) {
      alert(e.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/productos/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar producto');
      
      load();
      alert('Producto eliminado');
    } catch (e) {
      alert(e.message || 'Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };
}
