import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import CategoryEditModal from '../partials/CategoryEditModal';

export default function CategoriesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/categorias/all');
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

  const handleNewCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE "${category.nombre}"?\n\nEsta acción no se puede deshacer. Si tiene productos asociados, no se podrá eliminar.`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/categorias/${category.idCategoria}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al eliminar categoría');
      }

      setSuccess('Categoría eliminada permanentemente');
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar lista
    } catch (e) {
      setError(e.message || 'Error al eliminar categoría');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      const newStatus = !category.activo;
      const res = await fetch(`http://localhost:8080/api/categorias/${category.idCategoria}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activo: newStatus })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al cambiar estado');
      }

      setSuccess(`Categoría ${newStatus ? 'activada' : 'desactivada'} correctamente`);
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar lista
    } catch (e) {
      setError(e.message || 'Error al cambiar estado');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSaveCategory = (savedCategory) => {
    setSuccess(editingCategory ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
    setTimeout(() => setSuccess(''), 3000);
    load(); // Recargar lista
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/categorias/export/csv');
      
      if (!response.ok) {
        throw new Error('Error al generar el archivo CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categorias_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Archivo CSV de categorías generado y descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al exportar CSV: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resolveImageSrc = (imagen) => {
    if (!imagen) return '';
    if (imagen.startsWith('http') || imagen.startsWith('data:')) return imagen;
    return `http://localhost:8080/api/imagenes/view/${imagen}`;
  };

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Gestión de Categorías</h2>

        {/* Mensajes de estado */}
        {error && (
          <div className="alert-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert-success" style={{ marginBottom: 16 }}>
            {success}
          </div>
        )}

        {/* Barra de herramientas */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="login-button"
            style={{ width: 'auto', padding: '12px 24px', margin: 0 }}
            onClick={handleNewCategory}
          >
            + Nueva Categoría
          </button>

          <button
            className="login-button"
            style={{ width: 'auto', padding: '12px 24px', margin: 0 }}
            onClick={load}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : '🔄 Refrescar'}
          </button>

          <button 
            className="login-button" 
            style={{ width: 'auto', padding: '12px 24px', margin: 0, backgroundColor: '#17a2b8', color: '#fff' }} 
            onClick={handleExportCSV}
            disabled={loading}
          >
            📄 Exportar CSV
          </button>

          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minWidth: '250px'
            }}
          />
        </div>

        {/* Estadísticas rápidas */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-number">{categories.length}</div>
            <div className="stat-label">Total Categorías</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{categories.filter(c => c.activo).length}</div>
            <div className="stat-label">Activas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{categories.filter(c => !c.activo).length}</div>
            <div className="stat-label">Inactivas</div>
          </div>
        </div>

        {/* Tabla de categorías */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', opacity: 0.7, padding: '40px' }}>
                    {searchTerm ? 'No se encontraron categorías' : 'Sin categorías registradas'}
                  </td>
                </tr>
              )}
              {filteredCategories.map((c) => (
                <tr key={c.idCategoria} className={!c.activo ? 'row-inactive' : ''}>
                  <td>
                    {resolveImageSrc(c.imagen) ? (
                      <img
                        src={resolveImageSrc(c.imagen)}
                        alt={c.nombre || 'Categoría'}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          window.open(resolveImageSrc(c.imagen), '_blank');
                        }}
                        onError={(e) => {
                          if (e.target.dataset.fallback === 'true') {
                            return;
                          }
                          e.target.dataset.fallback = 'true';
                          e.target.src = 'https://via.placeholder.com/50?text=Sin+Img';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#9ca3af'
                      }}>
                        🗂️
                      </div>
                    )}
                  </td>
                  <td>{c.idCategoria}</td>
                  <td>
                    <div>
                      <strong>{c.nombre}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px' }}>
                      {c.descripcion ? (
                        c.descripcion.length > 50 ?
                          c.descripcion.substring(0, 50) + '...' :
                          c.descripcion
                      ) : '-'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${c.activo ? 'status-active' : 'status-inactive'}`}>
                      {c.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditCategory(c)}
                        title="Editar categoría"
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn-action ${c.activo ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleToggleStatus(c)}
                        title={c.activo ? 'Desactivar' : 'Activar'}
                      >
                        {c.activo ? '🚫' : '✅'}
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteCategory(c)}
                        title="Eliminar categoría"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de edición */}
        <CategoryEditModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          category={editingCategory}
          onSave={handleSaveCategory}
        />
      </div>
    </AdminLayout>
  );
}
