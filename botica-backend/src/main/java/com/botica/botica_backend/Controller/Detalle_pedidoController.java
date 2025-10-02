package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Detalle_pedido;
import com.botica.botica_backend.Service.DetallePedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalles-pedido")
@RequiredArgsConstructor
public class Detalle_pedidoController {
    private final DetallePedidoService detallePedidoService;

    // Agregar detalle a un pedido
    @PostMapping("/agregar")
    public ResponseEntity<String> agregarDetalle(
            @RequestParam Long idPedido,
            @RequestParam Long idProducto,
            @RequestParam Integer cantidad
    ) {
        try {
            detallePedidoService.agregarDetalle(idPedido, idProducto, cantidad);
            return ResponseEntity.ok("Detalle agregado correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al agregar detalle: " + e.getMessage());
        }
    }

    // Obtener todos los productos de un pedido
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<List<Detalle_pedido>> obtenerProductosDelPedido(@PathVariable Long idPedido) {
        List<Detalle_pedido> detalles = detallePedidoService.obtenerProductosDelPedido(idPedido);
        if (detalles.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(detalles);
    }
}

