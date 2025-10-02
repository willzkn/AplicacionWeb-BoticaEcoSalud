package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Model.Metodo_pago;
import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.DTO.PedidoCreateDTO;
import com.botica.botica_backend.DTO.ItemDTO;
import com.botica.botica_backend.Repository.PedidoRepository;
import com.botica.botica_backend.Repository.UsuarioRepository;
import com.botica.botica_backend.Repository.MetodoPagoRepository;
import com.botica.botica_backend.Repository.ProductoRepository;
import com.botica.botica_backend.Repository.DetallePedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final ProductoRepository productoRepository;
    private final DetallePedidoRepository detallePedidoRepository;

    public List<Pedido> obtenerHistorialUsuario(Long idUsuario) {
        return pedidoRepository.obtenerHistorialUsuario(idUsuario);
    }

    @Transactional
    public void actualizarEstado(Long idPedido, String nuevoEstado) {
        pedidoRepository.actualizarEstado(idPedido, nuevoEstado);
    }

    @Transactional
    public Pedido crearPedido(Usuario usuario, Metodo_pago metodo, Double total) {
        Pedido p = new Pedido();
        p.setUsuario(usuario);
        p.setMetodoPago(metodo);
        p.setTotal(total);
        p.setEstado("CREADO");
        p.setFechaPedido(LocalDate.now());
        return pedidoRepository.save(p);
    }

    // Crear pedido a partir de DTO con validación de stock y cálculo de total
    @Transactional
    public Pedido crearPedidoDesdeDTO(PedidoCreateDTO dto) {
        // 1. Cargar entidades principales
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Metodo_pago metodo = metodoPagoRepository.findById(dto.getIdMetodoPago())
                .orElseThrow(() -> new IllegalArgumentException("Método de pago no encontrado"));

        // 2. Validar items y calcular total
        double total = 0.0;
        for (ItemDTO item : dto.getItems()) {
            Long idProd = item.getIdProducto();
            Integer cant = item.getCantidad();
            if (cant == null || cant <= 0) {
                throw new IllegalArgumentException("Cantidad inválida para producto " + idProd);
            }
            boolean hayStock = productoRepository.validarStock(idProd, cant);
            if (!hayStock) {
                throw new IllegalStateException("Stock insuficiente para producto " + idProd);
            }
            Producto prod = productoRepository.findById(idProd)
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + idProd));
            total += (prod.getPrecio() != null ? prod.getPrecio() : 0.0) * cant;
        }

        // 3. Crear pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setMetodoPago(metodo);
        pedido.setTotal(total);
        pedido.setEstado("CREADO");
        pedido.setFechaPedido(LocalDate.now());
        pedido = pedidoRepository.save(pedido);

        // 4. Crear detalles e impactar stock
        for (ItemDTO item : dto.getItems()) {
            detallePedidoRepository.agregarDetalle(pedido.getIdPedido(), item.getIdProducto(), item.getCantidad());
            // Si no usas triggers para stock, descomenta la siguiente línea para decrementar stock
            productoRepository.actualizarStock(item.getIdProducto(), item.getCantidad(), "SALIDA");
        }

        return pedido;
    }

    // Nuevo metodo para listar todos los pedidos
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }
}


