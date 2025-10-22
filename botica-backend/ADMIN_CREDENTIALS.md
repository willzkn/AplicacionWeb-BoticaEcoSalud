# Credenciales de Administrador

## Usuario Administrador por Defecto

El sistema incluye un usuario administrador creado automáticamente al iniciar la aplicación.

### Credenciales:
- **Email**: `admin@botica.com`
- **Contraseña**: `admin123`
- **Rol**: `admin`

### Acceso:
1. **Panel de Administración**: http://localhost:3001/admin
2. **Login**: http://localhost:3001/login

### Funcionalidades del Administrador:
- ✅ Gestión de categorías
- ✅ Gestión de productos
- ✅ Gestión de usuarios
- ✅ Gestión de pedidos
- ✅ Acceso a reportes
- ✅ Configuración del sistema

### Nota de Seguridad:
⚠️ **IMPORTANTE**: Cambia la contraseña por defecto en producción por seguridad.

### Cambiar Contraseña:
```bash
PUT /api/usuarios/1/password
{
  "nuevaPass": "nueva_contraseña_segura"
}
```

### Base de Datos:
El usuario se crea automáticamente desde `data.sql` al iniciar la aplicación.