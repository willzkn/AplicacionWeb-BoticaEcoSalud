package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Model.PasswordResetToken;
import com.botica.botica_backend.Repository.UsuarioRepository;
import com.botica.botica_backend.Repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository tokenRepository;

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

        // Validación de teléfono
        if (usuario.getTelefono() != null && !usuario.getTelefono().trim().isEmpty()) {
            if (usuarioRepository.existsByTelefono(usuario.getTelefono())) {
                throw new IllegalArgumentException("El teléfono ya está registrado");
            }
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

        // Guardar usuario
        Usuario guardado = usuarioRepository.save(usuario);

        // Enviar email de bienvenida (no bloquear flujo si falla)
        try {
            emailService.enviarEmailBienvenida(guardado.getEmail(), guardado.getNombres());
        } catch (Exception ignored) { }

        return guardado;
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

    // Login con datos del usuario - Retorna el usuario completo si las credenciales son correctas
    public Usuario iniciarSesionConDatos(String email, String password) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        
        if (usuarioOpt.isEmpty()) {
            return null;
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verificar si la contraseña coincide con el hash almacenado
        if (passwordEncoder.matches(password, usuario.getPassword())) {
            return usuario;
        }
        
        return null;
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

    // ========================================
    // RECUPERACIÓN DE CONTRASEÑA
    // ========================================

    /**
     * Solicitar recuperación de contraseña - Genera token y envía email
     */
    @Transactional
    public void solicitarRecuperacionPassword(String email) {
        // Buscar usuario por email
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        
        if (usuarioOpt.isEmpty()) {
            // Por seguridad, no revelamos si el email existe o no
            return;
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Eliminar tokens anteriores del usuario
        tokenRepository.deleteByUsuarioIdUsuario(usuario.getIdUsuario());
        
        // Generar nuevo token
        String token = UUID.randomUUID().toString();
        
        // Crear registro de token (expira en 1 hora)
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUsuario(usuario);
        resetToken.setFechaExpiracion(LocalDateTime.now().plusHours(1));
        resetToken.setUsado(false);
        tokenRepository.save(resetToken);
        
        // Enviar email con el token
        try {
            emailService.enviarRecuperacionPassword(
                usuario.getEmail(),
                usuario.getNombres(),
                token
            );
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar email de recuperación");
        }
    }

    /**
     * Restablecer contraseña usando el token
     */
    @Transactional
    public void restablecerPasswordConToken(String token, String nuevaPassword) {
        // Buscar token
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido"));
        
        // Validar que no esté usado
        if (resetToken.getUsado()) {
            throw new IllegalArgumentException("Este token ya fue utilizado");
        }
        
        // Validar que no esté expirado
        if (resetToken.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Este token ha expirado");
        }
        
        // Cambiar contraseña
        Usuario usuario = resetToken.getUsuario();
        String passwordHasheada = passwordEncoder.encode(nuevaPassword);
        usuarioRepository.cambiarPassword(usuario.getIdUsuario(), passwordHasheada);
        
        // Marcar token como usado
        resetToken.setUsado(true);
        tokenRepository.save(resetToken);
    }
}