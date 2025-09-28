package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    // obtenerTodasActivas() : Categorias[]
    @Query("SELECT c FROM Categoria c WHERE c.activo = true")
    List<Categoria> obtenerTodasActivas();
}
