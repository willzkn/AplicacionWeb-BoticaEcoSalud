import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function UserEditModal({ isOpen, onClose, user, onSave }) {
  const [formData, setFormData] = useState({
    email: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    rol: 'USER',
    activo: true,
    password: '' // Solo para creación
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Modo edición
        setFormData({
          email: user.email || '',
          nombres: user.nombres || '',
          apellidos: user.apellidos || '',
          telefono: user.telefono || '',
          direccion: user.direccion || '',
          rol: user.rol || 'USER',
          activo: user.activo !== false,
          password: '' // No mostrar contraseña existente
        });
        setShowPassword(false);
      } else {
        // Modo creación
        setFormData({
          email: '',
          nombres: '',
          apellidos: '',
          telefono: '',
          direccion: '',
          rol: 'USER',
          activo: true,
          password: ''
        });
        setShowPassword(true);
      }
      setError('');
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones básicas
      if (!formData.email.trim()) {
        throw new Error('El email es obligatorio');
      }
      if (!formData.nombres.trim()) {
        throw new Error('Los nombres son obligatorios');
      }
      if (!formData.apellidos.trim()) {
        throw new Error('Los apellidos son obligatorios');
      }
      // Validar contraseña solo si se proporciona
      if (!user && formData.password.trim() && formData.password.trim().length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Preparar datos para envío
      const dataToSend = { ...formData };
      
      // Si no hay contraseña (tanto en creación como edición), no enviar el campo
      // El backend asignará 123456 automáticamente para nuevos usuarios
      if (!formData.password || !formData.password.trim()) {
        delete dataToSend.password;
      }

      let url, method;
      if (user) {
        // Editar usuario existente
        url = `http://localhost:8080/api/usuarios/${user.idUsuario}`;
        method = 'PUT';
      } else {
        // Crear nuevo usuario
        url = 'http://localhost:8080/api/usuarios/register';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar usuario');
      }

      const savedUser = await response.json();
      onSave(savedUser);
      onClose();
      
    } catch (e) {
      setError(e.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={user ? `Editar Usuario: ${user.nombres} ${user.apellidos}` : 'Nuevo Usuario'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="user-form">
        {error && (
          <div className="alert-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              disabled={!!user} // No permitir cambiar email en edición
            />
            {user && (
              <small style={{ color: '#666', fontSize: '0.8em' }}>
                El email no se puede modificar
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rol">Rol del Usuario *</label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="form-input"
              style={{ 
                fontWeight: '600',
                color: formData.rol === 'ADMIN' ? '#d32f2f' : '#1976d2'
              }}
            >
              <option value="USER">👤 Cliente</option>
              <option value="ADMIN">👑 Administrador</option>
            </select>
            <small style={{ color: '#666', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
              {formData.rol === 'ADMIN' 
                ? '⚠️ Este usuario tendrá acceso total al panel de administración' 
                : 'ℹ️ Este usuario solo podrá realizar compras'}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="nombres">Nombres *</label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellidos">Apellidos *</label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="form-input"
              placeholder="Ej: 987654321"
            />
          </div>

          {user && showPassword && (
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña (opcional)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Dejar vacío para mantener actual"
              />
            </div>
          )}
          
          {!user && (
            <div className="form-group">
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#dbeafe', 
                border: '1px solid #3b82f6', 
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                <strong style={{ color: '#1e40af' }}>🔐 Contraseña Automática</strong>
                <p style={{ margin: '8px 0 0 0', color: '#1e3a8a' }}>
                  El usuario será creado con la contraseña temporal: <strong>123456</strong>
                  <br />
                  <small>El cliente deberá cambiarla al iniciar sesión por primera vez.</small>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="direccion">Dirección</label>
          <textarea
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            rows="2"
            className="form-input"
            placeholder="Dirección completa del usuario"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
            />
            Usuario activo
          </label>
        </div>

        {user && !showPassword && (
          <div className="form-group">
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="btn-secondary"
              style={{ width: 'auto' }}
            >
              🔑 Cambiar Contraseña
            </button>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </Modal>
  );
}