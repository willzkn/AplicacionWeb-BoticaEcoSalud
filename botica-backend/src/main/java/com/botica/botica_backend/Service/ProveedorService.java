package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Proveedor;
import com.botica.botica_backend.Repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {
    private final ProveedorRepository proveedorRepository;

    @Transactional
    public Proveedor registrarProveedor(Proveedor p) {
        Proveedor existente = proveedorRepository.buscarPorRUC(p.getRUC());
        if (existente != null) {
            throw new IllegalArgumentException("El RUC ya está registrado");
        }
        if (p.getFechaRegistro() == null) {
            p.setFechaRegistro(LocalDate.now());
        }
        if (p.getEstado() == null) {
            p.setEstado(true); // activo por defecto
        }
        return proveedorRepository.save(p);
    }


    public Proveedor buscarPorRUC(String ruc) {
        return proveedorRepository.buscarPorRUC(ruc);
    }

    // Nuevo metodo para listar todos los proveedores
    public List<Proveedor> getAllProveedores() {
        return proveedorRepository.findAll();
    }
}


