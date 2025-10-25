import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import ProviderEditModal from '../partials/ProviderEditModal';

export default function ProvidersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [providers, setProviders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/proveedores/all');
      if (!res.ok) throw new Error('No se pudo cargar proveedores');
      const data = await res.json();
      setProviders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleNewProvider = () => {
    setEditingProvider(null);
    setShowModal(true);
  };

  const handleEditProvider = (provider) => {
    setEditingProvider(provider);
    setShowModal(true);
  };

  const handleDeleteProvider = async (provider) => {
    if (!window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE "${provider.nombreComercial}"?\n\nEsta acción no se puede deshacer. Si tiene productos asociados, no se podrá eliminar.`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/proveedores/${provider.idProveedor}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al eliminar proveedor');
      }

      setSuccess('Proveedor eliminado permanentemente');
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar lista
    } catch (e) {
      setError(e.message || 'Error al eliminar proveedor');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleToggleStatus = async (provider) => {
    try {
      const newStatus = !provider.estado;
      const res = await fetch(`http://localhost:8080/api/proveedores/${provider.idProveedor}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: newStatus })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al cambiar estado');
      }

      setSuccess(`Proveedor ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar lista
    } catch (e) {
      setError(e.message || 'Error al cambiar estado');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSaveProvider = (savedProvider) => {
    setSuccess(editingProvider ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente');
    setTimeout(() => setSuccess(''), 3000);
    load(); // Recargar lista
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/proveedores/export/csv');
      
      if (!response.ok) {
        throw new Error('Error al generar el archivo CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proveedores_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Archivo CSV de proveedores generado y descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al exportar CSV: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider =>
    provider.nombreComercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.ruc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.tipoProducto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.personaContacto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Gestión de Proveedores</h2>

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
            onClick={handleNewProvider}
          >
            + Nuevo Proveedor
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
            placeholder="Buscar proveedores..."
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
            <div className="stat-number">{providers.length}</div>
            <div className="stat-label">Total Proveedores</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{providers.filter(p => p.estado).length}</div>
            <div className="stat-label">Activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{providers.filter(p => !p.estado).length}</div>
            <div className="stat-label">Inactivos</div>
          </div>
        </div>

        {/* Tabla de proveedores */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Comercial</th>
                <th>RUC</th>
                <th>Contacto</th>
                <th>Tipo Producto</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', opacity: 0.7, padding: '40px' }}>
                    {searchTerm ? 'No se encontraron proveedores' : 'Sin proveedores registrados'}
                  </td>
                </tr>
              )}
              {filteredProviders.map((p) => (
                <tr key={p.idProveedor} className={!p.estado ? 'row-inactive' : ''}>
                  <td>{p.idProveedor}</td>
                  <td>
                    <div>
                      <strong>{p.nombreComercial}</strong>
                      {p.correo && (
                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
                          {p.correo}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      {p.ruc}
                      {p.telefono && (
                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
                          📞 {p.telefono}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{p.personaContacto || '-'}</td>
                  <td>
                    <div style={{ maxWidth: '150px' }}>
                      {p.tipoProducto ? (
                        p.tipoProducto.length > 30 ? 
                        p.tipoProducto.substring(0, 30) + '...' : 
                        p.tipoProducto
                      ) : '-'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${p.estado ? 'status-active' : 'status-inactive'}`}>
                      {p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {p.fechaRegistro ? new Date(p.fechaRegistro).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEditProvider(p)}
                        title="Editar proveedor"
                      >
                        ✏️
                      </button>
                      <button 
                        className={`btn-action ${p.estado ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleToggleStatus(p)}
                        title={p.estado ? 'Desactivar' : 'Activar'}
                      >
                        {p.estado ? '🚫' : '✅'}
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDeleteProvider(p)}
                        title="Eliminar proveedor"
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
        <ProviderEditModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          provider={editingProvider}
          onSave={handleSaveProvider}
        />
      </div>
    </AdminLayout>
  );
}