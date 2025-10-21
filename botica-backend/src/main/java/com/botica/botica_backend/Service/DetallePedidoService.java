package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Detalle_pedido;
import com.botica.botica_backend.Repository.DetallePedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DetallePedidoService {
    private final DetallePedidoRepository detallePedidoRepository;

    @Transactional
    public void agregarDetalle(Long idPedido, Long idProducto, Integer cantidad) {
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        detallePedidoRepository.agregarDetalle(idPedido, idProducto, cantidad);
    }

    public List<Detalle_pedido> obtenerProductosDelPedido(Long idPedido) {
        return detallePedidoRepository.obtenerProductosDelPedido(idPedido);
    }
}
