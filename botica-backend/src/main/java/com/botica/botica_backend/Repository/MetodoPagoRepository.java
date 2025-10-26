package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Metodo_pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoRepository extends JpaRepository<Metodo_pago, Long> {
    
    /**
     * Buscar métodos de pago activos
     */
    List<Metodo_pago> findByActivoTrue();
    
    /**
     * Buscar método de pago por nombre
     */
    Metodo_pago findByNombre(String nombre);
    
    /**
     * Obtener métodos de pago activos (alias para findByActivoTrue)
     */
    @Query("SELECT m FROM Metodo_pago m WHERE m.activo = true")
    List<Metodo_pago> obtenerMetodosActivos();
    
    /**
     * Obtener detalle de un método de pago por ID
     */
    @Query("SELECT m FROM Metodo_pago m WHERE m.idMetodoPago = :id")
    Optional<Metodo_pago> obtenerDetalle(@Param("id") Long id);
}