package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    @Query("SELECT p FROM Proveedor p WHERE p.RUC = :ruc")
    Proveedor buscarPorRUC(@Param("ruc") String ruc);
}
