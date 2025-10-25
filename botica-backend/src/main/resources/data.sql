-- Datos iniciales para la base de datos de la botica

-- Insertar categorías (solo si no existen)
INSERT IGNORE INTO categorias (nombre, descripcion, activo, fecha_creacion) VALUES
('Medicamentos', 'Medicamentos de venta libre y con receta', true, CURRENT_DATE),
('Vitaminas y Suplementos', 'Vitaminas, minerales y suplementos nutricionales', true, CURRENT_DATE),
('Cuidado Personal', 'Productos de higiene y cuidado personal', true, CURRENT_DATE),
('Primeros Auxilios', 'Productos para primeros auxilios y emergencias', true, CURRENT_DATE),
('Bebé y Mamá', 'Productos para el cuidado de bebés y madres', true, CURRENT_DATE);

-- Insertar usuario administrador (solo si no existe)
-- Credenciales: admin@botica.com / admin123
INSERT IGNORE INTO usuarios (nombres, apellidos, email, telefono, direccion, password, rol, activo, fecha_registro) VALUES
('Administrador', 'Sistema', 'admin@botica.com', '999999999', 'Sistema', '$2a$10$2eDmIiWZNveb5upYpKZxautBgt.fkb5/JEGhXZLj146/JMWCYrBnK', 'admin', true, CURRENT_DATE);

-- Insertar métodos de pago (solo si no existen)
INSERT IGNORE INTO metodos_pago (nombre, descripcion, activo) VALUES
('Efectivo', 'Pago en efectivo al momento de la entrega', true),
('Tarjeta de Crédito', 'Pago con tarjeta de crédito Visa o Mastercard', true),
('Tarjeta de Débito', 'Pago con tarjeta de débito', true),
('Transferencia Bancaria', 'Transferencia bancaria directa', true),
('Yape', 'Pago mediante aplicación Yape', true),
('Plin', 'Pago mediante aplicación Plin', true);