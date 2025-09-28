package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    // Read
    public List<Usuario> getUsuarios() {
        return usuarioRepository.findAll();
    }

    // Create
    @Transactional
    public Usuario registrarUsuario(Usuario usuario) {
        // Validaciones de negocio simples
        // (Bean Validation en la entidad se encarga de formato/blank)
        Optional<Usuario> existente = usuarioRepository
                .findAll()
                .stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(usuario.getEmail()))
                .findFirst();
        if (existente.isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        usuario.setActivo(Boolean.TRUE);
        return usuarioRepository.save(usuario);
    }

    // Login (proceso)
    public boolean iniciarSesion(String email, String password) {
        return usuarioRepository.iniciarSesion(email, password);
    }

    // Update password
    @Transactional
    public void cambiarPassword(Long idUsuario, String nuevaPass) {
        usuarioRepository.cambiarPassword(idUsuario, nuevaPass);
    }

    // Obtener dirección de entrega (proceso)
    public String obtenerDireccionEntrega(Long idUsuario) {
        return usuarioRepository.obtenerDireccionEntrega(idUsuario);
    }
}
