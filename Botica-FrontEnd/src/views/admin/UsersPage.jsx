import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: 'cliente',
    activo: true
  });

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

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Usuarios</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={() => openModal()}>Nuevo usuario</button>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={load} disabled={loading}>{loading ? 'Actualizando...' : 'Refrescar'}</button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Rol</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', opacity: 0.7 }}>Sin datos</td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.idUsuario ?? u.id ?? u.email}>
                  <td>{u.idUsuario ?? '-'}</td>
                  <td>{u.email ?? '-'}</td>
                  <td>{u.nombres ?? '-'}</td>
                  <td>{u.apellidos ?? '-'}</td>
                  <td>{u.rol ?? '-'}</td>
                  <td>{String(u.activo ?? true)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => openModal(u)}>Editar</button>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0, background: u.activo ? 'rgba(220, 53, 69, 0.9)' : 'rgba(40, 167, 69, 0.9)' }} onClick={() => toggleActive(u.idUsuario, u.activo)}>
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0, background: 'rgba(108, 117, 125, 0.9)' }} onClick={() => deleteUser(u.idUsuario)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para crear/editar usuario */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
              <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label>Nombres:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombres}
                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Apellidos:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Email:</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Dirección:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>Rol:</label>
                  <select
                    className="form-input"
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    required
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
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
                    {editingUser ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );

  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        rol: user.rol || 'cliente',
        activo: user.activo !== false
      });
    } else {
      setFormData({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        direccion: '',
        rol: 'cliente',
        activo: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingUser 
        ? `http://localhost:8080/api/usuarios/${editingUser.idUsuario}`
        : 'http://localhost:8080/api/usuarios/register';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Para nuevos usuarios, agregar password por defecto
      const dataToSend = editingUser ? formData : { ...formData, password: '123456' };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!res.ok) throw new Error('Error al guardar usuario');
      
      closeModal();
      load();
      alert(editingUser ? 'Usuario actualizado' : 'Usuario creado con contraseña temporal: 123456');
    } catch (e) {
      alert(e.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentActive) => {
    setLoading(true);
    try {
      const endpoint = currentActive ? 'desactivar' : 'activar';
      const res = await fetch(`http://localhost:8080/api/usuarios/${id}/${endpoint}`, {
        method: 'PATCH'
      });

      if (!res.ok) throw new Error('Error al cambiar estado');
      
      load();
      alert(`Usuario ${currentActive ? 'desactivado' : 'activado'}`);
    } catch (e) {
      alert(e.message || 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar usuario');
      
      load();
      alert('Usuario eliminado');
    } catch (e) {
      alert(e.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };
}
