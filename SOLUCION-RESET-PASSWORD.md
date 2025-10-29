# 🔧 SOLUCIÓN: Error en Reset Password

## 🔍 **Problema Identificado**
- ✅ **Envío de email**: Funciona correctamente
- ❌ **Restablecer contraseña**: Error HTTP 400
- **Causa probable**: Tabla `password_reset_tokens` no existe o estructura incorrecta

## 🛠️ **Solución Paso a Paso**

### **1. Ejecutar Script SQL**
Ejecuta el siguiente script en tu base de datos MySQL:

```sql
-- Recrear tabla password_reset_tokens
DROP TABLE IF EXISTS password_reset_tokens;

CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    id_usuario BIGINT NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_password_reset_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE
);

-- Agregar columna imagen si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS imagen LONGTEXT AFTER direccion;
```

### **2. Verificar Estructura**
```sql
-- Verificar que la tabla se creó correctamente
DESCRIBE password_reset_tokens;

-- Verificar que usuarios tiene columna imagen
DESCRIBE usuarios;
```

### **3. Reiniciar Backend**
- Detén el servidor Spring Boot
- Reinicia la aplicación
- Los logs mostrarán más información sobre errores

## 🔍 **Diagnóstico Mejorado**

He agregado logging adicional al endpoint para mejor diagnóstico:

```java
@PostMapping("/reset-password")
public ResponseEntity<?> restablecerPassword(@RequestBody Map<String, String> body) {
    try {
        String token = body.get("token");
        String nuevaPassword = body.get("nuevaPassword");
        
        // Validaciones mejoradas
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
        return ResponseEntity.ok("Contraseña actualizada exitosamente");
        
    } catch (IllegalArgumentException e) {
        logger.error("Error de validación: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        logger.error("Error inesperado", e);
        return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
    }
}
```

## 🎯 **Posibles Errores y Soluciones**

### **Error: "Token inválido"**
- **Causa**: Token no existe en la base de datos
- **Solución**: Verificar que se guardó correctamente al enviar email

### **Error: "Token ya fue utilizado"**
- **Causa**: Token ya se usó anteriormente
- **Solución**: Solicitar nuevo email de recuperación

### **Error: "Token ha expirado"**
- **Causa**: Token tiene más de 1 hora
- **Solución**: Solicitar nuevo email de recuperación

### **Error: "Table doesn't exist"**
- **Causa**: Tabla `password_reset_tokens` no existe
- **Solución**: Ejecutar script SQL de creación

## 🔄 **Flujo Completo de Recuperación**

### **1. Solicitar Recuperación**
```
Usuario → /forgot-password → Email → Token generado → Email enviado
```

### **2. Restablecer Contraseña**
```
Usuario → Click enlace → /reset-password?token=xxx → Nueva contraseña → Token validado → Contraseña actualizada
```

## 📋 **Checklist de Verificación**

- [ ] **Base de datos**: Tabla `password_reset_tokens` existe
- [ ] **Estructura**: Columnas correctas (id, token, id_usuario, fecha_expiracion, usado)
- [ ] **Foreign Key**: Relación con tabla `usuarios`
- [ ] **Backend**: Aplicación reiniciada después de cambios
- [ ] **Token**: Válido y no expirado (menos de 1 hora)
- [ ] **Contraseña**: Mínimo 6 caracteres

## 🚀 **Para Probar**

1. **Ejecuta el script SQL** para crear/recrear la tabla
2. **Reinicia el backend** para aplicar cambios
3. **Solicita recuperación** de contraseña (nuevo email)
4. **Usa el nuevo token** para restablecer contraseña
5. **Verifica los logs** del backend para más detalles

## 📝 **Archivos Modificados**

- ✅ `UsuarioController.java` - Logging mejorado
- ✅ `fix-password-reset-tokens.sql` - Script de corrección

## 🎉 **Resultado Esperado**

Después de ejecutar el script SQL y reiniciar el backend:
- ✅ Envío de email de recuperación
- ✅ Restablecimiento de contraseña sin errores
- ✅ Login con nueva contraseña
- ✅ Logs descriptivos en caso de errores