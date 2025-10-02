package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    // Obtener todas las categorías activas
    @GetMapping("/activas")
    public ResponseEntity<List<Categoria>> obtenerTodasActivas() {
        List<Categoria> categorias = categoriaService.obtenerTodasActivas();
        if (categorias.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(categorias);
    }

    // Crear nueva categoría
    @PostMapping("/crear")
    public ResponseEntity<Categoria> crearCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria creada = categoriaService.crearCategoria(categoria);
            return ResponseEntity.ok(creada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Desactivar categoría por ID
    @PutMapping("/desactivar/{id}")
    public ResponseEntity<String> desactivarCategoria(@PathVariable Long id) {
        try {
            categoriaService.desactivarCategoria(id);
            return ResponseEntity.ok("Categoría desactivada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Categoria>> listarTodas() {
        List<Categoria> categorias = categoriaService.listarTodas();
        if (categorias.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(categorias);
    }

}
