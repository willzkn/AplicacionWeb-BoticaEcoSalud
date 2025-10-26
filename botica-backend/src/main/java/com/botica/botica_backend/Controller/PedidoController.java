package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Model.Detalle_pedido;
import com.botica.botica_backend.Service.PedidoService;
import com.botica.botica_backend.Security.RoleBasedAccessControl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    // Crear pedido (disponible para clientes autenticados)
    @PostMapping("/create")
    @RoleBasedAccessControl(allowedRoles = {"CLIENT", "CLIENTE", "ADMIN"})
    public ResponseEntity<?> crearPedido(@RequestBody PedidoService.PedidoRequest pedidoRequest) {
        try {
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
    @RoleBasedAccessControl(allowedRoles = {"CLIENT", "CLIENTE", "ADMIN"})
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
    @RoleBasedAccessControl(allowedRoles = {"CLIENT", "CLIENTE", "ADMIN"})
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
            csv.append("ID,Usuario_Nombres,Usuario_Apellidos,Email_Usuario,Total,Estado,Metodo_Pago,Fecha_Pedido\n");
            
            for (Pedido p : pedidos) {
                csv.append(p.getIdPedido()).append(",");
                csv.append("\"").append(p.getUsuario() != null ? (p.getUsuario().getNombres() != null ? p.getUsuario().getNombres() : "") : "").append("\",");
                csv.append("\"").append(p.getUsuario() != null ? (p.getUsuario().getApellidos() != null ? p.getUsuario().getApellidos() : "") : "").append("\",");
                csv.append("\"").append(p.getUsuario() != null ? p.getUsuario().getEmail() : "").append("\",");
                csv.append(p.getTotal() != null ? p.getTotal() : 0.0).append(",");
                csv.append("\"").append(p.getEstado() != null ? p.getEstado() : "PENDIENTE").append("\",");
                csv.append("\"").append(p.getMetodoPago() != null ? p.getMetodoPago().toString() : "").append("\",");
                csv.append("\"").append(p.getFechaPedido() != null ? p.getFechaPedido().toString() : "").append("\"");
                csv.append("\n");
            }
            
            byte[] csvBytes = csv.toString().getBytes();
            
            String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "pedidos_" + timestamp + ".csv";
            
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .header("Content-Type", "text/csv")
                .body(csvBytes);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
