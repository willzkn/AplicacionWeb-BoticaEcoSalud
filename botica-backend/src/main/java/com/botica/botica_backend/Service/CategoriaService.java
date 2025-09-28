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
        c.setActivo(Boolean.TRUE);
        return categoriaRepository.save(c);
    }

    @Transactional
    public void desactivarCategoria(Long id) {
        categoriaRepository.findById(id).ifPresent(c -> {
            c.setActivo(Boolean.FALSE);
            categoriaRepository.save(c);
        });
    }
}
