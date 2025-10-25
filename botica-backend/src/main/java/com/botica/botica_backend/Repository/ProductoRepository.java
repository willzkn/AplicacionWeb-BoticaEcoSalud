package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // =====================================================
    // CONSULTAS BÁSICAS CRUD
    // =====================================================
    
    // Buscar productos activos
    List<Producto> findByActivoTrue();
    
    // Buscar por nombre (case insensitive)
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    
    // Buscar por categoría
    List<Producto> findByCategoriaIdCategoria(Long categoriaId);
    
    // Productos con stock bajo
    List<Producto> findByStockLessThanAndActivoTrue(Integer limite);
    
    // =====================================================
    // CONSULTAS PERSONALIZADAS
    // =====================================================
    
    // actualizarPrecio(id, nuevoPrecio)
    @Modifying
    @Transactional
    @Query("UPDATE Producto p SET p.precio = :nuevoPrecio WHERE p.idProducto = :id")
    void actualizarPrecio(
            @Param("id") Long idProducto,
            @Param("nuevoPrecio") Double nuevoPrecio
    );

    // actualizarStock(id, cantidad, tipoOperacion)
    @Modifying
    @Transactional
    @Query("UPDATE Producto p SET p.stock = p.stock + :cantidad * CASE WHEN :tipoOperacion = 'ENTRADA' THEN 1 ELSE -1 END WHERE p.idProducto = :id")
    void actualizarStock(
            @Param("id") Long idProducto,
            @Param("cantidad") Integer cantidad,
            @Param("tipoOperacion") String tipoOperacion
    );

    // validarStock(id, cantidadDeseada) : boolean
    @Query("SELECT CASE WHEN (p.stock >= :cantidadDeseada) THEN true ELSE false END FROM Producto p WHERE p.idProducto = :id")
    boolean validarStock(
            @Param("id") Long idProducto,
            @Param("cantidadDeseada") Integer cantidadDeseada
    );

    // obtenerAlternativas(id_producto) : Productos[]
    @Query("SELECT p2 FROM Producto p1, Producto p2 WHERE p1.idProducto = :idProducto AND p1.categoria.idCategoria = p2.categoria.idCategoria AND p1.idProducto <> p2.idProducto AND p2.activo = true")
    List<Producto> obtenerAlternativas(@Param("idProducto") Long idProducto);
}
