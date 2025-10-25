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
      if (!user && !formData.password.trim()) {
        throw new Error('La contraseña es obligatoria para nuevos usuarios');
      }

      // Preparar datos para envío
      const dataToSend = { ...formData };
      
      // Si es edición y no hay contraseña nueva, no enviar el campo password
      if (user && !formData.password.trim()) {
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
            <label htmlFor="rol">Rol</label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="form-input"
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
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

          {showPassword && (
            <div className="form-group">
              <label htmlFor="password">
                {user ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!user}
                className="form-input"
                placeholder={user ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
                minLength={user ? 0 : 6}
              />
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