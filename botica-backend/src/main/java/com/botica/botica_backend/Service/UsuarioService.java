package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // Read
    public List<Usuario> getUsuarios() {
        return usuarioRepository.findAll();
    }

    // Create - VERSIÓN CORREGIDA CON HASHEO DE CONTRASEÑA
    @Transactional
    public Usuario registrarUsuario(Usuario usuario) {
        // Validación de email
        if (usuarioRepository.existsByEmailIgnoreCase(usuario.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        // Hashear la contraseña antes de guardar
        String passwordHasheada = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordHasheada);

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

    // Login (proceso) - VERSIÓN CON VERIFICACIÓN DE CONTRASEÑA HASHEADA
    public boolean iniciarSesion(String email, String password) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        
        if (usuarioOpt.isEmpty()) {
            return false;
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verificar si la contraseña coincide con el hash almacenado
        return passwordEncoder.matches(password, usuario.getPassword());
    }

    // Update password - VERSIÓN MEJORADA CON VALIDACIÓN Y HASHEO
    @Transactional
    public void cambiarPassword(Long idUsuario, String nuevaPass) {
        // Validar que el usuario existe
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        
        // Hashear la nueva contraseña antes de guardarla
        String passwordHasheada = passwordEncoder.encode(nuevaPass);
        usuarioRepository.cambiarPassword(idUsuario, passwordHasheada);
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