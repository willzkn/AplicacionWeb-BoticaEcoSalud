package com.botica.botica_backend.Controller;

import com.botica.botica_backend.DTO.PedidoCreateDTO;
import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Service.PedidoService;
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

    // Crear pedido a partir de DTO (con validación de stock)
    @PostMapping("/create")
    public ResponseEntity<Pedido> crearPedido(@RequestBody PedidoCreateDTO dto) {
        Pedido nuevo = pedidoService.crearPedidoDesdeDTO(dto);
        return ResponseEntity.ok(nuevo);
    }

    // Actualizar estado de un pedido
    @PutMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String nuevoEstado = body.get("nuevoEstado");
        pedidoService.actualizarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    // Obtener historial de pedidos de un usuario
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Pedido>> historialUsuario(@PathVariable Long idUsuario) {
        List<Pedido> historial = pedidoService.obtenerHistorialUsuario(idUsuario);
        return ResponseEntity.ok(historial);
    }

    // Listar todos los pedidos
    @GetMapping("/all")
    public ResponseEntity<List<Pedido>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    // =====================================================
    // EXPORTACIÓN CSV
    // =====================================================

    // Exportar pedidos a CSV
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportarPedidosCSV() {
        try {
            List<Pedido> pedidos = pedidoService.listarTodos();
            
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
