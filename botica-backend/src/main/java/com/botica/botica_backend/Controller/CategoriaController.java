package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<Categoria>> obtenerTodas() {
        return ResponseEntity.ok(categoriaService.obtenerTodasActivas());
    }

    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria categoria) {
        Categoria creada = categoriaService.crearCategoria(categoria);
        return ResponseEntity.created(URI.create("/api/categorias/" + (creada.getIdCategoria() != null ? creada.getIdCategoria() : "")))
                .body(creada);
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable("id") Long idCategoria) {
        categoriaService.desactivarCategoria(idCategoria);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> obtenerPorId(@PathVariable("id") Long idCategoria) {
        return categoriaService.obtenerPorId(idCategoria)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizar(@PathVariable("id") Long idCategoria, @RequestBody Categoria categoria) {
        return categoriaService.actualizar(idCategoria, categoria)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long idCategoria) {
        if (categoriaService.eliminar(idCategoria)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/todas")
    public ResponseEntity<List<Categoria>> obtenerTodasInclusoInactivas() {
        return ResponseEntity.ok(categoriaService.obtenerTodas());
    }
}
