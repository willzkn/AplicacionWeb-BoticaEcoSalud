 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import axios from "axios";
 import MainLayout from "../layouts/MainLayout";
 import "../../styles/ecosalud.css";

 export default function RegisterView() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: ""
    // rol y activo se setean en el backend por seguridad
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    // Validaciones en tiempo real
    if (name === "nombres" || name === "apellidos") {
      // Solo letras y espacios
      newValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    } else if (name === "telefono") {
      // Solo números
      newValue = value.replace(/[^0-9]/g, "");
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : newValue
    });

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = "El nombre es obligatorio";
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios";
    }
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (formData.telefono && formData.telefono.length < 9) {
      newErrors.telefono = "El teléfono debe tener al menos 9 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // No enviar confirmPassword al backend
      const { confirmPassword, ...dataToSend } = formData;
      const res = await axios.post("http://localhost:8080/api/usuarios/register", dataToSend);
      alert("✅ Usuario registrado correctamente! Ahora puedes iniciar sesión.");
      // Redirigir al login
      navigate('/login');
    } catch (error) {
      alert(error.response?.data || "Error al registrar usuario");
    }
  };

   return (
     <MainLayout
       searchTerm=""
       onSearchChange={() => {}}
       onSearchKeyPress={() => {}}
     >
       <div className="login-container liquid-glass">
         <div className="blob blob-1" aria-hidden="true" />
         <div className="blob blob-2" aria-hidden="true" />

         <div className="login-content">
           <h2 className="login-title">Crear cuenta</h2>
           <form onSubmit={handleSubmit}>
             <div className="form-group">
               <label className="form-label" htmlFor="nombres">Nombres</label>
               <input
                 id="nombres"
                 name="nombres"
                 className="form-input"
                 placeholder="Ej: Juan Carlos"
                 value={formData.nombres}
                 onChange={handleChange}
                 required
               />
               {errors.nombres && <span style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{errors.nombres}</span>}
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="apellidos">Apellidos</label>
               <input
                 id="apellidos"
                 name="apellidos"
                 className="form-input"
                 placeholder="Ej: García López"
                 value={formData.apellidos}
                 onChange={handleChange}
                 required
               />
               {errors.apellidos && <span style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{errors.apellidos}</span>}
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="email">Correo electrónico</label>
               <input
                 id="email"
                 name="email"
                 type="email"
                 className="form-input"
                 placeholder="Ej: juan.garcia@correo.com"
                 value={formData.email}
                 onChange={handleChange}
                 required
               />
               {errors.email && <span style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{errors.email}</span>}
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="password">Contraseña</label>
               <input
                 id="password"
                 name="password"
                 type="password"
                 className="form-input"
                 placeholder="Ej: MiContraseña123"
                 value={formData.password}
                 onChange={handleChange}
                 required
               />
               {errors.password && <span style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{errors.password}</span>}
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="confirmPassword">Confirmar contraseña</label>
               <input
                 id="confirmPassword"
                 name="confirmPassword"
                 type="password"
                 className="form-input"
                 placeholder="Repite la misma contraseña"
                 value={formData.confirmPassword}
                 onChange={handleChange}
                 required
               />
               {errors.confirmPassword && <span style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{errors.confirmPassword}</span>}
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="telefono">Teléfono</label>
               <input
                 id="telefono"
                 name="telefono"
                 className="form-input"
                 placeholder="Ej: 987654321"
                 value={formData.telefono}
                 onChange={handleChange}
                 maxLength="9"
               />
               {errors.telefono && <span style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>{errors.telefono}</span>}
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="direccion"> Distrito </label>
               <input
                 id="direccion"
                 name="direccion"
                 className="form-input"
                 placeholder="Ej: Comas"
                 value={formData.direccion}
                 onChange={handleChange}
               />
             </div>

             <button type="submit" className="login-button">Registrarse</button>
           </form>
         </div>
       </div>
     </MainLayout>
   );
}
