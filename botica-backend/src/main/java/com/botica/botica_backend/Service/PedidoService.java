package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.*;
import com.botica.botica_backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final CarritoRepository carritoRepository;

    /**
     * Crear un nuevo pedido con sus detalles
     */
    @Transactional
    public Pedido crearPedido(PedidoRequest pedidoRequest) {
        // Validar usuario
        Usuario usuario = usuarioRepository.findById(pedidoRequest.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar método de pago
        Metodo_pago metodoPago = metodoPagoRepository.findById(pedidoRequest.getIdMetodoPago())
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));

        // Crear el pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setMetodoPago(metodoPago);
        pedido.setFechaPedido(LocalDate.now());
        pedido.setEstado("PENDIENTE");
        pedido.setTotal(0.0);

        // Guardar el pedido primero para obtener el ID
        pedido = pedidoRepository.save(pedido);

        // Procesar los detalles del pedido
        double totalPedido = 0.0;
        for (DetallePedidoRequest detalleRequest : pedidoRequest.getDetalles()) {
            Producto producto = productoRepository.findById(detalleRequest.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalleRequest.getIdProducto()));

            // Verificar stock disponible
            if (producto.getStock() < detalleRequest.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            // Crear detalle del pedido
            Detalle_pedido detalle = new Detalle_pedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(detalleRequest.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(producto.getPrecio() * detalleRequest.getCantidad());

            detallePedidoRepository.save(detalle);

            // Actualizar stock del producto
            producto.setStock(producto.getStock() - detalleRequest.getCantidad());
            productoRepository.save(producto);

            totalPedido += detalle.getSubtotal();
        }

        // Actualizar el total del pedido
        pedido.setTotal(totalPedido);
        pedido = pedidoRepository.save(pedido);
        
        // Cargar los detalles del pedido para devolverlos en la respuesta
        List<Detalle_pedido> detalles = detallePedidoRepository.findByPedido(pedido);
        pedido.setDetalles(detalles);
        
        return pedido;
    }

    /**
     * Obtener todos los pedidos
     */
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAllByOrderByFechaPedidoDesc();
    }

    /**
     * Obtener pedidos por usuario
     */
    public List<Pedido> obtenerPedidosPorUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return pedidoRepository.findByUsuarioOrderByFechaPedidoDesc(usuario);
    }

    /**
     * Obtener pedido por ID
     */
    public Optional<Pedido> obtenerPedidoPorId(Long id) {
        return pedidoRepository.findById(id);
    }

    /**
     * Obtener detalles de un pedido
     */
    public List<Detalle_pedido> obtenerDetallesPedido(Long idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        return detallePedidoRepository.findByPedido(pedido);
    }

    /**
     * Actualizar estado del pedido
     */
    @Transactional
    public Pedido actualizarEstadoPedido(Long idPedido, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        pedido.setEstado(nuevoEstado);
        return pedidoRepository.save(pedido);
    }

    /**
     * Obtener pedidos por estado
     */
    public List<Pedido> obtenerPedidosPorEstado(String estado) {
        return pedidoRepository.findByEstadoOrderByFechaPedidoDesc(estado);
    }

    /**
     * Obtener estadísticas de pedidos
     */
    public EstadisticasPedidos obtenerEstadisticas() {
        EstadisticasPedidos stats = new EstadisticasPedidos();
        stats.setTotalPedidos(pedidoRepository.count());
        stats.setPedidosPendientes(pedidoRepository.countByEstado("PENDIENTE"));
        stats.setPedidosCompletados(pedidoRepository.countByEstado("COMPLETADO"));
        stats.setPedidosCancelados(pedidoRepository.countByEstado("CANCELADO"));
        
        // Ventas del día
        Double ventasHoy = pedidoRepository.getTotalVentasPorFecha(LocalDate.now());
        stats.setVentasHoy(ventasHoy != null ? ventasHoy : 0.0);
        
        return stats;
    }

    /**
     * Crear pedido desde el carrito del usuario
     */
    @Transactional
    public Pedido crearPedidoDesdeCarrito(Long idUsuario, Long idMetodoPago) {
        // Validar usuario
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar método de pago
        Metodo_pago metodoPago = metodoPagoRepository.findById(idMetodoPago)
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));

        // Obtener items del carrito
        List<Carrito> itemsCarrito = carritoRepository.findByUsuario(usuario);
        
        if (itemsCarrito.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // Crear el pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setMetodoPago(metodoPago);
        pedido.setFechaPedido(LocalDate.now());
        pedido.setEstado("PENDIENTE");
        pedido.setTotal(0.0);

        // Guardar el pedido primero para obtener el ID
        pedido = pedidoRepository.save(pedido);

        // Procesar los items del carrito
        double totalPedido = 0.0;
        for (Carrito itemCarrito : itemsCarrito) {
            Producto producto = itemCarrito.getProducto();
            Integer cantidad = itemCarrito.getCantidad();

            // Verificar stock disponible
            if (producto.getStock() < cantidad) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            // Crear detalle del pedido
            Detalle_pedido detalle = new Detalle_pedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(producto.getPrecio() * cantidad);

            detallePedidoRepository.save(detalle);

            // Actualizar stock del producto
            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto);

            totalPedido += detalle.getSubtotal();
        }

        // Actualizar el total del pedido
        pedido.setTotal(totalPedido);
        pedido = pedidoRepository.save(pedido);

        // Vaciar el carrito después de crear el pedido
        carritoRepository.vaciarCarrito(idUsuario);

        return pedido;
    }

    /**
     * Clases auxiliares para requests y responses
     */
    public static class PedidoRequest {
        private Long idUsuario;
        private Long idMetodoPago;
        private List<DetallePedidoRequest> detalles;

        // Getters y setters
        public Long getIdUsuario() { return idUsuario; }
        public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
        
        public Long getIdMetodoPago() { return idMetodoPago; }
        public void setIdMetodoPago(Long idMetodoPago) { this.idMetodoPago = idMetodoPago; }
        
        public List<DetallePedidoRequest> getDetalles() { return detalles; }
        public void setDetalles(List<DetallePedidoRequest> detalles) { this.detalles = detalles; }
    }

    public static class DetallePedidoRequest {
        private Long idProducto;
        private Integer cantidad;

        // Getters y setters
        public Long getIdProducto() { return idProducto; }
        public void setIdProducto(Long idProducto) { this.idProducto = idProducto; }
        
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }

    public static class EstadisticasPedidos {
        private Long totalPedidos;
        private Long pedidosPendientes;
        private Long pedidosCompletados;
        private Long pedidosCancelados;
        private Double ventasHoy;

        // Getters y setters
        public Long getTotalPedidos() { return totalPedidos; }
        public void setTotalPedidos(Long totalPedidos) { this.totalPedidos = totalPedidos; }
        
        public Long getPedidosPendientes() { return pedidosPendientes; }
        public void setPedidosPendientes(Long pedidosPendientes) { this.pedidosPendientes = pedidosPendientes; }
        
        public Long getPedidosCompletados() { return pedidosCompletados; }
        public void setPedidosCompletados(Long pedidosCompletados) { this.pedidosCompletados = pedidosCompletados; }
        
        public Long getPedidosCancelados() { return pedidosCancelados; }
        public void setPedidosCancelados(Long pedidosCancelados) { this.pedidosCancelados = pedidosCancelados; }
        
        public Double getVentasHoy() { return ventasHoy; }
        public void setVentasHoy(Double ventasHoy) { this.ventasHoy = ventasHoy; }
    }
}