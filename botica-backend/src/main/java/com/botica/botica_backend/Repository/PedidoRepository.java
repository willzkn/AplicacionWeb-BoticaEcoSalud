package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    /**
     * Buscar pedidos por usuario
     */
    List<Pedido> findByUsuarioOrderByFechaPedidoDesc(Usuario usuario);
    
    /**
     * Buscar pedidos por estado
     */
    List<Pedido> findByEstadoOrderByFechaPedidoDesc(String estado);
    
    /**
     * Buscar pedidos por rango de fechas
     */
    List<Pedido> findByFechaPedidoBetweenOrderByFechaPedidoDesc(LocalDate fechaInicio, LocalDate fechaFin);
    
    /**
     * Buscar pedidos por usuario y estado
     */
    List<Pedido> findByUsuarioAndEstadoOrderByFechaPedidoDesc(Usuario usuario, String estado);
    
    /**
     * Obtener pedidos recientes (últimos 30 días)
     */
    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido >= :fechaInicio ORDER BY p.fechaPedido DESC")
    List<Pedido> findPedidosRecientes(@Param("fechaInicio") LocalDate fechaInicio);
    
    /**
     * Obtener total de ventas por fecha
     */
    @Query("SELECT SUM(p.total) FROM Pedido p WHERE p.fechaPedido = :fecha AND p.estado = 'COMPLETADO'")
    Double getTotalVentasPorFecha(@Param("fecha") LocalDate fecha);
    
    /**
     * Contar pedidos por estado
     */
    Long countByEstado(String estado);
    
    /**
     * Obtener pedidos ordenados por fecha descendente
     */
    List<Pedido> findAllByOrderByFechaPedidoDesc();
}