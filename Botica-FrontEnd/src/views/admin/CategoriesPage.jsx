import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function CategoriesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/categorias/todas');
      if (!res.ok) throw new Error('No se pudo cargar categorías');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Categorías</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={() => openModal()}>Nueva categoría</button>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={load} disabled={loading}>{loading ? 'Actualizando...' : 'Refrescar'}</button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div>
          <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', opacity: 0.7 }}>Sin datos</td>
                  </tr>
                )}
                {categories.map((c) => (
                  <tr key={c.idCategoria ?? c.id ?? c.nombre}>
                    <td>{c.idCategoria ?? '-'}</td>
                    <td>{c.nombre ?? '-'}</td>
                    <td>{String(c.activo ?? true)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => openModal(c)}>Editar</button>
                        <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0, background: c.activo ? 'rgba(220, 53, 69, 0.9)' : 'rgba(40, 167, 69, 0.9)' }} onClick={() => toggleActive(c.idCategoria, c.activo)}>
                          {c.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0, background: 'rgba(108, 117, 125, 0.9)' }} onClick={() => deleteCategory(c.idCategoria)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Modal para crear/editar categoría */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
              <h3>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
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
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                    />
                    Activo
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={closeModal} style={{ padding: '8px 16px' }}>Cancelar</button>
                  <button type="submit" className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }}>
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );

  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        nombre: category.nombre || '',
        descripcion: category.descripcion || '',
        activo: category.activo !== false
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingCategory 
        ? `http://localhost:8080/api/categorias/${editingCategory.idCategoria}`
        : 'http://localhost:8080/api/categorias';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Error al guardar categoría');
      
      closeModal();
      load();
      alert(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
    } catch (e) {
      alert(e.message || 'Error al guardar categoría');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentActive) => {
    setLoading(true);
    try {
      const endpoint = currentActive ? 'desactivar' : 'activar';
      const res = await fetch(`http://localhost:8080/api/categorias/${id}/${endpoint}`, {
        method: 'PATCH'
      });

      if (!res.ok) throw new Error('Error al cambiar estado');
      
      load();
      alert(`Categoría ${currentActive ? 'desactivada' : 'activada'}`);
    } catch (e) {
      alert(e.message || 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/categorias/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar categoría');
      
      load();
      alert('Categoría eliminada');
    } catch (e) {
      alert(e.message || 'Error al eliminar categoría');
    } finally {
      setLoading(false);
    }
  };
}
