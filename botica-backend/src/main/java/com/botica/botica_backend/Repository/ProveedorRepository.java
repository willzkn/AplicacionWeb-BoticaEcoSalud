package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    
    // =====================================================
    // CONSULTAS BÁSICAS CRUD
    // =====================================================
    
    // Buscar por RUC
    @Query("SELECT p FROM Proveedor p WHERE p.RUC = :ruc")
    Proveedor buscarPorRUC(@Param("ruc") String ruc);
    
    // Buscar proveedores activos
    List<Proveedor> findByEstadoTrue();
    
    // Buscar por nombre comercial (case insensitive)
    List<Proveedor> findByNombreComercialContainingIgnoreCase(String nombre);
    
    // Buscar por tipo de producto (case insensitive)
    List<Proveedor> findByTipoProductoContainingIgnoreCase(String tipo);
    
    // =====================================================
    // CONSULTAS PERSONALIZADAS
    // =====================================================
    
    // Contar productos por proveedor
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.proveedor.idProveedor = :proveedorId")
    Long contarProductosPorProveedor(@Param("proveedorId") Long proveedorId);
}
