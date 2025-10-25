-- =====================================================
-- SCRIPT PARA CORREGIR USUARIOS CON CONTRASEÑAS VÁLIDAS
-- =====================================================

USE botica;

-- Eliminar usuarios existentes con contraseñas incorrectas
DELETE FROM usuarios WHERE email IN ('admin@ecosalud.pe', 'cliente@test.com');

-- Insertar usuarios con contraseñas correctamente hasheadas
-- Contraseña para admin: admin123
-- Contraseña para cliente: cliente123

INSERT INTO usuarios (email, password, nombres, apellidos, rol, activo, fecha_registro) VALUES 
('admin@ecosalud.pe', '$2a$10$o0dV.Z3U5w/kfuSZWUwyZees.VbzyimnwdN7vBKN.ytOi5V8EHniG', 'Administrador', 'Sistema', 'ADMIN', true, CURDATE()),
('cliente@test.com', '$2a$10$gkSrT0wGl1zpCtSXA1Eg2OtDAdpzdaMBpU3O0FMj1f2l.zNhyz.UO', 'Cliente', 'Prueba', 'USER', true, CURDATE());

-- Verificar que los usuarios se insertaron correctamente
SELECT id_usuario, email, nombres, apellidos, rol, activo, fecha_registro 
FROM usuarios 
WHERE email IN ('admin@ecosalud.pe', 'cliente@test.com');

-- =====================================================
-- CREDENCIALES DE ACCESO:
-- =====================================================
-- Admin: admin@ecosalud.pe / admin123
-- Cliente: cliente@test.com / cliente123
-- =====================================================