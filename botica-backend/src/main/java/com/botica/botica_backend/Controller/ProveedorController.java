package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Proveedor;
import com.botica.botica_backend.Service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    // Registrar un nuevo proveedor
    @PostMapping("/register")
    public ResponseEntity<Proveedor> registrarProveedor(@RequestBody Proveedor proveedor) {
        Proveedor nuevo = proveedorService.registrarProveedor(proveedor);
        return ResponseEntity.ok(nuevo);
    }

    // Buscar proveedor por RUC
    @GetMapping("/buscar/{ruc}")
    public ResponseEntity<Proveedor> buscarPorRUC(@PathVariable String ruc) {
        Proveedor proveedor = proveedorService.buscarPorRUC(ruc);
        if (proveedor == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(proveedor);
    }

    // Obtener todos los proveedores
    @GetMapping("/all")
    public ResponseEntity<List<Proveedor>> getAllProveedores() {
        return ResponseEntity.ok(proveedorService.getAllProveedores());
    }
}