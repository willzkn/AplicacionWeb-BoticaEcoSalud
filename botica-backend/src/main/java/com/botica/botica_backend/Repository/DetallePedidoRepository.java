package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Detalle_pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<Detalle_pedido, Long> {
    // agregarDetalle(id_pedido, id_producto, cantidad)
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) " +
            "VALUES (:idPedido, :idProducto, :cantidad, " +
            "(SELECT p.precio FROM productos p WHERE p.id_producto = :idProducto), " +
            "(SELECT p.precio FROM productos p WHERE p.id_producto = :idProducto) * :cantidad)",
            nativeQuery = true)
    void agregarDetalle(
            @Param("idPedido") Long idPedido,
            @Param("idProducto") Long idProducto,
            @Param("cantidad") Integer cantidad
    );

    // obtenerProductosDelPedido(id_pedido) : Detalle_pedido[]
    @Query("SELECT d FROM Detalle_pedido d WHERE d.pedido.idPedido = :idPedido")
    List<Detalle_pedido> obtenerProductosDelPedido(@Param("idPedido") Long idPedido);
}
