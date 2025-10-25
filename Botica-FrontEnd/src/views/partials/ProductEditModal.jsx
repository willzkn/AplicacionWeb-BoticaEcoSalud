import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function ProductEditModal({ isOpen, onClose, product, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    codigo: '',
    imagen: '',
    activo: true,
    idCategoria: '',
    idProveedor: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadProviders();
      
      if (product) {
        // Modo edición
        setFormData({
          nombre: product.nombre || '',
          descripcion: product.descripcion || '',
          precio: product.precio || '',
          stock: product.stock || '',
          codigo: product.codigo || '',
          imagen: product.imagen || '',
          activo: product.activo !== false,
          idCategoria: product.categoria?.idCategoria || '',
          idProveedor: product.proveedor?.idProveedor || ''
        });
      } else {
        // Modo creación
        setFormData({
          nombre: '',
          descripcion: '',
          precio: '',
          stock: '',
          codigo: '',
          imagen: '',
          activo: true,
          idCategoria: '',
          idProveedor: ''
        });
      }
    }
  }, [isOpen, product]);

  const loadCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/categorias/activas');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  const loadProviders = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/proveedores/activos');
      if (res.ok) {
        const data = await res.json();
        setProviders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error loading providers:', e);
    }
  };

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
      if (!formData.precio || parseFloat(formData.precio) <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      // Preparar datos para envío
      const dataToSend = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria: formData.idCategoria ? { idCategoria: parseInt(formData.idCategoria) } : null,
        proveedor: formData.idProveedor ? { idProveedor: parseInt(formData.idProveedor) } : null
      };

      // Eliminar campos que no necesita el backend
      delete dataToSend.idCategoria;
      delete dataToSend.idProveedor;

      let url, method;
      if (product) {
        // Editar producto existente
        url = `http://localhost:8080/api/productos/${product.idProducto}`;
        method = 'PUT';
      } else {
        // Crear nuevo producto
        url = 'http://localhost:8080/api/productos/create';
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
        throw new Error(errorText || 'Error al guardar producto');
      }

      const savedProduct = await response.json();
      onSave(savedProduct);
      onClose();
      
    } catch (e) {
      setError(e.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={product ? `Editar Producto: ${product.nombre}` : 'Nuevo Producto'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="product-form">
        {error && (
          <div className="alert-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="form-grid">
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="codigo">Código</label>
            <input
              type="text"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio *</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="idCategoria">Categoría</label>
            <select
              id="idCategoria"
              name="idCategoria"
              value={formData.idCategoria}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="idProveedor">Proveedor</label>
            <select
              id="idProveedor"
              name="idProveedor"
              value={formData.idProveedor}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Seleccionar proveedor</option>
              {providers.map(prov => (
                <option key={prov.idProveedor} value={prov.idProveedor}>
                  {prov.nombreComercial}
                </option>
              ))}
            </select>
          </div>
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="imagen">URL de Imagen</label>
          <input
            type="url"
            id="imagen"
            name="imagen"
            value={formData.imagen}
            onChange={handleChange}
            className="form-input"
            placeholder="https://ejemplo.com/imagen.jpg"
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
            Producto activo
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
            {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </Modal>
  );
}