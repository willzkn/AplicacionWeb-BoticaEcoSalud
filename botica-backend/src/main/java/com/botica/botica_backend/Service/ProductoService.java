package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Repository.ProductoRepository;
import com.google.common.cache.LoadingCache;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;
    
    @Autowired
    private ValidationServiceGuava validationService;
    
    @Autowired
    private LoadingCache<Long, Producto> productCache;

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Transactional
    public Producto crearProducto(Producto p) {
        // Validaciones usando ValidationService
        validationService.validateName(p.getNombre(), "Nombre del producto");
        validationService.validatePrice(p.getPrecio());
        validationService.validateStock(p.getStock());
        
        Producto saved = productoRepository.save(p);
        
        // Invalidar cache después de crear
        productCache.invalidateAll();
        
        return saved;
    }

    @Transactional
    public void actualizarPrecio(Long idProducto, Double nuevoPrecio) {
        validationService.validateId(idProducto, "producto");
        validationService.validatePrice(nuevoPrecio);
        
        productoRepository.actualizarPrecio(idProducto, nuevoPrecio);
        
        // Invalidar cache del producto específico
        productCache.invalidate(idProducto);
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

    public java.util.Optional<Producto> obtenerPorId(Long idProducto) {
        validationService.validateId(idProducto, "producto");
        
        try {
            // Intentar obtener del cache primero
            Producto producto = productCache.get(idProducto);
            return java.util.Optional.of(producto);
        } catch (ExecutionException e) {
            // Si no está en cache o hay error, buscar en BD
            return productoRepository.findById(idProducto);
        }
    }

    @Transactional
    public java.util.Optional<Producto> actualizar(Long idProducto, Producto producto) {
        validationService.validateId(idProducto, "producto");
        validationService.validateName(producto.getNombre(), "Nombre del producto");
        validationService.validatePrice(producto.getPrecio());
        validationService.validateStock(producto.getStock());
        
        return productoRepository.findById(idProducto)
                .map(existente -> {
                    existente.setNombre(producto.getNombre());
                    existente.setDescripcion(producto.getDescripcion());
                    existente.setPrecio(producto.getPrecio());
                    existente.setStock(producto.getStock());
                    existente.setCategoria(producto.getCategoria());
                    existente.setProveedor(producto.getProveedor());
                    existente.setImagen(producto.getImagen());
                    
                    Producto saved = productoRepository.save(existente);
                    
                    // Invalidar cache después de actualizar
                    productCache.invalidate(idProducto);
                    
                    return saved;
                });
    }

    @Transactional
    public boolean eliminar(Long idProducto) {
        validationService.validateId(idProducto, "producto");
        
        if (productoRepository.existsById(idProducto)) {
            productoRepository.deleteById(idProducto);
            
            // Invalidar cache después de eliminar
            productCache.invalidate(idProducto);
            
            return true;
        }
        return false;
    }
}
