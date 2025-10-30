package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    // =====================================================
    // OPERACIONES CRUD COMPLETAS
    // =====================================================

    // CREATE - Crear nueva categoría
    @PostMapping("/crear")
    public ResponseEntity<?> crearCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria creada = categoriaService.crearCategoria(categoria);
            return ResponseEntity.ok(creada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor");
        }
    }

    // READ - Listar todas las categorías
    @GetMapping("/all")
    public ResponseEntity<List<Categoria>> listarTodas() {
        List<Categoria> categorias = categoriaService.listarTodas();
        return ResponseEntity.ok(categorias);
    }

    // READ - Obtener categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            Optional<Categoria> categoria = categoriaService.obtenerPorId(id);
            if (categoria.isPresent()) {
                return ResponseEntity.ok(categoria.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al obtener categoría");
        }
    }

    // READ - Obtener todas las categorías activas
    @GetMapping("/activas")
    public ResponseEntity<List<Categoria>> obtenerTodasActivas() {
        List<Categoria> categorias = categoriaService.obtenerTodasActivas();
        return ResponseEntity.ok(categorias);
    }

    // READ - Buscar categorías por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<Categoria>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(categoriaService.buscarPorNombre(nombre));
    }

    // UPDATE - Actualizar categoría completa
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCategoria(@PathVariable Long id, @RequestBody Categoria categoria) {
        try {
            categoria.setIdCategoria(id);
            Categoria actualizada = categoriaService.actualizarCategoria(categoria);
            return ResponseEntity.ok(actualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al actualizar categoría");
        }
    }

    // UPDATE - Cambiar estado (activar/desactivar)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        try {
            Boolean activo = body.get("activo");
            categoriaService.cambiarEstado(id, activo);
            String mensaje = activo ? "Categoría activada correctamente" : "Categoría desactivada correctamente";
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al cambiar estado");
        }
    }

    // UPDATE - Desactivar categoría (método legacy)
    @PutMapping("/desactivar/{id}")
    public ResponseEntity<?> desactivarCategoria(@PathVariable Long id) {
        try {
            categoriaService.desactivarCategoria(id);
            return ResponseEntity.ok("Categoría desactivada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // DELETE - Eliminar categoría (hard delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable Long id) {
        try {
            categoriaService.eliminarCategoria(id);
            return ResponseEntity.ok("Categoría eliminada correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al eliminar categoría");
        }
    }

    // =====================================================
    // OPERACIONES ESPECIALES
    // =====================================================

    // Contar productos por categoría
    @GetMapping("/{id}/productos/count")
    public ResponseEntity<Long> contarProductos(@PathVariable Long id) {
        Long count = categoriaService.contarProductosPorCategoria(id);
        return ResponseEntity.ok(count);
    }

    // =====================================================
    // EXPORTACIÓN CSV
    // =====================================================

    // Exportar categorías a CSV
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportarCategoriasCSV() {
        try {
            List<Categoria> categorias = categoriaService.listarTodas();

            StringBuilder csv = new StringBuilder();

            csv.append("EMPRESA: ECOSALUD").append("\n");
            csv.append("\n");

            // Línea decorativa
            csv.append("\"════════════════════════════════════════════════════════════════════════\"\n");

            // Encabezado de columnas
            csv.append("ID;NOMBRE;DESCRIPCION;ESTADO;FECHA_CREACION;PRODUCTOS_COUNT\n");

            DecimalFormatSymbols symbols = new DecimalFormatSymbols(new Locale("es", "ES"));
            symbols.setGroupingSeparator('.');
            DecimalFormat intFmt = new DecimalFormat("#,##0", symbols);

            long totalCategorias = 0;
            long totalProductos = 0;

            for (Categoria c : categorias) {
                totalCategorias++;
                Long productosCount = categoriaService.contarProductosPorCategoria(c.getIdCategoria());
                totalProductos += productosCount != null ? productosCount : 0L;

                csv.append(c.getIdCategoria() != null ? c.getIdCategoria() : "").append(";");

                csv.append("\"").append(c.getNombre() != null ? c.getNombre().replace("\"", "\"\"") : "SIN NOMBRE").append("\";");
                csv.append("\"").append(c.getDescripcion() != null ? c.getDescripcion().replace("\"", "\"\"") : "").append("\";");
                csv.append("\"").append(c.getActivo() != null && c.getActivo() ? "ACTIVO" : "INACTIVO").append("\";");

                String fechaStr = c.getFechaCreacion() != null ? c.getFechaCreacion().toString() : "";
                csv.append("\"").append(fechaStr).append("\";");

                csv.append("\"").append(intFmt.format(productosCount != null ? productosCount : 0)).append("\"");

                csv.append("\n");
            }

            // Resumen
            csv.append("\n");
            csv.append("\"────────────────────────── RESUMEN ──────────────────────────\"\n");
            csv.append("TOTAL_CATEGORIAS;").append(totalCategorias).append("\n");
            csv.append("TOTAL_PRODUCTOS;\"").append(new DecimalFormat("#,##0", symbols).format(totalProductos)).append("\"\n");
            csv.append("\n");

            // Añadir BOM y usar UTF-8
            byte[] csvBytes = ("\uFEFF" + csv.toString()).getBytes(java.nio.charset.StandardCharsets.UTF_8);

            String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "categorias_estilizado_" + timestamp + ".csv";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + filename)
                    .header("Content-Type", "text/csv; charset=UTF-8")
                    .body(csvBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
