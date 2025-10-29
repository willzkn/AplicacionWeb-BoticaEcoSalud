# Arquitecturas de Librerías en Botica Backend

Este documento describe las arquitecturas de librerías seleccionadas para el proyecto Botica Backend y sus casos de uso actuales.

## Arquitecturas Implementadas

### 1. Logback (Arquitectura de Logging)

**Versión:** 1.4.11  
**Propósito:** Sistema de logging avanzado para el registro de eventos y depuración de la aplicación.

#### Para qué se usa actualmente:
- **Monitoreo de aplicación:** Registro de todas las operaciones críticas del sistema
- **Auditoría de seguridad:** Seguimiento de eventos de autenticación y acceso
- **Depuración de errores:** Identificación y análisis de problemas en producción
- **Análisis de rendimiento:** Medición de tiempos de respuesta y carga del sistema
- **Cumplimiento normativo:** Mantenimiento de registros para auditorías regulatorias

#### Casos de uso específicos en Botica:
- Registro de transacciones de venta
- Seguimiento de cambios en inventario
- Monitoreo de accesos de usuarios
- Alertas de stock bajo
- Registro de errores de integración con proveedores

**Archivo principal:** `botica-backend/src/main/resources/logback.xml`

### 2. Google Guava (Arquitectura de Utilidades)

**Versión:** 32.1.3-jre  
**Propósito:** Librería de utilidades de Google que proporciona colecciones, strings, I/O y más funcionalidades.

#### Para qué se usa actualmente:
- **Validación de datos:** Verificación de integridad en formularios y APIs
- **Procesamiento de texto:** Normalización de nombres de productos y categorías
- **Manejo de colecciones:** Optimización de operaciones con listas grandes de productos
- **Cache en memoria:** Almacenamiento temporal de consultas frecuentes
- **Utilidades de archivos:** Procesamiento de uploads y descargas

#### Casos de uso específicos en Botica:
- Validación de códigos de barras
- Normalización de nombres de medicamentos
- Partición de listas para paginación
- Cache de categorías y proveedores
- Validación de formatos de archivos

**Clases relacionadas:**
- `botica-backend/src/main/java/com/botica/botica_backend/Util/StringUtilGuavaCommons.java`
- `botica-backend/src/main/java/com/botica/botica_backend/Util/FileUtilGuavaCommons.java`

### 3. Apache POI (Arquitectura de Documentos Office)

**Versión:** 5.2.4  
**Propósito:** Librería para crear y manipular documentos de Microsoft Office (Excel, Word, PowerPoint).

#### Para qué se usa actualmente:
- **Reportes de inventario:** Generación de informes detallados en Excel
- **Exportación de datos:** Descarga masiva de información para análisis
- **Importación de catálogos:** Carga de productos desde archivos Excel de proveedores
- **Reportes financieros:** Generación de estados de cuenta y balances
- **Documentación automática:** Creación de facturas y comprobantes

#### Casos de uso específicos en Botica:
- Reporte mensual de ventas por producto
- Exportación de inventario para auditorías
- Importación de precios de proveedores
- Generación de listas de compras
- Reportes de productos próximos a vencer

**Clase relacionada:** `botica-backend/src/main/java/com/botica/botica_backend/Util/ExcelUtilPoi.java`

### 4. Apache Commons (Arquitectura de Utilidades Comunes)

**Versión:** Lang3 3.13.0, IO 2.11.0, Collections4 4.4  
**Propósito:** Conjunto de librerías de utilidades comunes para Java.

#### Para qué se usa actualmente:
- **Manipulación de strings:** Procesamiento de datos de entrada y salida
- **Operaciones de archivos:** Gestión de uploads, backups y logs
- **Validaciones comunes:** Verificación de formatos y tipos de datos
- **Utilidades de colecciones:** Operaciones avanzadas con listas y mapas
- **Formateo de datos:** Presentación consistente de información

#### Casos de uso específicos en Botica:
- Validación de RUC y DNI de clientes
- Formateo de precios y monedas
- Normalización de direcciones
- Procesamiento de archivos de backup
- Validación de emails de proveedores

**Clases relacionadas:**
- `botica-backend/src/main/java/com/botica/botica_backend/Util/StringUtilGuavaCommons.java`
- `botica-backend/src/main/java/com/botica/botica_backend/Util/FileUtilGuavaCommons.java`

## Beneficios de las Arquitecturas

### Logback (Arquitectura de Logging)
- **Rendimiento:** Más rápido que Log4j, optimizado para aplicaciones de alta concurrencia
- **Flexibilidad:** Configuración XML potente que permite personalización completa
- **Mantenimiento:** Rotación automática de logs y gestión de espacio en disco
- **Depuración:** Logs separados por funcionalidad para análisis específicos
- **Escalabilidad:** Soporte para aplicaciones distribuidas y microservicios

### Guava (Arquitectura de Utilidades)
- **Productividad:** Reduce código boilerplate y acelera el desarrollo
- **Confiabilidad:** Ampliamente probado por Google en aplicaciones de gran escala
- **Rendimiento:** Implementaciones optimizadas para operaciones comunes
- **Funcionalidad:** Utilidades que no están en Java estándar pero son esenciales
- **Consistencia:** API uniforme y predecible en todas sus utilidades

### Apache POI (Arquitectura de Documentos Office)
- **Compatibilidad:** Soporte completo para formatos Office modernos y legacy
- **Flexibilidad:** Control total sobre el formato y estructura de documentos
- **Integración:** Fácil integración con Spring Boot y frameworks Java
- **Funcionalidad:** Desde simples tablas hasta gráficos y macros complejos
- **Estabilidad:** Librería madura con amplio soporte de la comunidad

### Apache Commons (Arquitectura de Utilidades Comunes)
- **Estabilidad:** Librerías maduras y estables, probadas en millones de aplicaciones
- **Completitud:** Cubre casos de uso comunes que todo desarrollador necesita
- **Documentación:** Excelente documentación y ejemplos prácticos
- **Comunidad:** Gran comunidad de usuarios y contribuidores activos
- **Modularidad:** Permite usar solo las partes necesarias sin dependencias innecesarias

## Configuración en pom.xml

Las dependencias están configuradas en el archivo `pom.xml`:

```xml
<!-- Logback -->
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.4.11</version>
</dependency>

<!-- Apache Commons -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.13.0</version>
</dependency>

<!-- Apache POI -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.4</version>
</dependency>

<!-- Google Guava -->
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>32.1.3-jre</version>
</dependency>
```

## Próximos Pasos

1. **Expandir arquitectura de logging:** Integración con sistemas de monitoreo y alertas
2. **Optimizar arquitectura de utilidades:** Implementar cache distribuido con Guava
3. **Mejorar arquitectura de documentos:** Plantillas dinámicas y reportes automatizados
4. **Fortalecer arquitectura de utilidades comunes:** Validaciones personalizadas y formateo avanzado

---

**Fecha de creación:** 25 de octubre de 2024  
**Versión del documento:** 1.0  
**Autor:** Sistema Botica Backend
## Arch
ivos de Utilidades por Arquitectura

### Logback (Arquitectura de Logging)
- **LoggingUtilLogback.java** - Utilidades para logging con diferentes niveles y contextos

### Apache POI (Arquitectura de Documentos Office)
- **ExcelUtilPoi.java** - Generación y manipulación de archivos Excel

### Google Guava + Apache Commons (Arquitectura de Utilidades)
- **StringUtilGuavaCommons.java** - Utilidades para manipulación de strings
- **FileUtilGuavaCommons.java** - Utilidades para manejo de archivos

### Configuración de Logback
- **logback.xml** - Configuración principal del sistema de logging