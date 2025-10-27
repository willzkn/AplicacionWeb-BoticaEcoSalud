package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Carrito;
import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Repository.CarritoRepository;
import com.botica.botica_backend.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarritoService {
    private final CarritoRepository carritoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Carrito> obtenerCarritoPorUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return carritoRepository.findByUsuario(usuario);
    }

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
