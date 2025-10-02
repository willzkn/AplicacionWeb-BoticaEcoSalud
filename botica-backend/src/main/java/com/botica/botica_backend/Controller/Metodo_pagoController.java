package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Metodo_pago;
import com.botica.botica_backend.Service.MetodoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metodos-pago")
@RequiredArgsConstructor
public class Metodo_pagoController {

    private final MetodoPagoService metodoPagoService;

    // Listar métodos de pago activos
    @GetMapping("/activos")
    public ResponseEntity<List<Metodo_pago>> obtenerMetodosActivos() {
        List<Metodo_pago> metodos = metodoPagoService.obtenerMetodosActivos();
        return ResponseEntity.ok(metodos);
    }

    // Obtener detalle de un metodo de pago
    @GetMapping("/{id}")
    public ResponseEntity<Metodo_pago> obtenerDetalle(@PathVariable Long id) {
        Metodo_pago metodo = metodoPagoService.obtenerDetalle(id);
        if (metodo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(metodo);
    }

    // Crear un nuevo metodo de pago
    @PostMapping("/create")
    public ResponseEntity<Metodo_pago> crearMetodoPago(@RequestBody Metodo_pago metodoPago) {
        Metodo_pago nuevo = metodoPagoService.crearMetodoPago(metodoPago);
        return ResponseEntity.ok(nuevo);
    }
}

