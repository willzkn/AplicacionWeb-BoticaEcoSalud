package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Metodo_pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetodoPagoRepository extends JpaRepository<Metodo_pago, Long> {
    @Query("SELECT m FROM Metodo_pago m WHERE m.activo = true")
    List<Metodo_pago> obtenerMetodosActivos();

    @Query("SELECT m FROM Metodo_pago m WHERE m.idMetodoPago = :id")
    Metodo_pago obtenerDetalle(@Param("id") Long id);
}
