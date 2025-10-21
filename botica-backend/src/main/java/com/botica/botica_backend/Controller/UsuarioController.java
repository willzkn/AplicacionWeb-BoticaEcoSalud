package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);
    private final UsuarioService usuarioService;

    @GetMapping("/all")
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

    // Endpoints adicionales para el panel de administrador
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id)
                .map(usuario -> {
                    usuario.setPassword(null); // Seguridad
                    return ResponseEntity.ok(usuario);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioService.actualizar(id, usuario)
                .map(usuarioActualizado -> {
                    usuarioActualizado.setPassword(null); // Seguridad
                    return ResponseEntity.ok(usuarioActualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (usuarioService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/activar")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        usuarioService.cambiarEstado(id, true);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        usuarioService.cambiarEstado(id, false);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para crear usuario administrador de prueba
    @PostMapping("/create-admin")
    public ResponseEntity<?> crearAdmin() {
        try {
            Usuario admin = new Usuario();
            admin.setNombres("Administrador");
            admin.setApellidos("Sistema");
            admin.setEmail("admin@botica.com");
            admin.setPassword("admin123");
            admin.setRol("admin");
            admin.setActivo(true);
            admin.setTelefono("999999999");
            admin.setDireccion("Sistema");
            
            Usuario creado = usuarioService.registrarUsuario(admin);
            creado.setPassword(null); // Seguridad
            return ResponseEntity.ok(creado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear administrador: " + e.getMessage());
        }
    }
}