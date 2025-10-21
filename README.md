# 📦 Proyecto Integrador - 🩺 Aplicacion-Web-Botica

Aplicación Web Botica es un sistema académico desarrollado como parte del Proyecto Integrador de la carrera de Ingeniería de Sistemas, orientado a la gestión automatizada de procesos de inventario, compras, ventas y reportes.
El objetivo principal es automatizar procesos de inventario, compras, ventas y reportes en la empresa EcoSalud, aplicando principios de programación estructurada y modelado de procesos BPMN.

---

## 🎯 Objetivos del Proyecto

- Desarrollar un sistema modular que automatice los procesos de inventario, compras, ventas y reportes.
- Aplicar principios de programación estructurada y modelado de procesos BPMN.
- Documentar el desarrollo técnico y académico con precisión y claridad.

---

## 🧠 Descripción General

Este proyecto busca optimizar la gestión interna de una empresa ficticia mediante la implementación de un sistema informático dividido en módulos funcionales. Cada módulo representa un proceso clave del negocio, modelado con BPMN y especificado en XML, siguiendo buenas prácticas de diseño y documentación.

---

## 🛠️ Tecnologías y Herramientas Utilizadas


- **Lenguajes:** Java, JavaScript
- **IDE:** VSCode
- **Documentación:** Markdown, GitHub
- **Planificación:** Gantt en Excel
- **Base de datos:** MySQL
- **Gestión de versiones:** Git y GitHub

---

## 🗂️ Estructura Modular del Sistema

El sistema se divide en los siguientes módulos:

- **Inventario:** Registro, actualización y consulta de productos.
- **Compras:** Gestión de proveedores y adquisiciones.
- **Ventas:** Registro de clientes y transacciones comerciales.
- **Reportes:** Generación de informes por módulo y exportación de datos.

Cada módulo está diseñado para ser independiente y reutilizable, respetando principios de encapsulamiento y separación de responsabilidades.

---

## 📋 Requerimientos Funcionales

| Código | Descripción                                                                 |
|--------|------------------------------------------------------------------------------|
| RF1    | El sistema permite al cliente registrarse y crear una cuenta de usuario.    |
| RF2    | El sistema permite iniciar sesión con credenciales válidas.                 |
| RF3    | El sistema muestra al cliente un catálogo digital de productos disponibles. |
| RF4    | El sistema valida en tiempo real la disponibilidad de productos en el inventario. |
| RF5    | El sistema permite agregar productos al carrito de compras.                 |
| RF6    | El sistema permite seleccionar métodos de pago disponibles.                 |
| RF7    | El sistema permite elegir el tipo de entrega: domicilio o recogida en tienda. |
| RF8    | El sistema genera un comprobante de pago electrónico (boleta o factura).    |
| RF9    | El sistema notifica al personal de la botica los pedidos confirmados para su preparación. |

---

## 🛡️ Requerimientos No Funcionales

| Código | Descripción                                                                 |
|--------|------------------------------------------------------------------------------|
| RNF1   | El sistema debe estar disponible de manera continua para los usuarios.      |
| RNF2   | El sistema debe realizar copias de seguridad automáticas para no perder información. |
| RNF3   | El sistema debe ser fácil de usar y comprensible para cualquier usuario.     |
| RNF4   | El sistema debe responder de forma rápida al realizar búsquedas o compras.   |
| RNF5   | El sistema debe permitir actualizaciones sin afectar el servicio.            |
| RNF6   | El sistema debe funcionar correctamente en distintos navegadores y celulares.|
| RNF7   | El sistema debe proteger la información de los usuarios con métodos de seguridad confiables. |
| RNF8   | El sistema debe poder crecer y atender a más usuarios sin problema.          |
| RNF9   | El sistema debe cumplir con las normas de privacidad y cuidado de datos personales. |
| RNF10  | El sistema debe contar con un diseño atractivo y ordenado que facilite la navegación. |

---

## ⚙️ Instalación y Ejecución
1. Clona este repositorio en tu máquina local: **https://github.com/SamantaCordova/Aplicacion-Web-Botica.git**
2. Crea la base de datos en MySQL usando el script incluido en la carpeta /db.
3. Configura el archivo de conexión a la base de datos en el proyecto (config o .env).
4. Ejecuta el proyecto en tu IDE (VSCode o IntelliJ IDEA).
5. Accede a la aplicación desde tu navegador en: http://localhost:8080

---

## 🔄 Pasos para Clonar un Repositorio desde GitHub

1. Ingresa a [GitHub.com](https://github.com) y accede con tu cuenta.
2. Dirígete al repositorio que deseas clonar.
3. Haz clic en el botón verde que dice **Code**.
4. Copia la URL que aparece en la opción **HTTPS**.
5. Abre tu terminal (puede ser Git Bash, CMD o cualquier consola).
6. Navega hasta la carpeta donde quieres guardar el repositorio.
7. Escribe el siguiente comando y pega la URL copiada:
   ```bash
   git clone https://github.com/usuario/repositorio.git
8. Presiona Enter y espera a que se descargue el repositorio.
9. Una vez finalizado, tendrás una copia local del proyecto lista para trabajar.

📺 Si necesitas ver cómo se hace paso a paso, puedes visualizar el siguiente video tutorial:
👉 Clonar un repositorio Git de GitHub 2024 - YouTube
https://www.youtube.com/watch?v=rAnn6vtLm90

---
📊 Diagramas  

**Diagrama de Procesos (BPMN)**  

<img width="626" height="422" alt="image" src="https://github.com/user-attachments/assets/990934bc-7f34-42aa-a5ef-571acc75eb92" />


**Diagrama Lógico de la Base de Datos**  

<img width="587" height="514" alt="image" src="https://github.com/user-attachments/assets/14abd7d6-4b51-4bb1-97bd-c0d488e7080f" />


---

## 📋 Responsabilidades del equipo

| Nombre |  Rol  | Funciones | 
|:-----|:--------:|:--------:|
| Samanta Córdova   | Full Stack | Gestionar todo el ciclo de vida del desarrollo.|
| Jennifer Paredes   | Backend|Crear y gestionar servicios backend para que se comunique de manera eficiente con el servidor.|
| Piero Ferrel   | Full Stack |Desarrollar tanto el frontend como el backend.|
| William Moreno   |  Frontend |Diseñar y desarrollar la interfaz de usuario.|
| Alexander Macalopu   | Full Stack |Crear herramientas administrativas para gestionar usuarios y contenido.|
| Eloy Guillen   |  Frontend |Diseñar y desarrollar la interfaz de usuario.|

---

## 📜 Licencia

Este proyecto se desarrolló con fines académicos. Puedes usar el código como referencia bajo licencia MIT.


