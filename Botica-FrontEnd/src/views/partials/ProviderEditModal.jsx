import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function ProviderEditModal({ isOpen, onClose, provider, onSave }) {
  const [formData, setFormData] = useState({
    nombreComercial: '',
    ruc: '',
    telefono: '',
    correo: '',
    personaContacto: '',
    tipoProducto: '',
    condicionesPago: '',
    estado: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      if (provider) {
        // Modo edición
        setFormData({
          nombreComercial: provider.nombreComercial || '',
          ruc: provider.ruc || '',
          telefono: provider.telefono || '',
          correo: provider.correo || '',
          personaContacto: provider.personaContacto || '',
          tipoProducto: provider.tipoProducto || '',
          condicionesPago: provider.condicionesPago || '',
          estado: provider.estado !== false
        });
      } else {
        // Modo creación
        setFormData({
          nombreComercial: '',
          ruc: '',
          telefono: '',
          correo: '',
          personaContacto: '',
          tipoProducto: '',
          condicionesPago: '',
          estado: true
        });
      }
      setError('');
    }
  }, [isOpen, provider]);

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
      if (!formData.nombreComercial.trim()) {
        throw new Error('El nombre comercial es obligatorio');
      }
      if (!formData.ruc.trim()) {
        throw new Error('El RUC es obligatorio');
      }
      if (formData.ruc.length !== 11) {
        throw new Error('El RUC debe tener 11 dígitos');
      }

      let url, method;
      if (provider) {
        // Editar proveedor existente
        url = `http://localhost:8080/api/proveedores/${provider.idProveedor}`;
        method = 'PUT';
      } else {
        // Crear nuevo proveedor
        url = 'http://localhost:8080/api/proveedores/register';
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
        throw new Error(errorText || 'Error al guardar proveedor');
      }

      const savedProvider = await response.json();
      onSave(savedProvider);
      onClose();
      
    } catch (e) {
      setError(e.message || 'Error al guardar proveedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={provider ? `Editar Proveedor: ${provider.nombreComercial}` : 'Nuevo Proveedor'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="provider-form">
        {error && (
          <div className="alert-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombreComercial">Nombre Comercial *</label>
            <input
              type="text"
              id="nombreComercial"
              name="nombreComercial"
              value={formData.nombreComercial}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Ej: Laboratorios ABC S.A.C."
            />
          </div>

          <div className="form-group">
            <label htmlFor="ruc">RUC *</label>
            <input
              type="text"
              id="ruc"
              name="ruc"
              value={formData.ruc}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="12345678901"
              maxLength="11"
              pattern="[0-9]{11}"
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
              placeholder="01-2345678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="form-input"
              placeholder="contacto@proveedor.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="personaContacto">Persona de Contacto</label>
            <input
              type="text"
              id="personaContacto"
              name="personaContacto"
              value={formData.personaContacto}
              onChange={handleChange}
              className="form-input"
              placeholder="Nombre del contacto principal"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipoProducto">Tipo de Producto</label>
            <input
              type="text"
              id="tipoProducto"
              name="tipoProducto"
              value={formData.tipoProducto}
              onChange={handleChange}
              className="form-input"
              placeholder="Ej: Medicamentos, Equipos médicos"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="condicionesPago">Condiciones de Pago</label>
          <textarea
            id="condicionesPago"
            name="condicionesPago"
            value={formData.condicionesPago}
            onChange={handleChange}
            rows="2"
            className="form-input"
            placeholder="Ej: Crédito 30 días, Contado, etc."
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="estado"
              checked={formData.estado}
              onChange={handleChange}
            />
            Proveedor activo
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
            {loading ? 'Guardando...' : (provider ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </Modal>
  );
}