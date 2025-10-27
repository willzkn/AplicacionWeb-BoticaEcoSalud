package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Service.ProductoService;
// import com.botica.botica_backend.Util.StringUtilGuavaCommons;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private static final Logger log = LoggerFactory.getLogger(ProductoController.class);
    private final ProductoService productoService;

    // =====================================================
    // OPERACIONES CRUD COMPLETAS
    // =====================================================

    // CREATE - Crear un nuevo producto
    @PostMapping("/create")
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        try {
            Producto nuevo = productoService.crearProducto(producto);
            return ResponseEntity.ok(nuevo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor");
        }
    }

    // READ - Listar todos los productos
    @GetMapping("/all")
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    // READ - Obtener producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            Optional<Producto> producto = productoService.obtenerPorId(id);
            if (producto.isPresent()) {
                return ResponseEntity.ok(producto.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al obtener producto");
        }
    }

    // READ - Listar productos activos
    @GetMapping("/activos")
    public ResponseEntity<List<Producto>> listarActivos() {
        return ResponseEntity.ok(productoService.listarActivos());
    }

    // READ - Listar productos públicos (sin autenticación para el catálogo)
    @GetMapping("/publicos")
    public ResponseEntity<?> listarProductosPublicos() {
        try {
            List<Producto> productos = productoService.listarActivos();
            return ResponseEntity.ok(productos);
        } catch (IllegalArgumentException e) {
            log.error("Error de validación al listar productos públicos: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al listar productos públicos", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al cargar productos públicos"));
        }
    }

    // READ - Buscar productos por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
    }

    // READ - Listar productos por categoría
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Producto>> listarPorCategoria(@PathVariable Long categoriaId) {
        return ResponseEntity.ok(productoService.listarPorCategoria(categoriaId));
    }

    // UPDATE - Actualizar producto completo
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        try {
            producto.setIdProducto(id);
            Producto actualizado = productoService.actualizarProducto(producto);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al actualizar producto");
        }
    }

    // UPDATE - Actualizar precio
    @PutMapping("/{id}/precio")
    public ResponseEntity<?> actualizarPrecio(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body) {
        try {
            Double nuevoPrecio = body.get("nuevoPrecio");
            productoService.actualizarPrecio(id, nuevoPrecio);
            return ResponseEntity.ok("Precio actualizado correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al actualizar precio");
        }
    }

    // UPDATE - Actualizar stock
    @PutMapping("/{id}/stock")
    public ResponseEntity<?> actualizarStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Integer cantidad = (Integer) body.get("cantidad");
            String tipoOperacion = (String) body.get("tipoOperacion"); // "ENTRADA" o "SALIDA"
            productoService.actualizarStock(id, cantidad, tipoOperacion);
            return ResponseEntity.ok("Stock actualizado correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al actualizar stock");
        }
    }

    // UPDATE - Activar/Desactivar producto
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        try {
            Boolean activo = body.get("activo");
            productoService.cambiarEstado(id, activo);
            String mensaje = activo ? "Producto activado correctamente" : "Producto desactivado correctamente";
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al cambiar estado");
        }
    }

    // DELETE - Eliminar producto (hard delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        try {
            productoService.eliminarProducto(id);
            return ResponseEntity.ok("Producto eliminado correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al eliminar producto");
        }
    }

    // PUT - Desactivar producto (soft delete)
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivarProducto(@PathVariable Long id) {
        try {
            productoService.desactivarProducto(id);
            return ResponseEntity.ok("Producto desactivado correctamente");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al desactivar producto");
        }
    }

    // =====================================================
    // OPERACIONES ESPECIALES
    // =====================================================

    // Validar stock
    @GetMapping("/{id}/validarStock")
    public ResponseEntity<Boolean> validarStock(
            @PathVariable Long id,
            @RequestParam Integer cantidad) {
        boolean valido = productoService.validarStock(id, cantidad);
        return ResponseEntity.ok(valido);
    }

    // Obtener productos alternativos (misma categoría)
    @GetMapping("/{id}/alternativas")
    public ResponseEntity<List<Producto>> obtenerAlternativas(@PathVariable Long id) {
        List<Producto> alternativas = productoService.obtenerAlternativas(id);
        return ResponseEntity.ok(alternativas);
    }

    // Productos con stock bajo
    @GetMapping("/stock-bajo")
    public ResponseEntity<List<Producto>> productosConStockBajo(@RequestParam(defaultValue = "10") Integer limite) {
        return ResponseEntity.ok(productoService.productosConStockBajo(limite));
    }

    // =====================================================
    // EXPORTACIÓN Y REPORTES
    // =====================================================

    // Exportar productos a CSV (alternativa funcional a Excel)
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportarProductosCSV() {
        try {
            log.info("Iniciando exportación de productos a CSV");

            List<Producto> productos = productoService.listarTodos();
            // StringUtilGuavaCommons stringUtilLocal = new StringUtilGuavaCommons();

            StringBuilder csv = new StringBuilder();
            csv.append("ID,Codigo,Nombre,Descripcion,Precio,Stock,Categoria,Estado\n");

            for (Producto p : productos) {
                csv.append(p.getIdProducto()).append(",");
                csv.append("\"").append(p.getCodigo() != null ? p.getCodigo() : "").append("\",");
                csv.append("\"").append(p.getNombre() != null && !p.getNombre().trim().isEmpty() ? p.getNombre() : "Sin nombre")
                        .append("\",");
                csv.append("\"").append(p.getDescripcion() != null && p.getDescripcion().length() > 100 ? p.getDescripcion().substring(0, 100) : (p.getDescripcion() != null ? p.getDescripcion() : "")).append("\",");
                csv.append(p.getPrecio()).append(",");
                csv.append(p.getStock()).append(",");
                csv.append("\"").append(p.getCategoria() != null ? p.getCategoria().getNombre() : "Sin categoría")
                        .append("\",");
                csv.append("\"").append(p.getActivo() ? "ACTIVO" : "INACTIVO").append("\"");
                csv.append("\n");
            }

            byte[] csvBytes = csv.toString().getBytes();

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "productos_" + timestamp + ".csv";

            log.info("CSV generado exitosamente: {}, {} productos, {} bytes", filename, productos.size(),
                    csvBytes.length);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(csvBytes);

        } catch (Exception e) {
            log.error("Error al generar CSV", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
