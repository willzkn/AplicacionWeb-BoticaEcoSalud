package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Metodo_pago;
import com.botica.botica_backend.Repository.MetodoPagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MetodoPagoService {
    private final MetodoPagoRepository metodoPagoRepository;

    public List<Metodo_pago> obtenerMetodosActivos() {
        return metodoPagoRepository.obtenerMetodosActivos();
    }

    public Metodo_pago obtenerDetalle(Long id) {
        return metodoPagoRepository.obtenerDetalle(id);
    }

    public Metodo_pago crearMetodoPago(Metodo_pago metodoPago) {
        return metodoPagoRepository.save(metodoPago);
    }
}
