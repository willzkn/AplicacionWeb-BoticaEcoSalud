package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

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
        
        Usuario usuario = usuarioService.iniciarSesionConDatos(email, password);
        
        if (usuario != null) {
            // No retornar la contraseña por seguridad
            usuario.setPassword(null);
            return ResponseEntity.ok(usuario);
        } else {
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
}