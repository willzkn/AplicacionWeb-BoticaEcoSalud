package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    // actualizarEstado(id, nuevoEstado)
    @Modifying
    @Transactional
    @Query("UPDATE Pedido p SET p.estado = :nuevoEstado WHERE p.idPedido = :id")
    void actualizarEstado(
            @Param("id") Long idPedido,
            @Param("nuevoEstado") String nuevoEstado
    );

    // obtenerHistorialUsuario(id_usuario) : Pedidos[]
    @Query("SELECT p FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario")
    List<Pedido> obtenerHistorialUsuario(@Param("idUsuario") Long idUsuario);
}
