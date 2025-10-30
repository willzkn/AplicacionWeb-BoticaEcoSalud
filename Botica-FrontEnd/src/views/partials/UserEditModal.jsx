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
    password: '', // Solo para creación
    imagen: '' // Imagen de perfil
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
          password: '', // No mostrar contraseña existente
          imagen: user.imagen || ''
        });
        setImagePreview(user.imagen || null);
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
          password: '',
          imagen: ''
        });
        setImagePreview(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede ser mayor a 5MB');
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setFormData(prev => ({
        ...prev,
        imagen: base64
      }));
      setImagePreview(base64);
      setError(''); // Limpiar error si había
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imagen: ''
    }));
    setImagePreview(null);
    // Limpiar el input file
    const fileInput = document.getElementById('imagen');
    if (fileInput) fileInput.value = '';
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

        {/* Sección de imagen de perfil */}
        <div className="form-group">
          <label>Imagen de Perfil</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5'
            }}>
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  Sin imagen
                </span>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <input
                type="file"
                id="imagen"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => document.getElementById('imagen').click()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Seleccionar Imagen
                </button>
                
                {imagePreview && (
                  <button 
                    type="button"
                    onClick={removeImage}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Quitar Imagen
                  </button>
                )}
              </div>
              
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
              </small>
            </div>
          </div>
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