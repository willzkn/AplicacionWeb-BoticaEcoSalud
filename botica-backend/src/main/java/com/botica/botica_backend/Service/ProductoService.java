package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;

    // =====================================================
    // OPERACIONES CRUD COMPLETAS
    // =====================================================

    // CREATE
    @Transactional
    public Producto crearProducto(Producto p) {
        // Validaciones
        if (p.getNombre() == null || p.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }
        if (p.getPrecio() == null || p.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (p.getStock() == null || p.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        
        // Valores por defecto
        if (p.getActivo() == null) {
            p.setActivo(true);
        }
        if (p.getFechaCreacion() == null) {
            p.setFechaCreacion(LocalDate.now());
        }
        
        return productoRepository.save(p);
    }

    // READ
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    public List<Producto> listarActivos() {
        return productoRepository.findByActivoTrue();
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Producto> listarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaIdCategoria(categoriaId);
    }

    // UPDATE
    @Transactional
    public Producto actualizarProducto(Producto producto) {
        // Verificar que el producto existe
        Optional<Producto> existente = productoRepository.findById(producto.getIdProducto());
        if (existente.isEmpty()) {
            throw new IllegalArgumentException("Producto no encontrado");
        }

        // Validaciones
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }
        if (producto.getPrecio() == null || producto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }

        // Mantener fecha de creación original
        Producto original = existente.get();
        producto.setFechaCreacion(original.getFechaCreacion());

        return productoRepository.save(producto);
    }

    @Transactional
    public void actualizarPrecio(Long idProducto, Double nuevoPrecio) {
        if (nuevoPrecio == null || nuevoPrecio <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (!productoRepository.existsById(idProducto)) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        productoRepository.actualizarPrecio(idProducto, nuevoPrecio);
    }

    @Transactional
    public void actualizarStock(Long idProducto, Integer cantidad, String tipoOperacion) {
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        if (!productoRepository.existsById(idProducto)) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        productoRepository.actualizarStock(idProducto, cantidad, tipoOperacion);
    }

    @Transactional
    public void cambiarEstado(Long idProducto, Boolean activo) {
        Optional<Producto> producto = productoRepository.findById(idProducto);
        if (producto.isEmpty()) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        
        Producto p = producto.get();
        p.setActivo(activo);
        productoRepository.save(p);
    }

    @Transactional
    public void desactivarProducto(Long idProducto) {
        cambiarEstado(idProducto, false);
    }

    // DELETE (Hard delete)
    @Transactional
    public void eliminarProducto(Long idProducto) {
        Optional<Producto> producto = productoRepository.findById(idProducto);
        if (producto.isEmpty()) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        
        // Verificar si el producto está en pedidos o carritos
        // Si está en uso, solo desactivar; si no, eliminar completamente
        try {
            productoRepository.deleteById(idProducto);
        } catch (Exception e) {
            // Si hay error por restricciones de FK, hacer soft delete
            Producto p = producto.get();
            p.setActivo(false);
            productoRepository.save(p);
            throw new IllegalArgumentException("No se puede eliminar el producto porque está en uso. Se ha desactivado en su lugar.");
        }
    }

    // =====================================================
    // OPERACIONES ESPECIALES
    // =====================================================

    public boolean validarStock(Long idProducto, Integer cantidadDeseada) {
        return productoRepository.validarStock(idProducto, cantidadDeseada);
    }

    public List<Producto> obtenerAlternativas(Long idProducto) {
        return productoRepository.obtenerAlternativas(idProducto);
    }

    public List<Producto> productosConStockBajo(Integer limite) {
        return productoRepository.findByStockLessThanAndActivoTrue(limite);
    }
}
