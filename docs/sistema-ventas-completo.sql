-- Script completo para el sistema de ventas
-- Ejecutar después de tener las tablas básicas creadas

-- 1. Verificar y crear tabla de métodos de pago si no existe
CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Verificar y crear tabla de pedidos si no existe
CREATE TABLE IF NOT EXISTS pedidos (
    idPedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    fechaPedido DATE NOT NULL,
    idUsuario BIGINT NOT NULL,
    idMetodoPago BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idMetodoPago) REFERENCES metodos_pago(id_metodo) ON DELETE RESTRICT
);

-- 3. Verificar y crear tabla de detalle_pedido si no existe
CREATE TABLE IF NOT EXISTS detalle_pedido (
    idDetalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioUnitario DECIMAL(10,2) NOT NULL CHECK (precioUnitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    idPedido BIGINT NOT NULL,
    idProducto BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPedido) REFERENCES pedidos(idPedido) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES productos(idProducto) ON DELETE RESTRICT
);

-- 4. Insertar métodos de pago básicos (solo si no existen)
INSERT IGNORE INTO metodos_pago (nombre, descripcion, activo) VALUES
('Efectivo', 'Pago en efectivo al momento de la entrega', true),
('Tarjeta de Crédito', 'Pago con tarjeta de crédito Visa/MasterCard', true),
('Tarjeta de Débito', 'Pago con tarjeta de débito', true),
('Transferencia Bancaria', 'Transferencia bancaria directa', true),
('Yape', 'Pago mediante aplicación Yape', true),
('Plin', 'Pago mediante aplicación Plin', true);

-- 5. Actualizar usuarios existentes para asegurar que tengan rol
UPDATE usuarios SET rol = 'CLIENT' WHERE rol IS NULL OR rol = '';

-- 6. Crear usuario administrador de ejemplo (solo si no existe)
INSERT IGNORE INTO usuarios (email, password, nombres, apellidos, telefono, direccion, rol, activo, fechaRegistro) 
VALUES (
    'admin@botica.com', 
    '$2a$10$example.hash.here', -- En producción, usar un hash real
    'Administrador', 
    'Sistema', 
    '999999999', 
    'Oficina Principal', 
    'ADMIN', 
    true, 
    CURDATE()
);

-- 7. Crear algunos productos de ejemplo (solo si no existen)
INSERT IGNORE INTO productos (nombre, descripcion, precio, stock, idCategoria) 
SELECT 
    'Paracetamol 500mg', 
    'Analgésico y antipirético para el alivio del dolor y la fiebre', 
    15.50, 
    100, 
    c.idCategoria 
FROM categorias c 
WHERE c.nombre = 'Analgésicos' 
LIMIT 1;

INSERT IGNORE INTO productos (nombre, descripcion, precio, stock, idCategoria) 
SELECT 
    'Ibuprofeno 400mg', 
    'Antiinflamatorio no esteroideo para dolor e inflamación', 
    18.00, 
    75, 
    c.idCategoria 
FROM categorias c 
WHERE c.nombre = 'Analgésicos' 
LIMIT 1;

-- 8. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(idUsuario);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fechaPedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido ON detalle_pedido(idPedido);
CREATE INDEX IF NOT EXISTS idx_detalle_producto ON detalle_pedido(idProducto);

-- 9. Crear vista para estadísticas de ventas
CREATE OR REPLACE VIEW vista_estadisticas_ventas AS
SELECT 
    DATE(p.fechaPedido) as fecha,
    COUNT(p.idPedido) as total_pedidos,
    SUM(CASE WHEN p.estado = 'COMPLETADO' THEN p.total ELSE 0 END) as ventas_completadas,
    SUM(CASE WHEN p.estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pedidos_pendientes,
    SUM(CASE WHEN p.estado = 'PROCESANDO' THEN 1 ELSE 0 END) as pedidos_procesando,
    SUM(CASE WHEN p.estado = 'CANCELADO' THEN 1 ELSE 0 END) as pedidos_cancelados
FROM pedidos p
GROUP BY DATE(p.fechaPedido)
ORDER BY fecha DESC;

-- 10. Crear vista para productos más vendidos
CREATE OR REPLACE VIEW vista_productos_mas_vendidos AS
SELECT 
    pr.idProducto,
    pr.nombre,
    pr.precio,
    SUM(dp.cantidad) as total_vendido,
    SUM(dp.subtotal) as ingresos_generados,
    COUNT(DISTINCT dp.idPedido) as pedidos_incluido
FROM productos pr
JOIN detalle_pedido dp ON pr.idProducto = dp.idProducto
JOIN pedidos p ON dp.idPedido = p.idPedido
WHERE p.estado = 'COMPLETADO'
GROUP BY pr.idProducto, pr.nombre, pr.precio
ORDER BY total_vendido DESC;

-- 11. Verificar que todo se creó correctamente
SELECT 'Métodos de pago creados:' as info, COUNT(*) as cantidad FROM metodos_pago
UNION ALL
SELECT 'Pedidos existentes:', COUNT(*) FROM pedidos
UNION ALL
SELECT 'Detalles de pedido:', COUNT(*) FROM detalle_pedido
UNION ALL
SELECT 'Usuarios con rol ADMIN:', COUNT(*) FROM usuarios WHERE rol = 'ADMIN'
UNION ALL
SELECT 'Usuarios con rol CLIENT:', COUNT(*) FROM usuarios WHERE rol = 'CLIENT';

-- 12. Mostrar estructura de las tablas principales
DESCRIBE metodos_pago;
DESCRIBE pedidos;
DESCRIBE detalle_pedido;