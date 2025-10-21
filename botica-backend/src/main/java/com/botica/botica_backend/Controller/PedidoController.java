package com.botica.botica_backend.Controller;

import com.botica.botica_backend.DTO.PedidoCreateDTO;
import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping("/historial/{idUsuario}")
    public ResponseEntity<List<Pedido>> historialUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(pedidoService.obtenerHistorialUsuario(idUsuario));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstado(@PathVariable("id") Long idPedido,
                                                 @RequestParam("estado") String nuevoEstado) {
        pedidoService.actualizarEstado(idPedido, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Pedido> crear(@RequestBody PedidoCreateDTO dto) {
        Pedido creado = pedidoService.crearPedidoDesdeDTO(dto);
        return ResponseEntity.created(URI.create("/api/pedidos/" + (creado.getIdPedido() != null ? creado.getIdPedido() : "")))
                .body(creado);
    }

    // Endpoints adicionales para el panel de administrador
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodos() {
        return ResponseEntity.ok(pedidoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPorId(@PathVariable Long id) {
        return pedidoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Pedido>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(pedidoService.obtenerPorEstado(estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (pedidoService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
