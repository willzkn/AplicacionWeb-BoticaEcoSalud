# 📋 Instrucciones para subir a GitHub

## 🚀 Pasos para crear el repositorio en GitHub

### 1. Crear el repositorio en GitHub
1. Ve a [GitHub.com](https://github.com)
2. Haz clic en el botón **"New"** o **"+"** → **"New repository"**
3. Configura el repositorio:
   - **Repository name:** `AplicacionWeb-BoticaEcoSalud`
   - **Description:** `Sistema web completo para gestión de botica/farmacia con React y Spring Boot`
   - **Visibility:** Public (o Private si prefieres)
   - **NO** marques "Add a README file" (ya tenemos uno)
   - **NO** marques "Add .gitignore" (ya tenemos uno)
   - **NO** marques "Choose a license" (ya tenemos uno)

### 2. Conectar el repositorio local con GitHub
Una vez creado el repositorio en GitHub, ejecuta estos comandos en la terminal:

```bash
# Agregar el remote origin (reemplaza TU_USUARIO con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/AplicacionWeb-BoticaEcoSalud.git

# Cambiar el nombre de la rama principal a main (opcional, GitHub usa main por defecto)
git branch -M main

# Subir el código al repositorio
git push -u origin main

# También subir la rama develop
git checkout develop
git push -u origin develop
```

### 3. Configurar la rama por defecto
En GitHub, ve a:
1. **Settings** del repositorio
2. **Branches** en el menú lateral
3. Cambiar la rama por defecto a `develop` si quieres que sea la rama principal de desarrollo

## 🔧 Comandos Git útiles para el proyecto

```bash
# Ver el estado del repositorio
git status

# Ver las ramas
git branch -a

# Cambiar de rama
git checkout develop
git checkout main

# Crear una nueva rama para una feature
git checkout -b feature/nueva-funcionalidad

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios
git push origin nombre-de-la-rama

# Actualizar desde el repositorio remoto
git pull origin develop
```

## 📁 Estructura del Proyecto Subido

```
AplicacionWeb-BoticaEcoSalud/
├── 📁 Botica-FrontEnd/          # Frontend React
├── 📁 botica-backend/           # Backend Spring Boot
├── 📄 README.md                 # Documentación principal
├── 📄 .gitignore               # Archivos ignorados por Git
├── 📄 LICENSE                  # Licencia MIT
├── 📄 PANEL_ADMIN_SETUP.md     # Guía del panel de administrador
└── 📄 GITHUB_SETUP.md          # Este archivo
```

## ✅ Verificación

Después de subir el repositorio, verifica que:
- [ ] Todos los archivos estén presentes
- [ ] El README.md se muestre correctamente
- [ ] Las ramas `main` y `develop` estén creadas
- [ ] El .gitignore esté funcionando (no debe haber archivos node_modules, target/, etc.)

## 🎯 Próximos Pasos

1. **Configurar GitHub Pages** (opcional) para documentación
2. **Configurar Actions** para CI/CD (opcional)
3. **Invitar colaboradores** si es un proyecto en equipo
4. **Crear Issues** para trackear tareas pendientes
5. **Configurar Projects** para gestión de proyecto

---

¡Tu repositorio `AplicacionWeb-BoticaEcoSalud` está listo para ser subido a GitHub! 🚀