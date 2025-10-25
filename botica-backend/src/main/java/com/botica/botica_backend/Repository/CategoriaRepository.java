package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    // =====================================================
    // CONSULTAS BÁSICAS CRUD
    // =====================================================
    
    // Verificar si existe por nombre (case insensitive)
    boolean existsByNombreIgnoreCase(String nombre);
    
    // Buscar por nombre excluyendo un ID específico
    @Query("SELECT c FROM Categoria c WHERE LOWER(c.nombre) = LOWER(:nombre) AND c.idCategoria != :id")
    Optional<Categoria> findByNombreIgnoreCaseAndIdCategoriaNotIn(@Param("nombre") String nombre, @Param("id") Long id);
    
    // Buscar por nombre (case insensitive)
    List<Categoria> findByNombreContainingIgnoreCase(String nombre);
    
    // =====================================================
    // CONSULTAS PERSONALIZADAS
    // =====================================================
    
    // obtenerTodasActivas() : Categorias[]
    @Query("SELECT c FROM Categoria c WHERE c.activo = true")
    List<Categoria> obtenerTodasActivas();
    
    // Contar productos por categoría
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.categoria.idCategoria = :categoriaId")
    Long contarProductosPorCategoria(@Param("categoriaId") Long categoriaId);
}
