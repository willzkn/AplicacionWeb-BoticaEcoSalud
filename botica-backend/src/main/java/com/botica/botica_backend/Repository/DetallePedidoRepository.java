package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Detalle_pedido;
import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<Detalle_pedido, Long> {
    
    /**
     * Buscar detalles por pedido
     */
    List<Detalle_pedido> findByPedido(Pedido pedido);
    
    /**
     * Buscar detalles por producto
     */
    List<Detalle_pedido> findByProducto(Producto producto);
    
    /**
     * Obtener productos más vendidos
     */
    @Query("SELECT d.producto, SUM(d.cantidad) as totalVendido " +
           "FROM Detalle_pedido d " +
           "GROUP BY d.producto " +
           "ORDER BY totalVendido DESC")
    List<Object[]> getProductosMasVendidos();
    
    /**
     * Obtener total de unidades vendidas de un producto
     */
    @Query("SELECT SUM(d.cantidad) FROM Detalle_pedido d WHERE d.producto = :producto")
    Long getTotalUnidadesVendidas(@Param("producto") Producto producto);
    
    /**
     * Agregar detalle a un pedido
     */
    @Query(value = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) " +
                   "SELECT :idPedido, :idProducto, :cantidad, p.precio " +
                   "FROM producto p WHERE p.id_producto = :idProducto", nativeQuery = true)
    @Modifying
    void agregarDetalle(@Param("idPedido") Long idPedido, 
                       @Param("idProducto") Long idProducto, 
                       @Param("cantidad") Integer cantidad);
    
    /**
     * Obtener productos de un pedido específico
     */
    @Query("SELECT d FROM Detalle_pedido d WHERE d.pedido.idPedido = :idPedido")
    List<Detalle_pedido> obtenerProductosDelPedido(@Param("idPedido") Long idPedido);
}