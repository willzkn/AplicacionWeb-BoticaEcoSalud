package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    // Listar todos los productos
    @GetMapping("/all")
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    // Crear un nuevo producto
    @PostMapping("/create")
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        Producto nuevo = productoService.crearProducto(producto);
        return ResponseEntity.ok(nuevo);
    }

    // Actualizar precio
    @PutMapping("/{id}/precio")
    public ResponseEntity<Void> actualizarPrecio(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body
    ) {
        Double nuevoPrecio = body.get("nuevoPrecio");
        productoService.actualizarPrecio(id, nuevoPrecio);
        return ResponseEntity.noContent().build();
    }

    // Actualizar stock
    @PutMapping("/{id}/stock")
    public ResponseEntity<Void> actualizarStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        Integer cantidad = (Integer) body.get("cantidad");
        String tipoOperacion = (String) body.get("tipoOperacion"); // "ENTRADA" o "SALIDA"
        productoService.actualizarStock(id, cantidad, tipoOperacion);
        return ResponseEntity.noContent().build();
    }

    // Validar stock
    @GetMapping("/{id}/validarStock")
    public ResponseEntity<Boolean> validarStock(
            @PathVariable Long id,
            @RequestParam Integer cantidad
    ) {
        boolean valido = productoService.validarStock(id, cantidad);
        return ResponseEntity.ok(valido);
    }

    // Obtener productos alternativos (misma categoría)
    @GetMapping("/{id}/alternativas")
    public ResponseEntity<List<Producto>> obtenerAlternativas(@PathVariable Long id) {
        List<Producto> alternativas = productoService.obtenerAlternativas(id);
        return ResponseEntity.ok(alternativas);
    }
}
