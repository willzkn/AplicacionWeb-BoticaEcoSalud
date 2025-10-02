package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    // Create - VERSIÓN CORREGIDA
    @Transactional
    public Usuario registrarUsuario(Usuario usuario) {
        // Validación de email
        if (usuarioRepository.existsByEmailIgnoreCase(usuario.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        // Asignar valores por defecto que pueden faltar
        usuario.setActivo(true);

        // Fecha de registro obligatoria
        if (usuario.getFechaRegistro() == null) {
            usuario.setFechaRegistro(LocalDate.now());
        }

        // Rol por defecto
        if (usuario.getRol() == null || usuario.getRol().trim().isEmpty()) {
            usuario.setRol("cliente");
        }

        return usuarioRepository.save(usuario);
    }

    // Login (proceso)
    public boolean iniciarSesion(String email, String password) {
        return usuarioRepository.iniciarSesion(email, password);
    }

    // Update password - VERSIÓN MEJORADA CON VALIDACIÓN
    @Transactional
    public void cambiarPassword(Long idUsuario, String nuevaPass) {
        // Validar que el usuario existe
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        usuarioRepository.cambiarPassword(idUsuario, nuevaPass);
    }

    // Obtener dirección de entrega - VERSIÓN MEJORADA CON VALIDACIÓN
    public String obtenerDireccionEntrega(Long idUsuario) {
        // Validar que el usuario existe
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        return usuarioRepository.obtenerDireccionEntrega(idUsuario);
    }

    // MÉTODO ADICIONAL ÚTIL: Buscar usuario por ID
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    // MÉTODO ADICIONAL ÚTIL: Verificar si usuario existe
    public boolean existsById(Long id) {
        return usuarioRepository.existsById(id);
    }
}