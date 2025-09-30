package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Transactional
    public Producto crearProducto(Producto p) {
        if (p.getPrecio() == null || p.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (p.getStock() == null || p.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        return productoRepository.save(p);
    }

    @Transactional
    public void actualizarPrecio(Long idProducto, Double nuevoPrecio) {
        if (nuevoPrecio == null || nuevoPrecio <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        productoRepository.actualizarPrecio(idProducto, nuevoPrecio);
    }

    @Transactional
    public void actualizarStock(Long idProducto, Integer cantidad, String tipoOperacion) {
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        productoRepository.actualizarStock(idProducto, cantidad, tipoOperacion);
    }

    public boolean validarStock(Long idProducto, Integer cantidadDeseada) {
        return productoRepository.validarStock(idProducto, cantidadDeseada);
    }

    public List<Producto> obtenerAlternativas(Long idProducto) {
        return productoRepository.obtenerAlternativas(idProducto);
    }
}
