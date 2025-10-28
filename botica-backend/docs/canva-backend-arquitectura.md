# Canva Slide Deck: Backend Botica EcoSalud

## 1. Arquitectura MVC + Principios SOLID
- **Controladores REST** (`src/main/java/com/botica/botica_backend/Controller/ProductoController.java`)
  - Gestionan peticiones HTTP y delegan lógica a servicios.
- **Servicios de negocio** (`src/main/java/com/botica/botica_backend/Service/ProductoService.java`, `PedidoService.java`, `UsuarioService.java`)
  - Encapsulan reglas y validaciones, manteniendo la responsabilidad única (S de SOLID).
- **Repositorios (DAO con Spring Data JPA)** (`src/main/java/com/botica/botica_backend/Repository/*.java`)
  - Separan las operaciones de persistencia; cumplen el principio de inversión de dependencias al ser inyectados.
- **Mensaje clave para la lámina**: mostrar un diagrama sencillo MVC resaltando cómo SOLID mantiene responsabilidades claras.

## 2. Enfoque de Pruebas y TDD
- **Dependencias configuradas** (`pom.xml` → `spring-boot-starter-test`, `junit-jupiter`, `mockito`).
- **Prueba destacada** (`src/test/java/com/botica/botica_backend/Util/ExcelUtilPoiTest.java`)
  - Valida generación de Excel y casos límite.
- **Recomendación para Canva**: la base está lista para TDD; solo falta ampliar cobertura por módulo.

## 3. Apache Commons
- **Dependencias** (`pom.xml` → `commons-lang3`, `commons-io`, `commons-collections4`).
- **Ejemplo práctico** (`src/main/java/com/botica/botica_backend/Util/FileUtilGuavaCommons.java`)
  - Uso de `FileUtils`, `FilenameUtils` para manipular archivos, reduciendo código repetido.
- **Mensaje para lámina**: destacar reusabilidad y rapidez en tareas comunes.

## 4. Apache POI
- **Dependencias** (`pom.xml` → `poi`, `poi-ooxml`).
- **Generación de reportes** (`src/main/java/com/botica/botica_backend/Util/ExcelUtilPoi.java`).
- **Salida aplicada** (`src/main/java/com/botica/botica_backend/Service/ReportService.java`).
- **Mensaje**: evidencia capacidad de exportar inventarios a Excel para gestión operativa.

## 5. Google Guava
- **Dependencia** (`pom.xml` → `com.google.guava:guava`).
- **Uso en servicios** (`src/main/java/com/botica/botica_backend/Service/ReportService.java`)
  - Cache de reportes (`CacheBuilder`) y colecciones (`Maps`).
- **Utilidades de cadenas** (`src/main/java/com/botica/botica_backend/Util/StringUtilGuavaCommons.java`).
- **Mensaje**: mejora desempeño y ofrece utilidades avanzadas sin reinventar la rueda.

## 6. Logback y Observabilidad
- **Configuración central** (`src/main/resources/logback.xml`).
  - Appenders dedicados (consola, errores, operaciones de negocio, login).
- **Uso en código** (`src/main/java/com/botica/botica_backend/Controller/ProductoController.java`).
  - Empleo de `LoggerFactory` para trazas de auditoría.
- **Mensaje**: monitoreo activo, trazabilidad y diagnósticos rápidos.

## 7. Estructura Sugerida de Diapositivas (Canva)
1. **Portada**: Backend Botica EcoSalud.
2. **Arquitectura MVC + SOLID**: diagrama + rutas clave.
3. **Pruebas (TDD)**: dependencias y ejemplo de test.
4. **Librerías Destacadas**: Apache Commons, POI, Guava (con ejemplos y beneficios).
5. **Observabilidad**: configuración Logback y logging en servicios.
6. **Próximos pasos**: ampliar TDD, monitoreo y métricas.

> **Nota**: Cada punto incluye la ruta exacta en el repositorio para facilitar la inclusión de capturas o snippets en la presentación Canva.
