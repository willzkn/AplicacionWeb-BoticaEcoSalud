package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    // vaciarCarrito(id_usuario) : void
    @Modifying
    @Transactional
    @Query("DELETE FROM Carrito c WHERE c.usuario.idUsuario = :idUsuario")
    void vaciarCarrito(@Param("idUsuario") Long idUsuario);

    // eliminarProducto(id_carrito)
    @Modifying
    @Transactional
    @Query("DELETE FROM Carrito c WHERE c.idCarrito = :idCarrito")
    void eliminarProducto(@Param("idCarrito") Long idCarrito);

    // actualizarCantidad(id_carrito, nuevaCantidad)
    @Modifying
    @Transactional
    @Query("UPDATE Carrito c SET c.cantidad = :nuevaCantidad WHERE c.idCarrito = :idCarrito")
    void actualizarCantidad(
            @Param("idCarrito") Long idCarrito,
            @Param("nuevaCantidad") Integer nuevaCantidad
    );
}
