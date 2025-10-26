import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import UserEditModal from '../partials/UserEditModal';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import AccessAlert from '../../components/AccessAlert';

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/usuarios/all');
      if (!res.ok) throw new Error('No se pudo cargar usuarios');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleNewUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE al usuario "${user.email}"?\n\nEsta acción no se puede deshacer. Si tiene pedidos o datos asociados, no se podrá eliminar.`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${user.idUsuario}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al eliminar usuario');
      }

      setSuccess('Usuario eliminado permanentemente');
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar lista
    } catch (e) {
      setError(e.message || 'Error al eliminar usuario');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.activo;
      const res = await fetch(`http://localhost:8080/api/usuarios/${user.idUsuario}/estado`, {
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

      setSuccess(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar lista
    } catch (e) {
      setError(e.message || 'Error al cambiar estado');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSaveUser = (savedUser) => {
    setSuccess(editingUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
    setTimeout(() => setSuccess(''), 3000);
    load(); // Recargar lista
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/usuarios/export/csv');
      
      if (!response.ok) {
        throw new Error('Error al generar el archivo CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Archivo CSV de usuarios generado y descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al exportar CSV: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Gestión de Usuarios</h2>

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
            onClick={handleNewUser}
          >
            + Nuevo Usuario
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
            placeholder="Buscar usuarios..."
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
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">Total Usuarios</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{users.filter(u => u.activo).length}</div>
            <div className="stat-label">Activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{users.filter(u => u.rol === 'ADMIN').length}</div>
            <div className="stat-label">Administradores</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{users.filter(u => u.rol === 'USER').length}</div>
            <div className="stat-label">Clientes</div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', opacity: 0.7, padding: '40px' }}>
                    {searchTerm ? 'No se encontraron usuarios' : 'Sin usuarios registrados'}
                  </td>
                </tr>
              )}
              {filteredUsers.map((u) => (
                <tr key={u.idUsuario} className={!u.activo ? 'row-inactive' : ''}>
                  <td>{u.idUsuario}</td>
                  <td>
                    <div>
                      <strong>{u.email}</strong>
                    </div>
                  </td>
                  <td>
                    <div>
                      {u.nombres} {u.apellidos}
                    </div>
                  </td>
                  <td>{u.telefono || '-'}</td>
                  <td>
                    <span className={`role-badge ${u.rol === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                      {u.rol === 'ADMIN' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.activo ? 'status-active' : 'status-inactive'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEditUser(u)}
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                      <button 
                        className={`btn-action ${u.activo ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleToggleStatus(u)}
                        title={u.activo ? 'Desactivar' : 'Activar'}
                      >
                        {u.activo ? '🚫' : '✅'}
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDeleteUser(u)}
                        title="Eliminar usuario"
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
        <UserEditModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          user={editingUser}
          onSave={handleSaveUser}
        />
      </div>
    </AdminLayout>
  );
}
