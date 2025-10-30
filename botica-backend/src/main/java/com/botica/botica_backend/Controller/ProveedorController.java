package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Proveedor;
import com.botica.botica_backend.Service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    // =====================================================
    // OPERACIONES CRUD COMPLETAS
    // =====================================================

    // CREATE - Registrar un nuevo proveedor
    @PostMapping("/register")
    public ResponseEntity<?> registrarProveedor(@RequestBody Proveedor proveedor) {
        try {
            Proveedor nuevo = proveedorService.registrarProveedor(proveedor);
            return ResponseEntity.ok(nuevo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor");
        }
    }

    // READ - Obtener todos los proveedores
    @GetMapping("/all")
    public ResponseEntity<List<Proveedor>> getAllProveedores() {
        return ResponseEntity.ok(proveedorService.getAllProveedores());
    }

    // READ - Obtener proveedor por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            Optional<Proveedor> proveedor = proveedorService.obtenerPorId(id);
            if (proveedor.isPresent()) {
                return ResponseEntity.ok(proveedor.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al obtener proveedor");
        }
    }

    // READ - Buscar proveedor por RUC
    @GetMapping("/buscar/{ruc}")
    public ResponseEntity<?> buscarPorRUC(@PathVariable String ruc) {
        try {
            Proveedor proveedor = proveedorService.buscarPorRUC(ruc);
            if (proveedor == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(proveedor);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al buscar proveedor");
        }
    }

    // READ - Listar proveedores activos
    @GetMapping("/activos")
    public ResponseEntity<List<Proveedor>> listarActivos() {
        return ResponseEntity.ok(proveedorService.listarActivos());
    }

    // READ - Buscar por nombre comercial
    @GetMapping("/buscar")
    public ResponseEntity<List<Proveedor>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(proveedorService.buscarPorNombre(nombre));
    }

    // UPDATE - Actualizar proveedor completo
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProveedor(@PathVariable Long id, @RequestBody Proveedor proveedor) {
        try {
            proveedor.setIdProveedor(id);
            Proveedor actualizado = proveedorService.actualizarProveedor(proveedor);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al actualizar proveedor");
        }
    }

    // UPDATE - Cambiar estado (activar/desactivar)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        try {
            Boolean estado = body.get("estado");
            proveedorService.cambiarEstado(id, estado);
            String mensaje = estado ? "Proveedor activado correctamente" : "Proveedor desactivado correctamente";
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al cambiar estado");
        }
    }

    // DELETE - Eliminar proveedor (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProveedor(@PathVariable Long id) {
        try {
            proveedorService.eliminarProveedor(id);
            return ResponseEntity.ok("Proveedor eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al eliminar proveedor");
        }
    }

    // =====================================================
    // OPERACIONES ESPECIALES
    // =====================================================

    // Contar productos por proveedor
    @GetMapping("/{id}/productos/count")
    public ResponseEntity<Long> contarProductos(@PathVariable Long id) {
        Long count = proveedorService.contarProductosPorProveedor(id);
        return ResponseEntity.ok(count);
    }

    // Listar por tipo de producto
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Proveedor>> listarPorTipo(@PathVariable String tipo) {
        return ResponseEntity.ok(proveedorService.listarPorTipoProducto(tipo));
    }

    // =====================================================
    // EXPORTACIÓN CSV
    // =====================================================

    // Exportar proveedores a CSV (estilizado, sin logo ni nota)
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportarProveedoresCSV() {
        try {
            List<Proveedor> proveedores = proveedorService.getAllProveedores();
            
            StringBuilder csv = new StringBuilder();
            
            // Cabecera con nombre de la empresa y una línea en blanco
            csv.append("EMPRESA: ECOSALUD").append("\n").append("\n");
            
            // línea decorativa
            csv.append("\"════════════════════════════════════════════════════════════════════════\"\n");

            // Encabezado CSV (separador ;)
            csv.append("ID;RUC;NOMBRE_COMERCIAL;TELEFONO;CORREO;PERSONA_CONTACTO;TIPO_PRODUCTO;CONDICIONES_PAGO;ESTADO;FECHA_REGISTRO\n");

            long total = 0;
            for (Proveedor p : proveedores) {
                total++;
                csv.append(p.getIdProveedor() != null ? p.getIdProveedor() : "").append(";");
                csv.append("\"").append(p.getRUC() != null ? p.getRUC() : "").append("\";");
                csv.append("\"").append(p.getNombreComercial() != null ? p.getNombreComercial().replace("\"", "\"\"") : "").append("\";");
                csv.append("\"").append(p.getTelefono() != null ? p.getTelefono() : "").append("\";");
                csv.append("\"").append(p.getCorreo() != null ? p.getCorreo() : "").append("\";");
                csv.append("\"").append(p.getPersonaContacto() != null ? p.getPersonaContacto().replace("\"", "\"\"") : "").append("\";");
                csv.append("\"").append(p.getTipoProducto() != null ? p.getTipoProducto() : "").append("\";");
                csv.append("\"").append(p.getCondicionesPago() != null ? p.getCondicionesPago() : "").append("\";");
                csv.append("\"").append(p.getEstado() != null && p.getEstado() ? "ACTIVO" : "INACTIVO").append("\";");
                csv.append("\"").append(p.getFechaRegistro() != null ? p.getFechaRegistro().toString() : "").append("\"");
                csv.append("\n");
            }
            
            // Resumen
            csv.append("\n");
            csv.append("\"────────────────────────── RESUMEN ──────────────────────────\"\n");
            csv.append("TOTAL_PROVEEDORES;").append(total).append("\n");
            csv.append("\n");
            
            // Añadir BOM y usar UTF-8 para mejor compatibilidad con Excel
            byte[] csvBytes = ("\uFEFF" + csv.toString()).getBytes(java.nio.charset.StandardCharsets.UTF_8);
            
            String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "proveedores_estilizado_" + timestamp + ".csv";
            
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