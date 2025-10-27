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
  const [imagePreview, setImagePreview] = useState('');
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' o 'file'

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
        setImagePreview(product.imagen || '');
        // Detectar si es URL o Base64
        if (product.imagen && product.imagen.startsWith('data:')) {
          setUploadMethod('file');
        } else {
          setUploadMethod('url');
        }
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
        setImagePreview('');
        setUploadMethod('url');
      }
      setError('');
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }

      // Convertir a Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({
          ...prev,
          imagen: base64String
        }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
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
          <label>Imagen del Producto</label>
          
          {/* Selector de método */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="uploadMethod"
                value="url"
                checked={uploadMethod === 'url'}
                onChange={(e) => setUploadMethod(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              URL de imagen
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="uploadMethod"
                value="file"
                checked={uploadMethod === 'file'}
                onChange={(e) => setUploadMethod(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Subir desde PC
            </label>
          </div>

          {/* Input según método seleccionado */}
          {uploadMethod === 'url' ? (
            <input
              type="url"
              id="imagen"
              name="imagen"
              value={formData.imagen}
              onChange={handleChange}
              className="form-input"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          ) : (
            <div>
              <input
                type="file"
                id="imagenFile"
                accept="image/*"
                onChange={handleImageUpload}
                className="form-input"
                style={{ padding: '8px' }}
              />
              <small style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Formatos: JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB
              </small>
            </div>
          )}

          {/* Vista previa de la imagen */}
          {(formData.imagen || imagePreview) && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Vista previa:</p>
              <img 
                src={imagePreview || formData.imagen} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  borderRadius: '8px', 
                  border: '2px solid #e5e7eb',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, imagen: '' }));
                  setImagePreview('');
                }}
                style={{
                  display: 'block',
                  margin: '8px auto 0',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: '#ef4444',
                  background: 'none',
                  border: '1px solid #ef4444',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Eliminar imagen
              </button>
            </div>
          )}
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