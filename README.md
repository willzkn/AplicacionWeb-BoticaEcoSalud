# 🏥 AplicacionWeb-BoticaEcoSalud

Sistema web completo para la gestión de una botica/farmacia, desarrollado con **React** (Frontend) y **Spring Boot** (Backend).

## 🚀 Características Principales

### 👥 **Para Clientes**
- ✅ Registro e inicio de sesión
- ✅ Catálogo de productos con filtros
- ✅ Carrito de compras funcional
- ✅ Sistema de pedidos
- ✅ Recuperación de contraseña
- ✅ Chatbot integrado
- ✅ Interfaz responsive

### 🔧 **Panel de Administrador**
- ✅ Dashboard completo
- ✅ Gestión de productos (CRUD)
- ✅ Gestión de categorías (CRUD)
- ✅ Gestión de usuarios (CRUD)
- ✅ Gestión de pedidos y estados
- ✅ Reportes y estadísticas

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de JavaScript
- **React Router** - Navegación
- **CSS3** - Estilos personalizados
- **Axios** - Cliente HTTP

### Backend
- **Spring Boot 3.5.5** - Framework de Java
- **Spring Security** - Autenticación y autorización
- **Spring Data JPA** - Persistencia de datos
- **MySQL** - Base de datos
- **Maven** - Gestión de dependencias
- **MailerSend** - Envío de emails
- **Logback** - Sistema de logs

## 📁 Estructura del Proyecto

```
AplicacionWeb-BoticaEcoSalud/
├── Botica-FrontEnd/          # Aplicación React
│   ├── public/               # Archivos estáticos
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── models/          # Modelos de datos
│   │   ├── styles/          # Archivos CSS
│   │   └── views/           # Páginas y layouts
│   └── package.json
├── botica-backend/          # API Spring Boot
│   ├── src/main/java/       # Código fuente Java
│   │   └── com/botica/botica_backend/
│   │       ├── Controller/  # Controladores REST
│   │       ├── Service/     # Servicios de negocio
│   │       ├── Repository/  # Repositorios JPA
│   │       ├── Model/       # Entidades JPA
│   │       └── Config/      # Configuraciones
│   └── pom.xml
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (v16 o superior)
- **Java 17** o superior
- **MySQL 8.0** o superior
- **Maven 3.6** o superior

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/AplicacionWeb-BoticaEcoSalud.git
cd AplicacionWeb-BoticaEcoSalud
```

### 2. Configurar la Base de Datos
```sql
CREATE DATABASE botica;
-- Las tablas se crearán automáticamente con JPA
```

### 3. Configurar el Backend
```bash
cd botica-backend
# Editar src/main/resources/application.properties
# Configurar credenciales de MySQL y MailerSend
mvn spring-boot:run
```

### 4. Configurar el Frontend
```bash
cd Botica-FrontEnd
npm install
npm start
```

## 🔧 Configuración de Base de Datos

Actualiza el archivo `botica-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/botica?useSSL=false&serverTimezone=UTC
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_PASSWORD
spring.jpa.hibernate.ddl-auto=update

# Configuración de MailerSend
mailersend.api.token=TU_TOKEN_MAILERSEND
mailersend.from.email=TU_EMAIL
mailersend.from.name=EcoSalud Botica
```

## 👨‍💼 Acceso al Panel de Administrador

### Crear Usuario Administrador
```bash
curl -X POST http://localhost:8080/api/usuarios/create-admin
```

### Credenciales por Defecto
- **Email:** admin@botica.com
- **Contraseña:** admin123

### Acceder al Panel
Una vez autenticado, visita: `http://localhost:3000/admin`

## 📱 Funcionalidades Detalladas

### Sistema de Autenticación
- Registro de usuarios con validaciones
- Inicio de sesión seguro con JWT
- Recuperación de contraseña por email
- Roles de usuario (cliente/administrador)

### Gestión de Productos
- Catálogo con búsqueda y filtros
- Gestión de stock en tiempo real
- Categorización de productos
- Imágenes de productos

### Sistema de Pedidos
- Carrito de compras persistente
- Proceso de checkout completo
- Estados de pedidos
- Notificaciones por email

### Panel de Administrador
- Dashboard con estadísticas
- CRUD completo para todas las entidades
- Gestión de estados de pedidos
- Reportes y análisis

## 🔒 Seguridad

- Autenticación basada en JWT
- Validación de datos en frontend y backend
- Protección de rutas sensibles
- Encriptación de contraseñas
- Validación de roles y permisos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo de Desarrollo

- **William** - Desarrollador Full Stack
- **Piero** - Desarrollador Frontend
- **Alexander** - Desarrollador Frontend
- **Samanta** - Project Manager

## 📞 Contacto

Para preguntas o soporte, contacta a: [tu-email@ejemplo.com]

---

⭐ **¡No olvides dar una estrella al proyecto si te ha sido útil!** ⭐