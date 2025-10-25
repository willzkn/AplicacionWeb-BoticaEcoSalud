package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Proveedor;
import com.botica.botica_backend.Repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProveedorService {
    private final ProveedorRepository proveedorRepository;

    // =====================================================
    // OPERACIONES CRUD COMPLETAS
    // =====================================================

    // CREATE
    @Transactional
    public Proveedor registrarProveedor(Proveedor p) {
        // Validaciones
        if (p.getNombreComercial() == null || p.getNombreComercial().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre comercial es obligatorio");
        }
        if (p.getRUC() == null || p.getRUC().trim().isEmpty()) {
            throw new IllegalArgumentException("El RUC es obligatorio");
        }
        
        // Verificar RUC único
        Proveedor existente = proveedorRepository.buscarPorRUC(p.getRUC());
        if (existente != null) {
            throw new IllegalArgumentException("El RUC ya está registrado");
        }
        
        // Valores por defecto
        if (p.getFechaRegistro() == null) {
            p.setFechaRegistro(LocalDate.now());
        }
        if (p.getEstado() == null) {
            p.setEstado(true); // activo por defecto
        }
        
        return proveedorRepository.save(p);
    }

    // READ
    public List<Proveedor> getAllProveedores() {
        return proveedorRepository.findAll();
    }

    public Optional<Proveedor> obtenerPorId(Long id) {
        return proveedorRepository.findById(id);
    }

    public Proveedor buscarPorRUC(String ruc) {
        return proveedorRepository.buscarPorRUC(ruc);
    }

    public List<Proveedor> listarActivos() {
        return proveedorRepository.findByEstadoTrue();
    }

    public List<Proveedor> buscarPorNombre(String nombre) {
        return proveedorRepository.findByNombreComercialContainingIgnoreCase(nombre);
    }

    public List<Proveedor> listarPorTipoProducto(String tipo) {
        return proveedorRepository.findByTipoProductoContainingIgnoreCase(tipo);
    }

    // UPDATE
    @Transactional
    public Proveedor actualizarProveedor(Proveedor proveedor) {
        // Verificar que el proveedor existe
        Optional<Proveedor> existente = proveedorRepository.findById(proveedor.getIdProveedor());
        if (existente.isEmpty()) {
            throw new IllegalArgumentException("Proveedor no encontrado");
        }

        // Validaciones
        if (proveedor.getNombreComercial() == null || proveedor.getNombreComercial().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre comercial es obligatorio");
        }
        if (proveedor.getRUC() == null || proveedor.getRUC().trim().isEmpty()) {
            throw new IllegalArgumentException("El RUC es obligatorio");
        }

        // Verificar RUC único (excluyendo el actual)
        Proveedor otroConMismoRUC = proveedorRepository.buscarPorRUC(proveedor.getRUC());
        if (otroConMismoRUC != null && !otroConMismoRUC.getIdProveedor().equals(proveedor.getIdProveedor())) {
            throw new IllegalArgumentException("Ya existe otro proveedor con ese RUC");
        }

        // Mantener fecha de registro original
        Proveedor original = existente.get();
        proveedor.setFechaRegistro(original.getFechaRegistro());

        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public void cambiarEstado(Long idProveedor, Boolean estado) {
        Optional<Proveedor> proveedor = proveedorRepository.findById(idProveedor);
        if (proveedor.isEmpty()) {
            throw new IllegalArgumentException("Proveedor no encontrado");
        }
        
        Proveedor p = proveedor.get();
        p.setEstado(estado);
        proveedorRepository.save(p);
    }

    // DELETE (Hard delete con validaciones)
    @Transactional
    public void eliminarProveedor(Long idProveedor) {
        Optional<Proveedor> proveedor = proveedorRepository.findById(idProveedor);
        if (proveedor.isEmpty()) {
            throw new IllegalArgumentException("Proveedor no encontrado");
        }
        
        // Verificar si tiene productos asociados
        Long productosCount = contarProductosPorProveedor(idProveedor);
        if (productosCount > 0) {
            // Si tiene productos, solo desactivar
            Proveedor p = proveedor.get();
            p.setEstado(false);
            proveedorRepository.save(p);
            throw new IllegalArgumentException("No se puede eliminar el proveedor porque tiene " + productosCount + " productos asociados. Se ha desactivado en su lugar.");
        }
        
        // Si no tiene productos, eliminar completamente
        proveedorRepository.deleteById(idProveedor);
    }

    // =====================================================
    // OPERACIONES ESPECIALES
    // =====================================================

    public Long contarProductosPorProveedor(Long proveedorId) {
        return proveedorRepository.contarProductosPorProveedor(proveedorId);
    }
}


