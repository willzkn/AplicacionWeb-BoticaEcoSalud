-- Script para insertar métodos de pago iniciales
-- Ejecutar después de crear las tablas

-- Insertar métodos de pago básicos
INSERT INTO metodos_pago (nombre, descripcion, activo) VALUES
('Efectivo', 'Pago en efectivo al momento de la entrega', true),
('Tarjeta de Crédito', 'Pago con tarjeta de crédito Visa/MasterCard', true),
('Tarjeta de Débito', 'Pago con tarjeta de débito', true),
('Transferencia Bancaria', 'Transferencia bancaria directa', true),
('Yape', 'Pago mediante aplicación Yape', true),
('Plin', 'Pago mediante aplicación Plin', true);

-- Verificar que se insertaron correctamente
SELECT * FROM metodos_pago;