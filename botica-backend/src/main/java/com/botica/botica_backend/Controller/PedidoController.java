package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Model.Detalle_pedido;
import com.botica.botica_backend.Service.PedidoService;
import com.botica.botica_backend.Security.RoleBasedAccessControl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    // Crear pedido (disponible para clientes autenticados)
    @PostMapping("/create")
    @RoleBasedAccessControl(allowedRoles = {"CLIENT", "CLIENTE", "ADMIN", "USER","cliente","Admin","admin","Cliente","client"})
    public ResponseEntity<?> crearPedido(@RequestBody PedidoService.PedidoRequest pedidoRequest) {
        try {
            Pedido nuevoPedido = pedidoService.crearPedido(pedidoRequest);
            return ResponseEntity.ok(nuevoPedido);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/enviar-confirmacion")
    @RoleBasedAccessControl(allowedRoles = {"CLIENT", "CLIENTE", "ADMIN", "USER","cliente","Admin","admin","Cliente","client"})
    public ResponseEntity<?> enviarConfirmacion(@PathVariable("id") Long pedidoId) {
        try {
            pedidoService.enviarConfirmacionPedido(pedidoId);
            return ResponseEntity.ok(Map.of("message", "Confirmación enviada"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Crear pedido desde el carrito del usuario (con productos del frontend)
    @PostMapping("/crear-desde-carrito")
    public ResponseEntity<?> crearPedidoDesdeCarrito(@RequestBody PedidoService.PedidoRequest pedidoRequest) {
        try {
            if (pedidoRequest.getIdUsuario() == null || pedidoRequest.getIdMetodoPago() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "idUsuario e idMetodoPago son requeridos"));
            }
            
            if (pedidoRequest.getDetalles() == null || pedidoRequest.getDetalles().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El carrito está vacío"));
            }
            
            Pedido nuevoPedido = pedidoService.crearPedido(pedidoRequest);
            return ResponseEntity.ok(nuevoPedido);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Actualizar estado de un pedido (solo admin)
    @PutMapping("/{id}/estado")
    @RoleBasedAccessControl(allowedRoles = {"ADMIN"})
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            String nuevoEstado = body.get("nuevoEstado");
            Pedido pedidoActualizado = pedidoService.actualizarEstadoPedido(id, nuevoEstado);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener historial de pedidos de un usuario
    @GetMapping("/usuario/{idUsuario}")
    @RoleBasedAccessControl(allowedRoles = {"CLIENT", "CLIENTE", "ADMIN", "USER"})
    public ResponseEntity<List<Pedido>> historialUsuario(@PathVariable Long idUsuario) {
        List<Pedido> historial = pedidoService.obtenerPedidosPorUsuario(idUsuario);
        return ResponseEntity.ok(historial);
    }

    // Listar todos los pedidos (solo admin)
    @GetMapping("/all")
    @RoleBasedAccessControl(allowedRoles = {"ADMIN"})
    public ResponseEntity<List<Pedido>> listarTodos() {
        return ResponseEntity.ok(pedidoService.obtenerTodosLosPedidos());
    }

    // Obtener detalles de un pedido
    @GetMapping("/{id}/detalles")
    @RoleBasedAccessControl(allowedRoles = {"CLIENT", "CLIENTE", "ADMIN", "USER"})
    public ResponseEntity<List<Detalle_pedido>> obtenerDetalles(@PathVariable Long id) {
        List<Detalle_pedido> detalles = pedidoService.obtenerDetallesPedido(id);
        return ResponseEntity.ok(detalles);
    }

    // Obtener estadísticas de pedidos (solo admin)
    @GetMapping("/estadisticas")
    @RoleBasedAccessControl(allowedRoles = {"ADMIN"})
    public ResponseEntity<PedidoService.EstadisticasPedidos> obtenerEstadisticas() {
        PedidoService.EstadisticasPedidos stats = pedidoService.obtenerEstadisticas();
        return ResponseEntity.ok(stats);
    }

    // =====================================================
    // EXPORTACIÓN CSV
    // =====================================================

    // Exportar pedidos a CSV (solo admin)
    @GetMapping("/export/csv")
    @RoleBasedAccessControl(allowedRoles = {"ADMIN"})
    public ResponseEntity<byte[]> exportarPedidosCSV() {
        try {
            List<Pedido> pedidos = pedidoService.obtenerTodosLosPedidos();

            StringBuilder csv = new StringBuilder();

            // Cabecera simple con nombre de la empresa y una línea en blanco
            csv.append("EMPRESA: ECOSALUD").append("\n");
            csv.append("\n");

            // línea decorativa
            csv.append("\"════════════════════════════════════════════════════════════════════════\"\n");

            // Encabezado de columnas (mayúsculas, separador ;)
            csv.append("ID;NOMBRES;APELLIDOS;EMAIL;TOTAL (S/);ESTADO;METODO_PAGO;FECHA_PEDIDO\n");

            // Formateador numérico (estilo español: miles con punto, decimales con coma)
            DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.forLanguageTag("es-ES"));
            symbols.setDecimalSeparator(',');
            symbols.setGroupingSeparator('.');
            DecimalFormat df = new DecimalFormat("#,##0.00", symbols);

            double sumaTotal = 0.0;

            for (Pedido p : pedidos) {
                double total = p.getTotal() != null ? p.getTotal() : 0.0;
                sumaTotal += total;

                csv.append(p.getIdPedido() != null ? p.getIdPedido() : "").append(";");

                String nombres = "";
                String apellidos = "";
                String email = "";
                if (p.getUsuario() != null) {
                    nombres = p.getUsuario().getNombres() != null ? p.getUsuario().getNombres() : "";
                    apellidos = p.getUsuario().getApellidos() != null ? p.getUsuario().getApellidos() : "";
                    email = p.getUsuario().getEmail() != null ? p.getUsuario().getEmail() : "";
                }

                // Encerrar en comillas y escapar comillas internas
                csv.append("\"").append(nombres.replace("\"", "\"\"")).append("\";");
                csv.append("\"").append(apellidos.replace("\"", "\"\"")).append("\";");
                csv.append("\"").append(email.replace("\"", "\"\"")).append("\";");

                // Total formateado
                csv.append("\"").append(df.format(total)).append("\";");

                csv.append("\"").append(p.getEstado() != null ? p.getEstado() : "PENDIENTE").append("\";");

                csv.append("\"").append(p.getMetodoPago() != null ? p.getMetodoPago().toString() : "").append("\";");

                // Fecha mostrada tal cual (toString)
                String fechaStr = p.getFechaPedido() != null ? p.getFechaPedido().toString() : "";
                csv.append("\"").append(fechaStr).append("\"");

                csv.append("\n");
            }

            // Línea vacía antes del resumen
            csv.append("\n");
            csv.append("\"────────────────────────── RESUMEN ──────────────────────────\"\n");
            csv.append("TOTAL_PEDIDOS;").append(pedidos.size()).append("\n");
            csv.append("SUMA_TOTAL;\"").append(df.format(sumaTotal)).append("\"\n");
            csv.append("\n");

            // BOM + UTF-8
            byte[] csvBytes = ("\uFEFF" + csv.toString()).getBytes(java.nio.charset.StandardCharsets.UTF_8);

            String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "pedidos_estilizado_" + timestamp + ".csv";

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
