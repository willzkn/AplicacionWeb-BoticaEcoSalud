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
}
