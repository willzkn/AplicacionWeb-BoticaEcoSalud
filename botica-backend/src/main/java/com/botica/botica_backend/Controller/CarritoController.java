package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Carrito;
import com.botica.botica_backend.Service.CarritoService;
import com.botica.botica_backend.Repository.CarritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;
    private final CarritoRepository carritoRepository;

    // Obtener todos los productos del carrito de un usuario
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Carrito>> obtenerCarritoPorUsuario(@PathVariable Long idUsuario) {
        List<Carrito> carrito = carritoRepository.findAll()
                .stream()
                .filter(c -> c.getUsuario().getIdUsuario().equals(idUsuario))
                .toList();

        if (carrito.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(carrito);
    }

    // Agregar un producto al carrito
    @PostMapping("/agregar")
    public ResponseEntity<Carrito> agregarProducto(@RequestBody Carrito carrito) {
        try {
            Carrito nuevo = carritoRepository.save(carrito);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Actualizar la cantidad de un producto en el carrito
    @PutMapping("/actualizar/{idCarrito}")
    public ResponseEntity<String> actualizarCantidad(
            @PathVariable Long idCarrito,
            @RequestParam Integer nuevaCantidad
    ) {
        try {
            carritoService.actualizarCantidad(idCarrito, nuevaCantidad);
            return ResponseEntity.ok("Cantidad actualizada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Eliminar un producto del carrito
    @DeleteMapping("/eliminar/{idCarrito}")
    public ResponseEntity<String> eliminarProducto(@PathVariable Long idCarrito) {
        try {
            carritoService.eliminarProducto(idCarrito);
            return ResponseEntity.ok("Producto eliminado del carrito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Vaciar el carrito de un usuario
    @DeleteMapping("/vaciar/{idUsuario}")
    public ResponseEntity<String> vaciarCarrito(@PathVariable Long idUsuario) {
        try {
            carritoService.vaciarCarrito(idUsuario);
            return ResponseEntity.ok("Carrito vaciado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

