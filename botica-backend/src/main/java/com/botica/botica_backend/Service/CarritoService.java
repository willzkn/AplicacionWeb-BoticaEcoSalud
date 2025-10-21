package com.botica.botica_backend.Service;

import com.botica.botica_backend.Repository.CarritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarritoService {
    private final CarritoRepository carritoRepository;

    @Transactional
    public void vaciarCarrito(Long idUsuario) {
        carritoRepository.vaciarCarrito(idUsuario);
    }

    @Transactional
    public void eliminarProducto(Long idCarrito) {
        carritoRepository.eliminarProducto(idCarrito);
    }

    @Transactional
    public void actualizarCantidad(Long idCarrito, Integer nuevaCantidad) {
        if (nuevaCantidad == null || nuevaCantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        carritoRepository.actualizarCantidad(idCarrito, nuevaCantidad);
    }
}
