package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.DTO.PerfilUsuarioDTO;
import com.botica.botica_backend.Service.UsuarioService;
import com.botica.botica_backend.Service.ImagenService;
import com.botica.botica_backend.Security.RoleBasedAccessControl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);
    private final UsuarioService usuarioService;
    private final ImagenService imagenService;

    @GetMapping("/all")
    @RoleBasedAccessControl(allowedRoles = {"ADMIN"})
    public ResponseEntity<List<Usuario>> getUsuarios() {
        logger.info("Obteniendo lista de usuarios");
        try {
            List<Usuario> usuarios = usuarioService.getUsuarios();
            logger.info("Usuarios obtenidos correctamente");
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            logger.error("Error al obtener lista de usuarios", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Registrar un nuevo usuario - VERSIÓN MODIFICADA
    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            logger.info("Registrando nuevo usuario: {}", usuario.getEmail());
            logger.info("Password recibido: {}", usuario.getPassword() == null ? "null" : "***");
            
            Usuario nuevo = usuarioService.registrarUsuario(usuario);
            nuevo.setPassword(null); // Seguridad: no devolver password
            logger.info("Usuario registrado correctamente");
            return ResponseEntity.ok(nuevo);
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación al registrar usuario: {}", e.getMessage());
            // Convertir a 400 Bad Request para errores de negocio
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error inesperado al registrar usuario", e);
            // Para cualquier otro error inesperado
            return ResponseEntity.internalServerError().body("Error interno del servidor: " + e.getMessage());
        }
    }


    // Iniciar sesión - Retorna datos del usuario
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        logger.info("Intento de inicio de sesión para el usuario: {}", email);

        Usuario usuario = usuarioService.iniciarSesionConDatos(email, password);

        if (usuario != null) {
            usuario.setPassword(null); // Seguridad
            logger.info("Inicio de sesión exitoso para el usuario: {}", email);
            return ResponseEntity.ok(usuario);
        } else {
            logger.warn("Inicio de sesión fallido para el usuario: {}", email);
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }
    }


    // Cambiar contraseña
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> cambiarPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String nuevaPass = body.get("nuevaPass");
        usuarioService.cambiarPassword(id, nuevaPass);
        return ResponseEntity.noContent().build();
    }

    // Obtener dirección de entrega
    @GetMapping("/{id}/direccion")
    public ResponseEntity<String> obtenerDireccionEntrega(@PathVariable Long id) {
        String direccion = usuarioService.obtenerDireccionEntrega(id);
        return ResponseEntity.ok(direccion);
    }

    // Solicitar recuperación de contraseña
    @PostMapping("/forgot-password")
    public ResponseEntity<?> solicitarRecuperacion(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            boolean enviado = usuarioService.solicitarRecuperacionPassword(email);

            if (!enviado) {
                logger.warn("Solicitud de recuperación ignorada: email no registrado - {}", email);
                return ResponseEntity.status(404).body("El correo electrónico no está registrado");
            }

            logger.info("Solicitud de recuperación procesada para {}", email);
            return ResponseEntity.ok("Si el correo existe, recibirás un enlace de recuperación en tu bandeja de entrada.");
        } catch (Exception e) {
            logger.error("Error al procesar solicitud de recuperación", e);
            return ResponseEntity.internalServerError().body("Error al procesar solicitud");
        }
    }

    // Restablecer contraseña con token
    @PostMapping("/reset-password")
    public ResponseEntity<?> restablecerPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String nuevaPassword = body.get("nuevaPassword");
            
            logger.info("Intento de restablecimiento de contraseña con token: {}", token != null ? "***" : "null");
            
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Token es requerido");
            }
            
            if (nuevaPassword == null || nuevaPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nueva contraseña es requerida");
            }
            
            if (nuevaPassword.length() < 6) {
                return ResponseEntity.badRequest().body("La contraseña debe tener al menos 6 caracteres");
            }
            
            usuarioService.restablecerPasswordConToken(token, nuevaPassword);
            logger.info("Contraseña restablecida exitosamente");
            return ResponseEntity.ok("Contraseña actualizada exitosamente");
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación al restablecer contraseña: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error inesperado al restablecer contraseña", e);
            return ResponseEntity.internalServerError().body("Error al restablecer contraseña: " + e.getMessage());
        }
    }

    // =====================================================
    // ENDPOINTS DE PERFIL DE USUARIO
    // =====================================================

    // Obtener perfil del usuario
    @GetMapping("/{id}/perfil")
    public ResponseEntity<?> obtenerPerfil(@PathVariable Long id) {
        try {
            Optional<Usuario> usuarioOpt = usuarioService.findById(id);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Usuario usuario = usuarioOpt.get();
            
            // Convertir a DTO
            PerfilUsuarioDTO perfil = new PerfilUsuarioDTO();
            perfil.setIdUsuario(usuario.getIdUsuario());
            perfil.setNombres(usuario.getNombres());
            perfil.setApellidos(usuario.getApellidos());
            perfil.setEmail(usuario.getEmail());
            perfil.setTelefono(usuario.getTelefono());
            perfil.setDireccion(usuario.getDireccion());
            
            // Procesar imagen
            perfil.setImagen(imagenService.obtenerImagenUsuario(usuario.getImagen()));

            logger.info("Perfil obtenido para usuario ID: {}", id);
            return ResponseEntity.ok(perfil);
            
        } catch (Exception e) {
            logger.error("Error al obtener perfil del usuario {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error al obtener perfil");
        }
    }

    // Actualizar perfil del usuario
    @PutMapping("/{id}/perfil")
    public ResponseEntity<?> actualizarPerfil(@PathVariable Long id, @RequestBody PerfilUsuarioDTO perfilDTO) {
        try {
            // Verificar que el usuario existe
            Optional<Usuario> usuarioOpt = usuarioService.findById(id);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Usuario usuario = usuarioOpt.get();

            // Validar imagen si se proporciona
            if (perfilDTO.getImagen() != null && !perfilDTO.getImagen().trim().isEmpty()) {
                if (!imagenService.esImagenValida(perfilDTO.getImagen())) {
                    return ResponseEntity.badRequest().body("La imagen proporcionada no es válida");
                }
            }

            // Validar cambio de contraseña si se solicita
            if (perfilDTO.getNuevaPassword() != null && !perfilDTO.getNuevaPassword().trim().isEmpty()) {
                if (perfilDTO.getConfirmarPassword() == null || 
                    !perfilDTO.getNuevaPassword().equals(perfilDTO.getConfirmarPassword())) {
                    return ResponseEntity.badRequest().body("Las contraseñas no coinciden");
                }
                
                if (perfilDTO.getNuevaPassword().length() < 6) {
                    return ResponseEntity.badRequest().body("La contraseña debe tener al menos 6 caracteres");
                }
            }

            // Actualizar datos básicos
            usuario.setNombres(perfilDTO.getNombres());
            usuario.setApellidos(perfilDTO.getApellidos());
            usuario.setTelefono(perfilDTO.getTelefono());
            usuario.setDireccion(perfilDTO.getDireccion());

            // Actualizar imagen si se proporciona
            if (perfilDTO.getImagen() != null && !perfilDTO.getImagen().trim().isEmpty()) {
                usuario.setImagen(imagenService.normalizarImagen(perfilDTO.getImagen()));
            }

            // Cambiar contraseña si se solicita
            if (perfilDTO.getNuevaPassword() != null && !perfilDTO.getNuevaPassword().trim().isEmpty()) {
                usuarioService.cambiarPassword(id, perfilDTO.getNuevaPassword());
            }

            // Guardar cambios
            Usuario actualizado = usuarioService.actualizarUsuario(usuario);

            // Preparar respuesta
            PerfilUsuarioDTO respuesta = new PerfilUsuarioDTO();
            respuesta.setIdUsuario(actualizado.getIdUsuario());
            respuesta.setNombres(actualizado.getNombres());
            respuesta.setApellidos(actualizado.getApellidos());
            respuesta.setEmail(actualizado.getEmail());
            respuesta.setTelefono(actualizado.getTelefono());
            respuesta.setDireccion(actualizado.getDireccion());
            respuesta.setImagen(imagenService.obtenerImagenUsuario(actualizado.getImagen()));

            logger.info("Perfil actualizado para usuario ID: {}", id);
            return ResponseEntity.ok(respuesta);

        } catch (IllegalArgumentException e) {
            logger.error("Error de validación al actualizar perfil: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error al actualizar perfil del usuario {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error al actualizar perfil");
        }
    }

    // =====================================================
    // ENDPOINTS ADICIONALES PARA ADMIN
    // =====================================================

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            Optional<Usuario> usuario = usuarioService.findById(id);
            if (usuario.isPresent()) {
                Usuario u = usuario.get();
                u.setPassword(null); // Seguridad
                return ResponseEntity.ok(u);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al obtener usuario");
        }
    }

    // Actualizar usuario completo
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        try {
            usuario.setIdUsuario(id);
            Usuario actualizado = usuarioService.actualizarUsuario(usuario);
            actualizado.setPassword(null); // Seguridad
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al actualizar usuario");
        }
    }

    // Cambiar estado (activar/desactivar)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        try {
            Boolean activo = body.get("activo");
            usuarioService.cambiarEstado(id, activo);
            String mensaje = activo ? "Usuario activado correctamente" : "Usuario desactivado correctamente";
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al cambiar estado");
        }
    }

    // Eliminar usuario (hard delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok("Usuario eliminado correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al eliminar usuario");
        }
    }

    // =====================================================
    // EXPORTACIÓN CSV
    // =====================================================

    // Exportar usuarios a CSV
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportarUsuariosCSV() {
        try {
            logger.info("Iniciando exportación de usuarios a CSV");
            
            List<Usuario> usuarios = usuarioService.getUsuarios();
            
            StringBuilder csv = new StringBuilder();
            csv.append("ID,Nombres,Apellidos,Email,Telefono,Direccion,Rol,Estado,Fecha_Registro\n");
            
            for (Usuario u : usuarios) {
                csv.append(u.getIdUsuario()).append(",");
                csv.append("\"").append(u.getNombres() != null ? u.getNombres() : "").append("\",");
                csv.append("\"").append(u.getApellidos() != null ? u.getApellidos() : "").append("\",");
                csv.append("\"").append(u.getEmail() != null ? u.getEmail() : "").append("\",");
                csv.append("\"").append(u.getTelefono() != null ? u.getTelefono() : "").append("\",");
                csv.append("\"").append(u.getDireccion() != null ? u.getDireccion().replace("\"", "\"\"") : "").append("\",");
                csv.append("\"").append(u.getRol() != null ? u.getRol() : "USER").append("\",");
                csv.append("\"").append(u.getActivo() != null && u.getActivo() ? "ACTIVO" : "INACTIVO").append("\",");
                csv.append("\"").append(u.getFechaRegistro() != null ? u.getFechaRegistro().toString() : "").append("\"");
                csv.append("\n");
            }
            
            byte[] csvBytes = csv.toString().getBytes();
            
            String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "usuarios_" + timestamp + ".csv";
            
            logger.info("CSV de usuarios generado: {}, {} usuarios, {} bytes", filename, usuarios.size(), csvBytes.length);
            
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .header("Content-Type", "text/csv")
                .body(csvBytes);
                
        } catch (Exception e) {
            logger.error("Error al generar CSV de usuarios", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}