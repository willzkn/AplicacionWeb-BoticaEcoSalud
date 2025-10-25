package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    // =====================================================
    // OPERACIONES CRUD COMPLETAS
    // =====================================================

    // CREATE
    @Transactional
    public Categoria crearCategoria(Categoria c) {
        // Validaciones
        if (c.getNombre() == null || c.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
        
        // Verificar que no exista una categoría con el mismo nombre
        if (categoriaRepository.existsByNombreIgnoreCase(c.getNombre())) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }
        
        // Valores por defecto
        c.setActivo(Boolean.TRUE);
        if (c.getFechaCreacion() == null) {
            c.setFechaCreacion(LocalDate.now());
        }
        
        return categoriaRepository.save(c);
    }

    // READ
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> obtenerPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    public List<Categoria> obtenerTodasActivas() {
        return categoriaRepository.obtenerTodasActivas();
    }

    public List<Categoria> buscarPorNombre(String nombre) {
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre);
    }

    // UPDATE
    @Transactional
    public Categoria actualizarCategoria(Categoria categoria) {
        // Verificar que la categoría existe
        Optional<Categoria> existente = categoriaRepository.findById(categoria.getIdCategoria());
        if (existente.isEmpty()) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }

        // Validaciones
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }

        // Verificar que no exista otra categoría con el mismo nombre
        Optional<Categoria> otraCategoria = categoriaRepository.findByNombreIgnoreCaseAndIdCategoriaNotIn(
            categoria.getNombre(), categoria.getIdCategoria());
        if (otraCategoria.isPresent()) {
            throw new IllegalArgumentException("Ya existe otra categoría con ese nombre");
        }

        // Mantener fecha de creación original
        Categoria original = existente.get();
        categoria.setFechaCreacion(original.getFechaCreacion());

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public void cambiarEstado(Long id, Boolean activo) {
        Optional<Categoria> categoria = categoriaRepository.findById(id);
        if (categoria.isEmpty()) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
        
        Categoria c = categoria.get();
        c.setActivo(activo);
        categoriaRepository.save(c);
    }

    @Transactional
    public void desactivarCategoria(Long id) {
        cambiarEstado(id, false);
    }

    // DELETE (Hard delete con validaciones)
    @Transactional
    public void eliminarCategoria(Long id) {
        Optional<Categoria> categoria = categoriaRepository.findById(id);
        if (categoria.isEmpty()) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
        
        // Verificar si tiene productos asociados
        Long productosCount = categoriaRepository.contarProductosPorCategoria(id);
        if (productosCount > 0) {
            throw new IllegalArgumentException("No se puede eliminar la categoría porque tiene " + productosCount + " productos asociados. Desactívela en su lugar.");
        }
        
        // Hard delete - eliminar completamente
        categoriaRepository.deleteById(id);
    }

    // =====================================================
    // OPERACIONES ESPECIALES
    // =====================================================

    public Long contarProductosPorCategoria(Long categoriaId) {
        return categoriaRepository.contarProductosPorCategoria(categoriaId);
    }
}
