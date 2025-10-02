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


    // Iniciar sesión
    @PostMapping("/login")
    public ResponseEntity<Boolean> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        boolean exito = usuarioService.iniciarSesion(email, password);
        return ResponseEntity.ok(exito);
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
}