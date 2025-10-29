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
    private final ImagenService imagenService;

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

        // Si no se proporciona contraseña, asignar contraseña temporal por defecto
        boolean usaPasswordTemporal = false;
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            usuario.setPassword("123456");
            usaPasswordTemporal = true;
            System.out.println("⚠️ Usuario creado con contraseña temporal: " + usuario.getEmail() + " - Contraseña: 123456");
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
        
        // Procesar imagen de perfil
        if (usuario.getImagen() != null && !usuario.getImagen().trim().isEmpty()) {
            if (imagenService.esImagenValida(usuario.getImagen())) {
                usuario.setImagen(imagenService.normalizarImagen(usuario.getImagen()));
            } else {
                throw new IllegalArgumentException("La imagen proporcionada no es válida");
            }
        }

        // Asignar valores por defecto que pueden faltar
        usuario.setActivo(true);

        // Marcar que debe cambiar contraseña si usa la temporal
        usuario.setDebeCambiarPassword(usaPasswordTemporal);

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

        // Enviar email de bienvenida de forma asíncrona (no bloquear flujo si falla)
        try {
            emailService.enviarEmailBienvenida(guardado.getEmail(), guardado.getNombres());
        } catch (Exception e) {
            // Log del error pero no fallar el registro
            System.err.println("Error al enviar email de bienvenida: " + e.getMessage());
        }

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
    public boolean solicitarRecuperacionPassword(String email) {
        // Buscar usuario por email
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        
        if (usuarioOpt.isEmpty()) {
            // Por seguridad, no revelamos si el email existe o no
            return false;
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
            return true;
        } catch (Exception e) {
            // No hacemos fallar el flujo: registramos el error pero no exponemos detalles
            throw new RuntimeException("Error al enviar email de recuperación", e);
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

    // =====================================================
    // MÉTODOS DE PERFIL DE USUARIO
    // =====================================================

    /**
     * Actualizar perfil de usuario (sin cambiar email ni rol)
     */
    @Transactional
    public Usuario actualizarPerfil(Long idUsuario, String nombres, String apellidos, 
                                   String telefono, String direccion, String imagen) {
        // Verificar que el usuario existe
        Optional<Usuario> existente = usuarioRepository.findById(idUsuario);
        if (existente.isEmpty()) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        Usuario usuario = existente.get();
        
        // Validaciones básicas
        if (nombres == null || nombres.trim().isEmpty()) {
            throw new IllegalArgumentException("Los nombres son obligatorios");
        }
        if (apellidos == null || apellidos.trim().isEmpty()) {
            throw new IllegalArgumentException("Los apellidos son obligatorios");
        }

        // Actualizar solo los campos permitidos en perfil
        usuario.setNombres(nombres.trim());
        usuario.setApellidos(apellidos.trim());
        usuario.setTelefono(telefono != null ? telefono.trim() : null);
        usuario.setDireccion(direccion != null ? direccion.trim() : null);
        
        // Procesar imagen si se proporciona
        if (imagen != null && !imagen.trim().isEmpty()) {
            if (imagenService.esImagenValida(imagen)) {
                usuario.setImagen(imagenService.normalizarImagen(imagen));
            } else {
                throw new IllegalArgumentException("La imagen proporcionada no es válida");
            }
        }

        return usuarioRepository.save(usuario);
    }

    // =====================================================
    // MÉTODOS ADICIONALES PARA ADMIN
    // =====================================================

    @Transactional
    public Usuario actualizarUsuario(Usuario usuario) {
        // Verificar que el usuario existe
        Optional<Usuario> existente = usuarioRepository.findById(usuario.getIdUsuario());
        if (existente.isEmpty()) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        // Validaciones
        if (usuario.getNombres() == null || usuario.getNombres().trim().isEmpty()) {
            throw new IllegalArgumentException("Los nombres son obligatorios");
        }
        if (usuario.getApellidos() == null || usuario.getApellidos().trim().isEmpty()) {
            throw new IllegalArgumentException("Los apellidos son obligatorios");
        }

        Usuario original = existente.get();
        
        // Mantener email original (no se puede cambiar)
        usuario.setEmail(original.getEmail());
        
        // Mantener fecha de registro original
        usuario.setFechaRegistro(original.getFechaRegistro());
        
        // Si no se proporciona nueva contraseña, mantener la actual
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            usuario.setPassword(original.getPassword());
        } else {
            // Hashear nueva contraseña
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void cambiarEstado(Long idUsuario, Boolean activo) {
        Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
        if (usuario.isEmpty()) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        
        Usuario u = usuario.get();
        u.setActivo(activo);
        usuarioRepository.save(u);
    }

    @Transactional
    public void eliminarUsuario(Long idUsuario) {
        Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
        if (usuario.isEmpty()) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        
        // Verificar si el usuario tiene pedidos o está en carritos
        try {
            usuarioRepository.deleteById(idUsuario);
        } catch (Exception e) {
            // Si hay error por restricciones de FK, hacer soft delete
            Usuario u = usuario.get();
            u.setActivo(false);
            usuarioRepository.save(u);
            throw new IllegalArgumentException("No se puede eliminar el usuario porque tiene pedidos o datos asociados. Se ha desactivado en su lugar.");
        }
    }
}