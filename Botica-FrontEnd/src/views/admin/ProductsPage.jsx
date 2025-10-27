import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import ProductEditModal from '../partials/ProductEditModal';

export default function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/productos/all');
      if (!res.ok) throw new Error('No se pudo cargar productos');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE "${product.nombre}"?\n\nEsta acción no se puede deshacer. Si solo quieres desactivarlo, usa el botón de estado.`)) {
      return;
    }

    try {
      console.log('🗑️ Eliminando producto:', { id: product.idProducto, nombre: product.nombre });
      
      const url = `http://localhost:8080/api/productos/${product.idProducto}`;
      console.log('📤 Enviando DELETE request:', url);

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      console.log('📥 DELETE Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ DELETE Error response:', errorText);
        throw new Error(errorText || 'Error al eliminar producto');
      }

      const responseText = await res.text();
      console.log('✅ DELETE Success response:', responseText);

      setSuccess('Producto eliminado permanentemente');
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar lista
    } catch (e) {
      console.error('💥 Error en handleDeleteProduct:', e);
      setError(e.message || 'Error al eliminar producto');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.activo;
      console.log('🔄 Cambiando estado de producto:', { 
        id: product.idProducto, 
        nombre: product.nombre, 
        estadoActual: product.activo, 
        nuevoEstado: newStatus 
      });

      const url = `http://localhost:8080/api/productos/${product.idProducto}/estado`;
      const body = { activo: newStatus };
      
      console.log('📤 Enviando request:', { url, method: 'PUT', body });

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(body)
      });

      console.log('📥 Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        throw new Error(errorText || 'Error al cambiar estado');
      }

      const responseText = await res.text();
      console.log('✅ Success response:', responseText);

      setSuccess(`Producto ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar lista
    } catch (e) {
      console.error('💥 Error en handleToggleStatus:', e);
      setError(e.message || 'Error al cambiar estado');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSaveProduct = (savedProduct) => {
    setSuccess(editingProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
    setTimeout(() => setSuccess(''), 3000);
    load(); // Recargar lista
  };



  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/productos/export/csv');
      
      if (!response.ok) {
        throw new Error('Error al generar el archivo CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Archivo CSV generado y descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al exportar CSV: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Gestión de Productos</h2>

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
            onClick={handleNewProduct}
          >
            + Nuevo Producto
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
          >
            📄 Exportar CSV
          </button>

          <input
            type="text"
            placeholder="Buscar productos..."
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
            <div className="stat-number">{products.length}</div>
            <div className="stat-label">Total Productos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{products.filter(p => p.activo).length}</div>
            <div className="stat-label">Activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{products.filter(p => p.stock < 10).length}</div>
            <div className="stat-label">Stock Bajo</div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', opacity: 0.7, padding: '40px' }}>
                    {searchTerm ? 'No se encontraron productos' : 'Sin productos registrados'}
                  </td>
                </tr>
              )}
              {filteredProducts.map((p) => (
                <tr key={p.idProducto} className={!p.activo ? 'row-inactive' : ''}>
                  <td>
                    {p.imagen ? (
                      <img 
                        src={p.imagen} 
                        alt={p.nombre}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          // Abrir imagen en modal o nueva pestaña
                          window.open(p.imagen, '_blank');
                        }}
                        onError={(e) => {
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
                        📦
                      </div>
                    )}
                  </td>
                  <td>{p.idProducto}</td>
                  <td>{p.codigo || '-'}</td>
                  <td>
                    <div>
                      <strong>{p.nombre}</strong>
                      {p.descripcion && (
                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
                          {p.descripcion.length > 50 ? p.descripcion.substring(0, 50) + '...' : p.descripcion}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>S/. {p.precio?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={p.stock < 10 ? 'stock-low' : 'stock-normal'}>
                      {p.stock || 0}
                    </span>
                  </td>
                  <td>{p.categoria?.nombre || '-'}</td>
                  <td>
                    <span className={`status-badge ${p.activo ? 'status-active' : 'status-inactive'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEditProduct(p)}
                        title="Editar producto"
                      >
                        ✏️
                      </button>
                      <button 
                        className={`btn-action ${p.activo ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleToggleStatus(p)}
                        title={p.activo ? 'Desactivar' : 'Activar'}
                      >
                        {p.activo ? '🚫' : '✅'}
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDeleteProduct(p)}
                        title="Eliminar producto"
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
        <ProductEditModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          product={editingProduct}
          onSave={handleSaveProduct}
        />
      </div>
    </AdminLayout>
  );
}
