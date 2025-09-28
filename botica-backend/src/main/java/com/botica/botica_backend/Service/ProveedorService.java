package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Proveedor;
import com.botica.botica_backend.Repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProveedorService {
    private final ProveedorRepository proveedorRepository;

    @Transactional
    public Proveedor registrarProveedor(Proveedor p) {
        // RUC único (búsqueda exacta)
        Proveedor existente = proveedorRepository.buscarPorRUC(p.getRUC());
        if (existente != null) {
            throw new IllegalArgumentException("El RUC ya está registrado");
        }
        return proveedorRepository.save(p);
    }

    public Proveedor buscarPorRUC(String ruc) {
        return proveedorRepository.buscarPorRUC(ruc);
    }
}
