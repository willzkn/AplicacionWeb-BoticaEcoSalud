import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../../controllers/AuthContext";
import perfilService from "../../services/PerfilService";
import "../../styles/ecosalud.css";
import "../../styles/perfil.css";

export default function PerfilView() {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('datos');
  
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    imagen: ""
  });



  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    cargarPerfil();
  }, [isAuthenticated, navigate]);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const perfil = await perfilService.obtenerPerfil(user.idUsuario);
      
      setFormData({
        nombres: perfil.nombres || "",
        apellidos: perfil.apellidos || "",
        email: perfil.email || "",
        telefono: perfil.telefono || "",
        direccion: perfil.direccion || "",
        imagen: perfil.imagen || ""
      });

      // Mostrar imagen actual si existe
      if (perfil.imagen) {
        setImagePreview(perfil.imagen);
      }
      
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      alert(error.message || 'Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Validaciones en tiempo real
    if (name === "nombres" || name === "apellidos") {
      newValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    } else if (name === "telefono") {
      newValue = value.replace(/[^0-9]/g, "");
    }

    setFormData({
      ...formData,
      [name]: newValue
    });

    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };



  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar imagen usando el servicio
    const validacion = perfilService.validarImagen(file);
    if (!validacion.valida) {
      alert(validacion.mensaje);
      return;
    }

    try {
      // Convertir a base64 usando el servicio
      const base64 = await perfilService.convertirABase64(file);
      setFormData({
        ...formData,
        imagen: base64
      });
      setImagePreview(base64);
    } catch (error) {
      alert('Error al procesar la imagen');
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      imagen: ""
    });
    setImagePreview(null);
    // Limpiar el input file
    const fileInput = document.getElementById('imagen');
    if (fileInput) fileInput.value = '';
  };

  const validateDatos = () => {
    const validacion = perfilService.validarDatosPerfil(formData);
    setErrors(validacion.errores);
    return validacion.valido;
  };



  const handleSubmitDatos = async (e) => {
    e.preventDefault();
    
    if (!validateDatos()) return;

    try {
      setSaving(true);
      
      const dataToSend = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email, // Incluir email aunque no se modifique
        telefono: formData.telefono,
        direccion: formData.direccion,
        imagen: formData.imagen
      };

      const perfilActualizado = await perfilService.actualizarPerfil(user.idUsuario, dataToSend);

      // Actualizar datos del usuario en el contexto
      updateUser({
        nombres: perfilActualizado.nombres,
        apellidos: perfilActualizado.apellidos,
        imagen: perfilActualizado.imagen
      });

      alert("✅ Perfil actualizado correctamente");
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert(error.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <MainLayout>
        <div className="perfil-container">
          <div className="loading-spinner">Cargando perfil...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="perfil-container">
        <div className="perfil-header">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <div className="perfil-content">
          {/* Tabs */}
          <div className="perfil-tabs">
            <button 
              className={`tab-btn ${activeTab === 'datos' ? 'active' : ''}`}
              onClick={() => setActiveTab('datos')}
            >
              Datos Personales
            </button>
            <button 
              className={`tab-btn ${activeTab === 'imagen' ? 'active' : ''}`}
              onClick={() => setActiveTab('imagen')}
            >
              Foto de Perfil
            </button>
          </div>

          {/* Contenido de tabs */}
          <div className="tab-content">
            
            {/* Tab: Datos Personales */}
            {activeTab === 'datos' && (
              <form onSubmit={handleSubmitDatos} className="perfil-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="nombres">Nombres *</label>
                    <input
                      id="nombres"
                      name="nombres"
                      className="form-input"
                      value={formData.nombres}
                      onChange={handleChange}
                      required
                    />
                    {errors.nombres && <span className="error-text">{errors.nombres}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="apellidos">Apellidos *</label>
                    <input
                      id="apellidos"
                      name="apellidos"
                      className="form-input"
                      value={formData.apellidos}
                      onChange={handleChange}
                      required
                    />
                    {errors.apellidos && <span className="error-text">{errors.apellidos}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    disabled
                    title="El email no se puede modificar"
                  />
                  <small className="form-help">El email no se puede modificar por seguridad</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      name="telefono"
                      className="form-input"
                      value={formData.telefono}
                      onChange={handleChange}
                      maxLength="9"
                      placeholder="987654321"
                    />
                    {errors.telefono && <span className="error-text">{errors.telefono}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="direccion">Distrito</label>
                    <input
                      id="direccion"
                      name="direccion"
                      className="form-input"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Ej: Comas"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            )}

            {/* Tab: Imagen de Perfil */}
            {activeTab === 'imagen' && (
              <div className="imagen-section">
                <div className="imagen-preview-container">
                  <div className="imagen-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Vista previa" />
                    ) : (
                      <div className="no-image">
                        <span>Sin imagen</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="imagen-info">
                    <h3>Foto de Perfil</h3>
                    <p>Sube una imagen para personalizar tu perfil</p>
                    <ul className="imagen-requirements">
                      <li>Formatos: JPG, PNG, GIF, WebP</li>
                      <li>Tamaño máximo: 5MB</li>
                      <li>Recomendado: 400x400 píxeles</li>
                    </ul>
                  </div>
                </div>

                <div className="imagen-actions">
                  <input
                    type="file"
                    id="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById('imagen').click()}
                  >
                    Seleccionar Imagen
                  </button>
                  
                  {imagePreview && (
                    <button 
                      type="button"
                      className="btn-danger"
                      onClick={removeImage}
                    >
                      Quitar Imagen
                    </button>
                  )}
                </div>

                {formData.imagen && (
                  <form onSubmit={handleSubmitDatos} className="imagen-form">
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Guardando...' : 'Guardar Imagen'}
                    </button>
                  </form>
                )}
              </div>
            )}


          </div>
        </div>
      </div>
    </MainLayout>
  );
}