package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Service.ProductoService;
import com.botica.botica_backend.config.TestSecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests para ProductoController usando MockMvc y Mockito
 */
@WebMvcTest(ProductoController.class)
@Import(TestSecurityConfig.class)
@DisplayName("ProductoController Tests")
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Autowired
    private ObjectMapper objectMapper;

    private Producto productoEjemplo;
    private Categoria categoriaEjemplo;

    @BeforeEach
    void setUp() {
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
    @WithMockUser
    void testObtenerTodosLosProductos() throws Exception {
        // Given
        List<Producto> productos = Arrays.asList(
            productoEjemplo,
            crearProducto(2L, "Ibuprofeno 400mg", 18.00, 50)
        );
        when(productoService.listarTodos()).thenReturn(productos);

        // When & Then
        mockMvc.perform(get("/api/productos/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nombre").value("Paracetamol 500mg"))
                .andExpect(jsonPath("$[0].precio").value(15.50))
                .andExpect(jsonPath("$[1].nombre").value("Ibuprofeno 400mg"));
    }

    @Test
    @DisplayName("Debe obtener producto por ID correctamente")
    @WithMockUser
    void testObtenerProductoPorId() throws Exception {
        // Given
        Long idProducto = 1L;
        when(productoService.obtenerPorId(idProducto)).thenReturn(Optional.of(productoEjemplo));

        // When & Then
        mockMvc.perform(get("/api/productos/{id}", idProducto))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.idProducto").value(1))
                .andExpect(jsonPath("$.nombre").value("Paracetamol 500mg"))
                .andExpect(jsonPath("$.precio").value(15.50))
                .andExpect(jsonPath("$.stock").value(100));
    }

    @Test
    @DisplayName("Debe retornar 404 cuando producto no existe")
    @WithMockUser
    void testObtenerProductoPorIdNoExiste() throws Exception {
        // Given
        Long idProductoInexistente = 999L;
        when(productoService.obtenerPorId(idProductoInexistente)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/productos/{id}", idProductoInexistente))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Debe crear producto correctamente")
    @WithMockUser(roles = "ADMIN")
    void testCrearProducto() throws Exception {
        // Given
        Producto nuevoProducto = crearProducto(null, "Aspirina 100mg", 12.00, 75);
        Producto productoGuardado = crearProducto(3L, "Aspirina 100mg", 12.00, 75);
        
        when(productoService.crearProducto(any(Producto.class))).thenReturn(productoGuardado);

        // When & Then
        mockMvc.perform(post("/api/productos/create")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProducto)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.idProducto").value(3))
                .andExpect(jsonPath("$.nombre").value("Aspirina 100mg"))
                .andExpect(jsonPath("$.precio").value(12.00));
    }

    @Test
    @DisplayName("Debe actualizar producto correctamente")
    @WithMockUser(roles = "ADMIN")
    void testActualizarProducto() throws Exception {
        // Given
        Long idProducto = 1L;
        Producto productoActualizado = crearProducto(1L, "Paracetamol 1000mg", 20.00, 80);
        
        when(productoService.actualizarProducto(any(Producto.class)))
            .thenReturn(productoActualizado);

        // When & Then
        mockMvc.perform(put("/api/productos/{id}", idProducto)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productoActualizado)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nombre").value("Paracetamol 1000mg"))
                .andExpect(jsonPath("$.precio").value(20.00))
                .andExpect(jsonPath("$.stock").value(80));
    }

    @Test
    @DisplayName("Debe retornar 400 al actualizar producto inexistente")
    @WithMockUser(roles = "ADMIN")
    void testActualizarProductoInexistente() throws Exception {
        // Given
        Long idProductoInexistente = 999L;
        Producto productoActualizado = crearProducto(999L, "Producto Inexistente", 10.00, 10);
        
        when(productoService.actualizarProducto(any(Producto.class)))
            .thenThrow(new IllegalArgumentException("Producto no encontrado"));

        // When & Then
        mockMvc.perform(put("/api/productos/{id}", idProductoInexistente)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productoActualizado)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Debe eliminar producto correctamente")
    @WithMockUser(roles = "ADMIN")
    void testEliminarProducto() throws Exception {
        // Given
        Long idProducto = 1L;
        // No need to mock void method - it will succeed by default

        // When & Then
        mockMvc.perform(delete("/api/productos/{id}", idProducto)
                .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Debe retornar 400 al eliminar producto inexistente")
    @WithMockUser(roles = "ADMIN")
    void testEliminarProductoInexistente() throws Exception {
        // Given
        Long idProductoInexistente = 999L;
        doThrow(new IllegalArgumentException("Producto no encontrado"))
            .when(productoService).eliminarProducto(idProductoInexistente);

        // When & Then
        mockMvc.perform(delete("/api/productos/{id}", idProductoInexistente)
                .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Debe buscar productos por nombre correctamente")
    @WithMockUser
    void testBuscarProductosPorNombre() throws Exception {
        // Given
        String nombreBusqueda = "Paracetamol";
        List<Producto> productosEncontrados = Arrays.asList(productoEjemplo);
        
        when(productoService.buscarPorNombre(nombreBusqueda))
            .thenReturn(productosEncontrados);

        // When & Then
        mockMvc.perform(get("/api/productos/buscar")
                .param("nombre", nombreBusqueda))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Paracetamol 500mg"));
    }

    @Test
    @DisplayName("Debe validar datos de entrada incorrectos")
    @WithMockUser(roles = "ADMIN")
    void testValidacionDatosIncorrectos() throws Exception {
        // Given - Producto con datos inválidos
        Producto productoInvalido = new Producto();
        productoInvalido.setNombre(""); // Nombre vacío
        productoInvalido.setPrecio(-10.00); // Precio negativo
        productoInvalido.setStock(-5); // Stock negativo

        when(productoService.crearProducto(any(Producto.class)))
            .thenThrow(new IllegalArgumentException("El nombre del producto es obligatorio"));

        // When & Then
        mockMvc.perform(post("/api/productos/create")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productoInvalido)))
                .andExpect(status().isBadRequest());
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