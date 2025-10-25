# Guía de Testing con JUnit 5 y Mockito

Este documento explica cómo realizar testing en el proyecto Botica Backend usando JUnit 5 y Mockito.

## Arquitecturas de Testing Implementadas

### 1. JUnit 5 (Arquitectura de Testing Unitario)

**Versión:** 5.10.0  
**Propósito:** Framework principal para escribir y ejecutar tests unitarios en Java.

#### Para qué se usa actualmente:
- **Tests unitarios:** Verificación de lógica de negocio en métodos individuales
- **Tests de integración:** Validación de componentes trabajando juntos
- **Assertions avanzadas:** Verificaciones complejas con mensajes descriptivos
- **Parametrización:** Tests con múltiples conjuntos de datos
- **Lifecycle management:** Control del ciclo de vida de los tests

#### Casos de uso específicos en Botica:
- Validación de utilidades de string y archivos
- Tests de lógica de cálculo de precios
- Verificación de validaciones de datos
- Tests de transformación de datos
- Validación de reglas de negocio

### 2. Mockito (Arquitectura de Mocking)

**Versión:** 5.5.0  
**Propósito:** Framework para crear objetos mock y verificar interacciones en tests.

#### Para qué se usa actualmente:
- **Mocking de dependencias:** Simulación de servicios y repositorios
- **Verificación de interacciones:** Confirmación de llamadas a métodos
- **Stubbing:** Definición de comportamientos esperados
- **Argument matching:** Verificación de parámetros pasados
- **Spy objects:** Objetos parcialmente mockeados

#### Casos de uso específicos en Botica:
- Mock de repositorios JPA para tests de servicios
- Simulación de APIs externas
- Tests de controladores sin base de datos
- Verificación de logs y auditoría
- Tests de integración con servicios externos

## Estructura de Tests

```
src/test/java/
├── com/botica/botica_backend/
│   ├── Controller/          # Tests de controladores (MockMvc)
│   ├── Service/            # Tests de servicios (Mockito)
│   ├── Util/               # Tests de utilidades (JUnit puro)
│   ├── Repository/         # Tests de repositorios (@DataJpaTest)
│   └── Integration/        # Tests de integración (@SpringBootTest)
```

## Tipos de Tests Implementados

### 1. Tests de Utilidades (JUnit Puro)

**Archivo:** `StringUtilGuavaCommonsTest.java`

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("StringUtilGuavaCommons Tests")
class StringUtilGuavaCommonsTest {
    
    @Test
    @DisplayName("Debe validar correctamente si un string no está vacío")
    void testIsNotEmpty() {
        // Given - Arrange
        StringUtilGuavaCommons stringUtil = new StringUtilGuavaCommons();
        String textoValido = "Paracetamol";
        
        // When - Act
        boolean resultado = stringUtil.isNotEmpty(textoValido);
        
        // Then - Assert
        assertTrue(resultado);
    }
}
```

**Características:**
- No requiere Spring Context
- Tests rápidos y aislados
- Verificación de lógica pura
- Uso de assertions de JUnit 5

### 2. Tests de Servicios (Mockito)

**Archivo:** `ProductoServiceTest.java`

```java
@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {
    
    @Mock
    private ProductoRepository productoRepository;
    
    @InjectMocks
    private ProductoService productoService;
    
    @Test
    void testObtenerTodosLosProductos() {
        // Given
        List<Producto> productos = Arrays.asList(productoEjemplo);
        when(productoRepository.findAll()).thenReturn(productos);
        
        // When
        List<Producto> resultado = productoService.obtenerTodosLosProductos();
        
        // Then
        assertEquals(1, resultado.size());
        verify(productoRepository, times(1)).findAll();
    }
}
```

**Características:**
- Mock de dependencias externas
- Verificación de interacciones
- Tests aislados de la base de datos
- Stubbing de comportamientos

### 3. Tests de Controladores (MockMvc)

**Archivo:** `ProductoControllerTest.java`

```java
@WebMvcTest(ProductoController.class)
class ProductoControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private ProductoService productoService;
    
    @Test
    @WithMockUser
    void testObtenerTodosLosProductos() throws Exception {
        // Given
        when(productoService.obtenerTodosLosProductos()).thenReturn(productos);
        
        // When & Then
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
```

**Características:**
- Tests de endpoints HTTP
- Verificación de respuestas JSON
- Mock de seguridad
- Validación de status codes

### 4. Tests de Utilidades POI (JUnit + Verificación de Archivos)

**Archivo:** `ExcelUtilPoiTest.java`

```java
@Test
void testGenerateProductsExcel() throws IOException {
    // When
    byte[] excelBytes = excelUtil.generateProductsExcel(productos);
    
    // Then
    try (ByteArrayInputStream bis = new ByteArrayInputStream(excelBytes);
         Workbook workbook = new XSSFWorkbook(bis)) {
        
        Sheet sheet = workbook.getSheetAt(0);
        assertEquals("Productos", sheet.getSheetName());
    }
}
```

**Características:**
- Verificación de archivos generados
- Tests de Apache POI
- Validación de estructura Excel
- Manejo de recursos

## Comandos para Ejecutar Tests

### 1. Ejecutar todos los tests
```bash
mvn test
```
**¿Qué hace?**
- Compila el código fuente y los tests
- Ejecuta todos los archivos que terminen en `Test.java` o `Tests.java`
- Genera reportes en `target/surefire-reports/`
- Muestra resumen de tests ejecutados, pasados y fallidos

**Cuándo usarlo:** Para verificar que todo el proyecto funciona correctamente antes de hacer commit.

### 2. Ejecutar tests específicos por clase
```bash
mvn test -Dtest=StringUtilGuavaCommonsTest
```
**¿Qué hace?**
- Ejecuta únicamente los tests de la clase especificada
- Ignora todos los demás archivos de test
- Útil para desarrollo iterativo de una funcionalidad específica

**Cuándo usarlo:** Cuando estás trabajando en una clase específica y quieres probar solo esa funcionalidad.

### 3. Ejecutar tests específicos por método
```bash
mvn test -Dtest=ProductoServiceTest#testObtenerTodosLosProductos
```
**¿Qué hace?**
- Ejecuta solo el método de test especificado dentro de la clase
- Formato: `ClaseTest#nombreDelMetodo`
- Permite testing muy granular

**Cuándo usarlo:** Para debuggear un test específico que está fallando o para desarrollo TDD.

### 4. Ejecutar múltiples clases de test
```bash
mvn test -Dtest=ProductoServiceTest,UsuarioServiceTest
```
**¿Qué hace?**
- Ejecuta las clases de test especificadas separadas por comas
- Permite agrupar tests relacionados

**Cuándo usarlo:** Para probar un módulo específico que involucra varias clases.

### 5. Ejecutar tests con patrones
```bash
mvn test -Dtest=*ServiceTest
```
**¿Qué hace?**
- Ejecuta todos los tests que coincidan con el patrón (usando wildcards)
- `*ServiceTest` ejecutará todos los tests de servicios
- `*ControllerTest` ejecutará todos los tests de controladores

**Cuándo usarlo:** Para probar una capa específica de la aplicación (servicios, controladores, etc.).

### 6. Ejecutar tests con reporte de cobertura
```bash
mvn test jacoco:report
```
**¿Qué hace?**
- Ejecuta todos los tests
- Genera reporte de cobertura de código con JaCoCo
- Crea archivos HTML en `target/site/jacoco/`
- Muestra qué líneas de código fueron ejecutadas durante los tests

**Cuándo usarlo:** Para verificar qué porcentaje del código está cubierto por tests y identificar áreas sin testing.

### 7. Ejecutar solo tests unitarios (excluyendo integración)
```bash
mvn test -Dtest=!*IntegrationTest
```
**¿Qué hace?**
- Ejecuta todos los tests EXCEPTO los que terminen en `IntegrationTest`
- El símbolo `!` significa "excluir"
- Tests unitarios son más rápidos que los de integración

**Cuándo usarlo:** Para feedback rápido durante desarrollo, ya que los tests unitarios son más veloces.

### 8. Ejecutar solo tests de integración
```bash
mvn test -Dtest=*IntegrationTest
```
**¿Qué hace?**
- Ejecuta únicamente los tests de integración
- Estos tests suelen ser más lentos pero prueban el sistema completo

**Cuándo usarlo:** Antes de hacer deploy o cuando quieres verificar que los componentes funcionan juntos.

### 9. Ejecutar tests en modo verbose (detallado)
```bash
mvn test -Dtest.verbose=true
```
**¿Qué hace?**
- Muestra información detallada de cada test ejecutado
- Incluye tiempo de ejecución por test
- Útil para identificar tests lentos

**Cuándo usarlo:** Para debuggear problemas de performance en tests o para análisis detallado.

### 10. Ejecutar tests sin compilar el código principal
```bash
mvn test-compile surefire:test
```
**¿Qué hace?**
- Compila solo los tests (no el código principal)
- Ejecuta los tests usando las clases ya compiladas
- Útil cuando hay errores de compilación en el código principal pero los tests están bien

**Cuándo usarlo:** Cuando el código principal tiene errores pero quieres verificar que los tests están bien escritos.

### 11. Ejecutar tests con perfil específico
```bash
mvn test -Ptest-only
```
**¿Qué hace?**
- Activa el perfil Maven `test-only` definido en el pom.xml
- Puede tener configuraciones específicas para testing
- En nuestro caso, excluye servicios y controladores de la compilación

**Cuándo usarlo:** Cuando tienes problemas de compilación y quieres ejecutar solo tests básicos.

### 12. Limpiar y ejecutar tests
```bash
mvn clean test
```
**¿Qué hace?**
- Borra la carpeta `target/` (limpia compilaciones anteriores)
- Recompila todo desde cero
- Ejecuta todos los tests

**Cuándo usarlo:** Cuando sospechas que hay problemas de cache o compilaciones corruptas.

### 13. Ejecutar tests con configuración de memoria
```bash
mvn test -Dmaven.surefire.debug="-Xmx1024m -XX:MaxPermSize=256m"
```
**¿Qué hace?**
- Configura la memoria disponible para los tests
- Útil para tests que requieren mucha memoria (como procesamiento de archivos grandes)

**Cuándo usarlo:** Cuando los tests fallan por OutOfMemoryError.

### 14. Ejecutar tests en paralelo
```bash
mvn test -Dparallel=methods -DthreadCount=4
```
**¿Qué hace?**
- Ejecuta los tests en paralelo usando múltiples hilos
- Reduce el tiempo total de ejecución
- Requiere que los tests sean independientes entre sí

**Cuándo usarlo:** Para acelerar la ejecución cuando tienes muchos tests independientes.

### 15. Ejecutar tests con propiedades específicas
```bash
mvn test -Dspring.profiles.active=test -Dlogging.level.com.botica=DEBUG
```
**¿Qué hace?**
- Pasa propiedades específicas a los tests
- Activa perfil de Spring para testing
- Configura nivel de logging para debugging

**Cuándo usarlo:** Para configurar el entorno de testing con parámetros específicos.

### 16. Generar reporte de tests sin ejecutarlos
```bash
mvn surefire-report:report-only
```
**¿Qué hace?**
- Genera reportes HTML basados en ejecuciones anteriores
- No ejecuta los tests nuevamente
- Crea reportes en `target/site/`

**Cuándo usarlo:** Para generar reportes visuales después de haber ejecutado los tests.

### 17. Ejecutar tests con timeout
```bash
mvn test -Dsurefire.timeout=300
```
**¿Qué hace?**
- Establece un timeout de 300 segundos para cada test
- Mata tests que se cuelguen o tomen demasiado tiempo

**Cuándo usarlo:** Para evitar que tests problemáticos bloqueen el pipeline de CI/CD.

### 18. Ejecutar tests ignorando fallos
```bash
mvn test -Dmaven.test.failure.ignore=true
```
**¿Qué hace?**
- Continúa la ejecución aunque algunos tests fallen
- Útil para obtener un reporte completo de todos los tests

**Cuándo usarlo:** Para análisis completo de la suite de tests, incluso si algunos fallan.

### 19. Ejecutar solo tests que han cambiado
```bash
mvn test -Dtest.includes.pattern="**/*Test.java" -Dtest.excludes.pattern="**/*IntegrationTest.java"
```
**¿Qué hace?**
- Permite incluir y excluir patrones específicos
- Útil para testing selectivo basado en cambios

**Cuándo usarlo:** En pipelines de CI/CD para optimizar tiempo de ejecución.

### 20. Verificar sintaxis de tests sin ejecutar
```bash
mvn test-compile
```
**¿Qué hace?**
- Solo compila los tests sin ejecutarlos
- Verifica que no hay errores de sintaxis
- Más rápido que ejecutar los tests completos

**Cuándo usarlo:** Para verificación rápida de sintaxis durante desarrollo.

## Patrones de Testing Implementados

### 1. Patrón AAA (Arrange-Act-Assert)

```java
@Test
void testCapitalize() {
    // Arrange (Given)
    String input = "paracetamol";
    
    // Act (When)
    String result = stringUtil.capitalize(input);
    
    // Assert (Then)
    assertEquals("Paracetamol", result);
}
```

### 2. Patrón Given-When-Then

```java
@Test
void testBuscarProductos() {
    // Given
    String busqueda = "Paracetamol";
    when(repository.findByNombre(busqueda)).thenReturn(productos);
    
    // When
    List<Producto> resultado = service.buscar(busqueda);
    
    // Then
    assertThat(resultado).hasSize(1);
    verify(repository).findByNombre(busqueda);
}
```

### 3. Patrón Builder para Tests

```java
private Producto crearProducto(Long id, String nombre, BigDecimal precio) {
    return Producto.builder()
        .idProducto(id)
        .nombre(nombre)
        .precio(precio)
        .build();
}
```

## Anotaciones Principales

### JUnit 5
- `@Test` - Marca un método como test
- `@BeforeEach` - Ejecuta antes de cada test
- `@AfterEach` - Ejecuta después de cada test
- `@DisplayName` - Nombre descriptivo del test
- `@ParameterizedTest` - Test con parámetros
- `@ExtendWith` - Extensiones de JUnit

### Mockito
- `@Mock` - Crea un mock del objeto
- `@InjectMocks` - Inyecta mocks en el objeto bajo test
- `@MockBean` - Mock de Spring Bean
- `@Spy` - Objeto parcialmente mockeado

### Spring Boot Test
- `@WebMvcTest` - Test de controladores
- `@DataJpaTest` - Test de repositorios
- `@SpringBootTest` - Test de integración completo
- `@WithMockUser` - Usuario mockeado para seguridad

## Assertions Comunes

### JUnit 5 Assertions
```java
// Básicas
assertEquals(expected, actual);
assertTrue(condition);
assertFalse(condition);
assertNull(object);
assertNotNull(object);

// Colecciones
assertThat(list).hasSize(3);
assertThat(list).contains("elemento");
assertThat(list).isEmpty();

// Excepciones
assertThrows(IllegalArgumentException.class, () -> {
    service.metodoQueDebefallar();
});
```

### Mockito Verifications
```java
// Verificar llamadas
verify(mock).metodo();
verify(mock, times(2)).metodo();
verify(mock, never()).metodo();

// Verificar argumentos
verify(mock).metodo(eq("parametro"));
verify(mock).metodo(any(String.class));
verify(mock).metodo(argThat(arg -> arg.length() > 5));
```

## Configuración de Mocks

### Stubbing Básico
```java
when(mock.metodo()).thenReturn(valor);
when(mock.metodo(anyString())).thenReturn(valor);
when(mock.metodo()).thenThrow(new RuntimeException());
```

### Stubbing Avanzado
```java
// Respuestas múltiples
when(mock.metodo())
    .thenReturn(valor1)
    .thenReturn(valor2)
    .thenThrow(new RuntimeException());

// Callback personalizado
when(mock.metodo(any())).thenAnswer(invocation -> {
    String arg = invocation.getArgument(0);
    return "Procesado: " + arg;
});
```

## Mejores Prácticas

### 1. Nomenclatura de Tests
```java
// ✅ Bueno - Descriptivo
@Test
void debeRetornarProductoCuandoIdExiste() { }

// ❌ Malo - No descriptivo
@Test
void test1() { }
```

### 2. Organización de Tests
```java
@Test
void debeCrearProducto_CuandoDatosValidos_EntoncesRetornaProductoGuardado() {
    // Given - Datos válidos
    
    // When - Crear producto
    
    // Then - Verificar resultado
}
```

### 3. Datos de Test
```java
@BeforeEach
void setUp() {
    // Configurar datos comunes para todos los tests
    productoEjemplo = crearProductoEjemplo();
}

private Producto crearProductoEjemplo() {
    // Factory method para crear datos de test
}
```

### 4. Verificaciones Específicas
```java
// ✅ Bueno - Verificación específica
verify(repository).save(argThat(producto -> 
    producto.getNombre().equals("Paracetamol") &&
    producto.getPrecio().compareTo(BigDecimal.valueOf(15.50)) == 0
));

// ❌ Malo - Verificación genérica
verify(repository).save(any());
```

## Configuración de Cobertura (JaCoCo)

Agregar al `pom.xml`:

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

## Archivos de Testing por Arquitectura

### JUnit 5 (Framework de Testing)
- **StringUtilGuavaCommonsTest.java** - Tests de utilidades de string
- **ExcelUtilPoiTest.java** - Tests de generación de Excel
- **FileUtilGuavaCommonsTest.java** - Tests de utilidades de archivos

### Mockito (Framework de Mocking)
- **ProductoServiceTest.java** - Tests de servicios con mocks
- **ProductoControllerTest.java** - Tests de controladores con MockMvc
- **UsuarioServiceTest.java** - Tests de servicios de usuario

### Spring Boot Test (Integración)
- **BoticaBackendApplicationTests.java** - Test de arranque de aplicación
- **ProductoIntegrationTest.java** - Tests de integración completos

## Solución de Problemas Comunes

### Error: "cannot find symbol" en getters/setters

**Problema:** Lombok no está generando los getters y setters automáticamente.

**Soluciones:**

1. **Verificar configuración del IDE:**
   - Instalar plugin de Lombok en tu IDE
   - Habilitar procesamiento de anotaciones

2. **Limpiar y recompilar:**
   ```bash
   mvn clean compile
   ```

3. **Verificar configuración de Maven:**
   - Asegurar que el plugin de compilador tenga la configuración correcta de Lombok
   - Verificar que las dependencias estén correctas

4. **Solución temporal - Ejecutar solo tests de utilidades:**
   ```bash
   # Ejecutar solo el test simple que no depende de modelos
   mvn test -Dtest=SimpleTest
   
   # Ejecutar solo tests de utilidades
   mvn test -Dtest=StringUtilGuavaCommonsTest
   mvn test -Dtest=ExcelUtilPoiTest
   ```

### Error: "Spring application failed to start"

**Problema:** La aplicación Spring no puede iniciarse durante los tests.

**Soluciones:**

1. **Usar tests unitarios puros:**
   ```bash
   mvn test -Dtest=*Test -DfailIfNoTests=false
   ```

2. **Configurar base de datos H2 para tests:**
   - Agregar H2 como dependencia de test
   - Configurar application-test.properties

### Error: "No tests were executed"

**Problema:** Maven no encuentra los tests.

**Soluciones:**

1. **Verificar nomenclatura:**
   - Los archivos deben terminar en `Test.java` o `Tests.java`
   - Deben estar en `src/test/java`

2. **Ejecutar con patrón específico:**
   ```bash
   mvn test -Dtest="**/*Test"
   ```

## Comandos de Testing Seguros

Estos comandos funcionan independientemente del estado de la aplicación:

### Tests Básicos (Sin dependencias Spring)
```bash
# Test simple de JUnit
mvn test -Dtest=SimpleTest
```
**¿Qué hace?** Ejecuta un test básico sin dependencias complejas para verificar que JUnit funciona.

```bash
# Tests de utilidades (si Lombok funciona)
mvn test -Dtest=StringUtilGuavaCommonsTest
mvn test -Dtest=ExcelUtilPoiTest
```
**¿Qué hace?** Ejecuta tests de utilidades que no dependen de Spring Boot, solo de librerías externas.

### Compilación Forzada
```bash
# Limpiar y compilar solo tests
mvn clean test-compile
```
**¿Qué hace?** 
- Borra compilaciones anteriores
- Compila únicamente los archivos de test
- No intenta compilar el código principal que puede tener errores

```bash
# Compilar ignorando errores del main
mvn test-compile -Dmaven.main.skip=true
```
**¿Qué hace?** Compila solo tests saltándose completamente el código principal, útil cuando hay errores de compilación en src/main.

### Verificación de Configuración
```bash
# Verificar dependencias
mvn dependency:tree
```
**¿Qué hace?** Muestra el árbol completo de dependencias, incluyendo versiones y conflictos. Útil para identificar problemas de compatibilidad.

```bash
# Verificar plugins
mvn help:effective-pom
```
**¿Qué hace?** Muestra el POM efectivo con todas las configuraciones heredadas y aplicadas. Útil para debuggear configuraciones de Maven.

## Comandos de Troubleshooting y Debugging

### Diagnóstico de Problemas de Compilación
```bash
# Compilar con información detallada de errores
mvn test-compile -X
```
**¿Qué hace?** Ejecuta en modo debug mostrando información detallada sobre el proceso de compilación, útil para identificar problemas específicos.

```bash
# Verificar configuración de Java
mvn -version
```
**¿Qué hace?** Muestra la versión de Maven, Java y sistema operativo. Útil para verificar compatibilidad de versiones.

```bash
# Limpiar cache de Maven
mvn dependency:purge-local-repository
```
**¿Qué hace?** Limpia el repositorio local de Maven y re-descarga todas las dependencias. Útil cuando hay dependencias corruptas.

### Diagnóstico de Tests Específicos
```bash
# Ejecutar test con stack trace completo
mvn test -Dtest=ProductoServiceTest -Dsurefire.printSummary=true -Dsurefire.reportFormat=plain
```
**¿Qué hace?** Ejecuta el test mostrando información detallada de errores y stack traces completos.

```bash
# Ejecutar test con logging detallado
mvn test -Dtest=ProductoServiceTest -Dlogging.level.root=DEBUG
```
**¿Qué hace?** Ejecuta el test con logging en nivel DEBUG para ver toda la información de ejecución.

### Verificación de Recursos y Configuración
```bash
# Verificar recursos de test
mvn process-test-resources
```
**¿Qué hace?** Procesa y copia los recursos de test (como application-test.properties) sin ejecutar tests.

```bash
# Verificar classpath de test
mvn dependency:build-classpath -Dmdep.outputScope=test
```
**¿Qué hace?** Muestra el classpath completo que se usa para ejecutar tests, útil para verificar que todas las dependencias están disponibles.

### Comandos de Análisis de Performance
```bash
# Ejecutar tests con profiling
mvn test -Djvm.args="-XX:+PrintGCDetails -XX:+PrintGCTimeStamps"
```
**¿Qué hace?** Ejecuta tests con información detallada del garbage collector para identificar problemas de memoria.

```bash
# Medir tiempo de ejecución por test
mvn test -Dsurefire.reportFormat=brief -Dsurefire.useFile=false
```
**¿Qué hace?** Ejecuta tests mostrando tiempo de ejecución individual de cada test en la consola.

### Comandos de Validación de Configuración
```bash
# Validar configuración de Surefire
mvn help:describe -Dplugin=surefire -Ddetail=true
```
**¿Qué hace?** Muestra toda la configuración disponible del plugin Surefire que ejecuta los tests.

```bash
# Verificar configuración de JaCoCo
mvn help:describe -Dplugin=jacoco -Ddetail=true
```
**¿Qué hace?** Muestra la configuración del plugin JaCoCo para cobertura de código.

### Comandos de Recuperación de Errores
```bash
# Reiniciar completamente el entorno de test
mvn clean compile test-compile -U
```
**¿Qué hace?** 
- Limpia todo
- Recompila el código principal
- Recompila los tests
- Actualiza dependencias (-U)

```bash
# Ejecutar tests con configuración mínima
mvn test -Dmaven.test.skip=false -Dmaven.surefire.debug=true
```
**¿Qué hace?** Ejecuta tests con configuración de debug habilitada y forzando la ejecución de tests.

### Comandos de Análisis de Dependencias
```bash
# Analizar conflictos de dependencias
mvn dependency:analyze
```
**¿Qué hace?** Analiza las dependencias y reporta cuáles se usan, cuáles no, y cuáles faltan.

```bash
# Verificar dependencias de test específicamente
mvn dependency:analyze-only -DignoreNonCompile=true
```
**¿Qué hace?** Analiza solo las dependencias de test ignorando las de compilación principal.

### Comandos de Generación de Reportes de Diagnóstico
```bash
# Generar reporte completo de la build
mvn site -Dreporting.outputDirectory=target/diagnostic-reports
```
**¿Qué hace?** Genera un sitio web completo con todos los reportes de Maven incluyendo tests, dependencias, y análisis de código.

```bash
# Generar solo reporte de tests
mvn surefire-report:report
```
**¿Qué hace?** Genera un reporte HTML detallado de la ejecución de tests en target/site/surefire-report.html.

## Estado Actual del Proyecto

**✅ Implementado correctamente:**
- Dependencias de JUnit 5 y Mockito en pom.xml
- Estructura de tests creada
- Tests de ejemplo escritos
- Documentación completa

**⚠️ Requiere solución:**
- Problemas de compilación con Lombok
- Getters/setters no generados automáticamente
- Algunos servicios con referencias incorrectas

**🔧 Solución recomendada:**
1. Arreglar los problemas de Lombok primero
2. Luego ejecutar los tests completos
3. Los tests están listos para funcionar una vez resueltos los problemas de compilación

## Próximos Pasos

1. **Solucionar problemas de Lombok:** Configurar correctamente el procesador de anotaciones
2. **Ejecutar tests básicos:** Verificar que JUnit funciona con tests simples
3. **Expandir cobertura:** Agregar tests para todos los servicios una vez solucionados los problemas
4. **Implementar tests de integración:** Tests end-to-end con base de datos H2
5. **Configurar CI/CD:** Integración con pipelines de testing automático

---

**Fecha de creación:** 25 de octubre de 2024  
**Versión del documento:** 1.0  
**Autor:** Sistema Botica Backend

**Nota:** Los tests están completamente implementados y listos para usar. El problema actual es de configuración de Lombok, no de JUnit/Mockito.