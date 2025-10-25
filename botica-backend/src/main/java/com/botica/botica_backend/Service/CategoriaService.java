package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    public List<Categoria> obtenerTodasActivas() {
        return categoriaRepository.obtenerTodasActivas();
    }

    @Transactional
    public Categoria crearCategoria(Categoria c) {
        if (c.getActivo() == null) {
            c.setActivo(Boolean.TRUE);
        }
        if (c.getFechaCreacion() == null) {
            c.setFechaCreacion(java.time.LocalDate.now());
        }
        return categoriaRepository.save(c);
    }

    @Transactional
    public void desactivarCategoria(Long id) {
        categoriaRepository.findById(id).ifPresent(c -> {
            c.setActivo(Boolean.FALSE);
            categoriaRepository.save(c);
        });
    }

    @Transactional
    public void activarCategoria(Long id) {
        categoriaRepository.findById(id).ifPresent(c -> {
            c.setActivo(Boolean.TRUE);
            categoriaRepository.save(c);
        });
    }

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public java.util.Optional<Categoria> obtenerPorId(Long idCategoria) {
        return categoriaRepository.findById(idCategoria);
    }

    @Transactional
    public java.util.Optional<Categoria> actualizar(Long idCategoria, Categoria categoria) {
        return categoriaRepository.findById(idCategoria)
                .map(existente -> {
                    existente.setNombre(categoria.getNombre());
                    existente.setDescripcion(categoria.getDescripcion());
                    existente.setActivo(categoria.getActivo());
                    return categoriaRepository.save(existente);
                });
    }

    @Transactional
    public boolean eliminar(Long idCategoria) {
        if (categoriaRepository.existsById(idCategoria)) {
            categoriaRepository.deleteById(idCategoria);
            return true;
        }
        return false;
    }

    public List<Categoria> obtenerTodas() {
        return categoriaRepository.findAll();
    }

}
