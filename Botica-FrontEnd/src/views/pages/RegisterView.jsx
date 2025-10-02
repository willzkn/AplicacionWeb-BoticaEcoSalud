import { useState } from "react";
import axios from "axios";

export default function RegisterView() {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
    rol: "USER", // Puedes dejar un valor por defecto
    activo: true // Activar automáticamente al registrar
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
        rol: "USER",
        activo: true
      });
    } catch (error) {
      alert(error.response?.data || "Error al registrar usuario");
    }
  };

  return (
    <div>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <input name="nombres" placeholder="Nombres" value={formData.nombres} onChange={handleChange} required />
        <input name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Correo" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
        <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} />
        <input name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} />
        
        <label>
          Rol:
          <select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </label>

        <label>
          Activo:
          <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
        </label>

        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}
