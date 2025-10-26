package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Service.UsuarioService;
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

    @GetMapping("/all")
    @RoleBasedAccessControl(allowedRoles = {"ADMIN"})
    public ResponseEntity<List<Usuario>> getUsuarios() {
        return ResponseEntity.ok(usuarioService.getUsuarios());
    }

    // Registrar un nuevo usuario - VERSIÓN MODIFICADA
    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario nuevo = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(nuevo);
        } catch (IllegalArgumentException e) {
            // Convertir a 400 Bad Request para errores de negocio
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Para cualquier otro error inesperado
            return ResponseEntity.internalServerError().body("Error interno del servidor");
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
            usuarioService.solicitarRecuperacionPassword(email);
            return ResponseEntity.ok("Si el email existe, recibirás un enlace de recuperación");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar solicitud");
        }
    }

    // Restablecer contraseña con token
    @PostMapping("/reset-password")
    public ResponseEntity<?> restablecerPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String nuevaPassword = body.get("nuevaPassword");
            usuarioService.restablecerPasswordConToken(token, nuevaPassword);
            return ResponseEntity.ok("Contraseña actualizada exitosamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al restablecer contraseña");
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