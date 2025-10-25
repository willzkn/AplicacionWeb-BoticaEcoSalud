package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

// import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Tests para ProductoService usando JUnit 5 y Mockito
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProductoService Tests")
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    private Producto productoEjemplo;
    private Categoria categoriaEjemplo;

    @BeforeEach
    void setUp() {
        // Configurar datos de prueba
        categoriaEjemplo = new Categoria();
        categoriaEjemplo.setIdCategoria(1L);
        categoriaEjemplo.setNombre("Analgésicos");

        productoEjemplo = new Producto();
        productoEjemplo.setIdProducto(1L);
        productoEjemplo.setNombre("Paracetamol 500mg");
        productoEjemplo.setDescripcion("Analgésico y antipirético");
        productoEjemplo.setPrecio(15.50);
        productoEjemplo.setStock(100);
        productoEjemplo.setCategoria(categoriaEjemplo);
    }

    @Test
    @DisplayName("Debe obtener todos los productos correctamente")
    void testObtenerTodosLosProductos() {
        // Given
        List<Producto> productosEsperados = Arrays.asList(
                productoEjemplo,
                crearProducto(2L, "Ibuprofeno 400mg", 18.00, 50));
        when(productoRepository.findAll()).thenReturn(productosEsperados);

        // When
        List<Producto> resultado = productoService.listarTodos();

        // Then
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals("Paracetamol 500mg", resultado.get(0).getNombre());
        assertEquals("Ibuprofeno 400mg", resultado.get(1).getNombre());

        verify(productoRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe obtener producto por ID correctamente")
    void testObtenerProductoPorId() {
        // Given
        Long idProducto = 1L;
        when(productoRepository.findById(idProducto)).thenReturn(Optional.of(productoEjemplo));

        // When
        Optional<Producto> resultado = productoService.obtenerPorId(idProducto);

        // Then
        assertTrue(resultado.isPresent());
        assertEquals("Paracetamol 500mg", resultado.get().getNombre());
        assertEquals(15.50, resultado.get().getPrecio());

        verify(productoRepository, times(1)).findById(idProducto);
    }

    @Test
    @DisplayName("Debe retornar Optional vacío cuando producto no existe")
    void testObtenerProductoPorIdNoExiste() {
        // Given
        Long idProductoInexistente = 999L;
        when(productoRepository.findById(idProductoInexistente)).thenReturn(Optional.empty());

        // When
        Optional<Producto> resultado = productoService.obtenerPorId(idProductoInexistente);

        // Then
        assertFalse(resultado.isPresent());

        verify(productoRepository, times(1)).findById(idProductoInexistente);
    }

    @Test
    @DisplayName("Debe guardar producto correctamente")
    void testGuardarProducto() {
        // Given
        Producto nuevoProducto = crearProducto(null, "Aspirina 100mg", 12.00, 75);
        Producto productoGuardado = crearProducto(3L, "Aspirina 100mg", 12.00, 75);

        when(productoRepository.save(any(Producto.class))).thenReturn(productoGuardado);

        // When
        Producto resultado = productoService.crearProducto(nuevoProducto);

        // Then
        assertNotNull(resultado);
        assertEquals(3L, resultado.getIdProducto());
        assertEquals("Aspirina 100mg", resultado.getNombre());
        assertEquals(12.00, resultado.getPrecio());

        verify(productoRepository, times(1)).save(nuevoProducto);
    }

    @Test
    @DisplayName("Debe actualizar producto correctamente")
    void testActualizarProducto() {
        // Given
        Long idProducto = 1L;
        Producto productoActualizado = new Producto();
        productoActualizado.setIdProducto(idProducto);
        productoActualizado.setNombre("Paracetamol 1000mg");
        productoActualizado.setPrecio(20.00);
        productoActualizado.setStock(80);
        productoActualizado.setCategoria(categoriaEjemplo);

        // Crear el producto que se retornará después de guardar
        Producto productoGuardado = new Producto();
        productoGuardado.setIdProducto(idProducto);
        productoGuardado.setNombre("Paracetamol 1000mg");
        productoGuardado.setPrecio(20.00);
        productoGuardado.setStock(80);
        productoGuardado.setCategoria(categoriaEjemplo);
        productoGuardado.setFechaCreacion(productoEjemplo.getFechaCreacion());

        when(productoRepository.findById(idProducto)).thenReturn(Optional.of(productoEjemplo));
        when(productoRepository.save(any(Producto.class))).thenReturn(productoGuardado);

        // When
        Producto resultado = productoService.actualizarProducto(productoActualizado);

        // Then
        assertNotNull(resultado);
        assertEquals("Paracetamol 1000mg", resultado.getNombre());
        assertEquals(20.00, resultado.getPrecio());
        assertEquals(80, resultado.getStock());

        verify(productoRepository, times(1)).findById(idProducto);
        verify(productoRepository, times(1)).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe retornar Optional vacío al actualizar producto inexistente")
    void testActualizarProductoInexistente() {
        // Given
        Long idProductoInexistente = 999L;
        Producto productoActualizado = new Producto();

        when(productoRepository.findById(idProductoInexistente)).thenReturn(Optional.empty());

        // When
        productoActualizado.setIdProducto(idProductoInexistente);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            productoService.actualizarProducto(productoActualizado);
        });

        verify(productoRepository, times(1)).findById(idProductoInexistente);
        verify(productoRepository, never()).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe eliminar producto correctamente")
    void testEliminarProducto() {
        // Given
        Long idProducto = 1L;
        when(productoRepository.findById(idProducto)).thenReturn(Optional.of(productoEjemplo));
        doNothing().when(productoRepository).deleteById(idProducto);

        // When & Then - No debe lanzar excepción
        assertDoesNotThrow(() -> {
            productoService.eliminarProducto(idProducto);
        });

        // Then - Verificar que se llamó al repositorio
        verify(productoRepository, times(1)).findById(idProducto);
        verify(productoRepository, times(1)).deleteById(idProducto);
    }

    @Test
    @DisplayName("Debe lanzar excepción al eliminar producto inexistente")
    void testEliminarProductoInexistente() {
        // Given
        Long idProductoInexistente = 999L;
        when(productoRepository.findById(idProductoInexistente)).thenReturn(Optional.empty());

        // When & Then - Debe lanzar excepción
        assertThrows(IllegalArgumentException.class, () -> {
            productoService.eliminarProducto(idProductoInexistente);
        });

        verify(productoRepository, times(1)).findById(idProductoInexistente);
        verify(productoRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Debe buscar productos por nombre correctamente")
    void testBuscarProductosPorNombre() {
        // Given
        String nombreBusqueda = "Paracetamol";
        List<Producto> productosEncontrados = Arrays.asList(productoEjemplo);

        when(productoRepository.findByNombreContainingIgnoreCase(nombreBusqueda))
                .thenReturn(productosEncontrados);

        // When
        List<Producto> resultado = productoService.buscarPorNombre(nombreBusqueda);

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Paracetamol 500mg", resultado.get(0).getNombre());

        verify(productoRepository, times(1)).findByNombreContainingIgnoreCase(nombreBusqueda);
    }

    @Test
    @DisplayName("Debe validar datos al crear producto")
    void testCrearProductoConValidaciones() {
        // Test nombre vacío
        Producto productoSinNombre = new Producto();
        productoSinNombre.setPrecio(10.0);
        productoSinNombre.setStock(5);

        assertThrows(IllegalArgumentException.class, () -> {
            productoService.crearProducto(productoSinNombre);
        });

        // Test precio inválido
        Producto productoConPrecioInvalido = new Producto();
        productoConPrecioInvalido.setNombre("Test");
        productoConPrecioInvalido.setPrecio(-5.0);
        productoConPrecioInvalido.setStock(5);

        assertThrows(IllegalArgumentException.class, () -> {
            productoService.crearProducto(productoConPrecioInvalido);
        });

        // Test stock negativo
        Producto productoConStockNegativo = new Producto();
        productoConStockNegativo.setNombre("Test");
        productoConStockNegativo.setPrecio(10.0);
        productoConStockNegativo.setStock(-1);

        assertThrows(IllegalArgumentException.class, () -> {
            productoService.crearProducto(productoConStockNegativo);
        });
    }

    @Test
    @DisplayName("Debe validar datos al actualizar producto")
    void testActualizarProductoConValidaciones() {
        // Given
        Long idProducto = 1L;
        when(productoRepository.findById(idProducto)).thenReturn(Optional.of(productoEjemplo));

        // Test nombre vacío
        Producto productoSinNombre = new Producto();
        productoSinNombre.setIdProducto(idProducto);
        productoSinNombre.setPrecio(10.0);
        productoSinNombre.setStock(5);

        assertThrows(IllegalArgumentException.class, () -> {
            productoService.actualizarProducto(productoSinNombre);
        });

        // Test precio inválido
        Producto productoConPrecioInvalido = new Producto();
        productoConPrecioInvalido.setIdProducto(idProducto);
        productoConPrecioInvalido.setNombre("Test");
        productoConPrecioInvalido.setPrecio(0.0);
        productoConPrecioInvalido.setStock(5);

        assertThrows(IllegalArgumentException.class, () -> {
            productoService.actualizarProducto(productoConPrecioInvalido);
        });
    }

    @Test
    @DisplayName("Debe listar productos activos correctamente")
    void testListarProductosActivos() {
        // Given
        List<Producto> productosActivos = Arrays.asList(productoEjemplo);
        when(productoRepository.findByActivoTrue()).thenReturn(productosActivos);

        // When
        List<Producto> resultado = productoService.listarActivos();

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Paracetamol 500mg", resultado.get(0).getNombre());

        verify(productoRepository, times(1)).findByActivoTrue();
    }

    @Test
    @DisplayName("Debe listar productos por categoría correctamente")
    void testListarProductosPorCategoria() {
        // Given
        Long categoriaId = 1L;
        List<Producto> productosPorCategoria = Arrays.asList(productoEjemplo);
        when(productoRepository.findByCategoriaIdCategoria(categoriaId)).thenReturn(productosPorCategoria);

        // When
        List<Producto> resultado = productoService.listarPorCategoria(categoriaId);

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Paracetamol 500mg", resultado.get(0).getNombre());

        verify(productoRepository, times(1)).findByCategoriaIdCategoria(categoriaId);
    }

    // Método auxiliar para crear productos de prueba
    private Producto crearProducto(Long id, String nombre, Double precio, Integer stock) {
        Producto producto = new Producto();
        producto.setIdProducto(id);
        producto.setNombre(nombre);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setCategoria(categoriaEjemplo);
        return producto;
    }
}