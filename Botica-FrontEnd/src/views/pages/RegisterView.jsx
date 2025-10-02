 import { useState } from "react";
 import axios from "axios";
 import MainLayout from "../layouts/MainLayout";
 import "../../styles/ecosalud.css";

 export default function RegisterView() {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
    rol: "", 
    activo: true 
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:8080/api/usuarios/register", formData);
    alert("Usuario registrado correctamente!");
    setFormData({
      nombres: "",
      apellidos: "",
      email: "",
      password: "",
      telefono: "",
      direccion: "",
      rol: "",
      activo: true
    });
  } catch (error) {
    // Ahora recibirá 400 con el mensaje específico en lugar de 403
    const errorMessage = error.response?.data || "Error al registrar usuario";
    alert(errorMessage);
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
                 placeholder="Nombres"
                 value={formData.nombres}
                 onChange={handleChange}
                 required
               />
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="apellidos">Apellidos</label>
               <input
                 id="apellidos"
                 name="apellidos"
                 className="form-input"
                 placeholder="Apellidos"
                 value={formData.apellidos}
                 onChange={handleChange}
                 required
               />
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="email">Correo electrónico</label>
               <input
                 id="email"
                 name="email"
                 type="email"
                 className="form-input"
                 placeholder="Correo"
                 value={formData.email}
                 onChange={handleChange}
                 required
               />
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="password">Contraseña</label>
               <input
                 id="password"
                 name="password"
                 type="password"
                 className="form-input"
                 placeholder="Contraseña"
                 value={formData.password}
                 onChange={handleChange}
                 required
               />
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="telefono">Teléfono</label>
               <input
                 id="telefono"
                 name="telefono"
                 className="form-input"
                 placeholder="Teléfono (opcional)"
                 value={formData.telefono}
                 onChange={handleChange}
               />
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="direccion">Dirección</label>
               <input
                 id="direccion"
                 name="direccion"
                 className="form-input"
                 placeholder="Dirección (opcional)"
                 value={formData.direccion}
                 onChange={handleChange}
               />
             </div>

             <div className="form-group">
               <label className="form-label" htmlFor="rol">Rol</label>
               <select id="rol" name="rol" className="form-input" value={formData.rol} onChange={handleChange}>
                 <option value="cliente">Cliente</option>
                 <option value="admin">Administrador</option>
               </select>
             </div>

             <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <input type="checkbox" id="activo" name="activo" checked={formData.activo} onChange={handleChange} />
               <label className="form-label" htmlFor="activo" style={{ margin: 0 }}>Activo</label>
             </div>

             <button type="submit" className="login-button">Registrarse</button>
           </form>
         </div>
       </div>
     </MainLayout>
   );
}
