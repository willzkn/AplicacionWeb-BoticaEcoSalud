import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function CategoryEditModal({ isOpen, onClose, category, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Modo edición
        setFormData({
          nombre: category.nombre || '',
          descripcion: category.descripcion || '',
          activo: category.activo !== false
        });
      } else {
        // Modo creación
        setFormData({
          nombre: '',
          descripcion: '',
          activo: true
        });
      }
      setError('');
    }
  }, [isOpen, category]);

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
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es obligatorio');
      }

      let url, method;
      if (category) {
        // Editar categoría existente
        url = `http://localhost:8080/api/categorias/${category.idCategoria}`;
        method = 'PUT';
      } else {
        // Crear nueva categoría
        url = 'http://localhost:8080/api/categorias/crear';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar categoría');
      }

      const savedCategory = await response.json();
      onSave(savedCategory);
      onClose();
      
    } catch (e) {
      setError(e.message || 'Error al guardar categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={category ? `Editar Categoría: ${category.nombre}` : 'Nueva Categoría'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="category-form">
        {error && (
          <div className="alert-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="nombre">Nombre *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Ej: Medicamentos, Vitaminas, etc."
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="3"
            className="form-input"
            placeholder="Descripción opcional de la categoría"
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
            Categoría activa
          </label>
        </div>

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
            {loading ? 'Guardando...' : (category ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </Modal>
  );
}