package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        Producto creado = productoService.crearProducto(producto);
        return ResponseEntity.created(URI.create("/api/productos/" + (creado.getIdProducto() != null ? creado.getIdProducto() : "")))
                .body(creado);
    }

    @PatchMapping("/{id}/precio")
    public ResponseEntity<Void> actualizarPrecio(@PathVariable("id") Long idProducto,
                                                 @RequestParam("precio") Double nuevoPrecio) {
        productoService.actualizarPrecio(idProducto, nuevoPrecio);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Void> actualizarStock(@PathVariable("id") Long idProducto,
                                                @RequestParam("cantidad") Integer cantidad,
                                                @RequestParam("tipoOperacion") String tipoOperacion) {
        productoService.actualizarStock(idProducto, cantidad, tipoOperacion);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/validar-stock")
    public ResponseEntity<Boolean> validarStock(@PathVariable("id") Long idProducto,
                                                @RequestParam("cantidad") Integer cantidadDeseada) {
        boolean ok = productoService.validarStock(idProducto, cantidadDeseada);
        return ResponseEntity.ok(ok);
    }

    @GetMapping("/{id}/alternativas")
    public ResponseEntity<List<Producto>> obtenerAlternativas(@PathVariable("id") Long idProducto) {
        return ResponseEntity.ok(productoService.obtenerAlternativas(idProducto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable("id") Long idProducto) {
        return productoService.obtenerPorId(idProducto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable("id") Long idProducto, @RequestBody Producto producto) {
        return productoService.actualizar(idProducto, producto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long idProducto) {
        if (productoService.eliminar(idProducto)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
