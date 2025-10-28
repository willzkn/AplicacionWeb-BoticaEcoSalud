-- ==================================================================================
-- SCRIPT COMPLETO CORREGIDO - BOTICA ECOSALUD 
-- RECUERDA QUE SIN ESTE SCRIPT Y XAMPP INICIALIZADO SPRING NO PODRA INICIALIZARSE
-- ==================================================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS botica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE botica;

-- =====================================================
-- CREACIÓN DE TABLAS
-- =====================================================

-- Tabla usuarios
CREATE TABLE usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) UNIQUE,
    direccion VARCHAR(255),
    rol VARCHAR(255),
    activo BOOLEAN,
    fecha_registro DATE,
    debe_cambiar_password BOOLEAN DEFAULT FALSE
);

-- Tabla categorias
CREATE TABLE categorias (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN,
    fecha_creacion DATE
);

-- Tabla proveedor
CREATE TABLE proveedor (
    id_proveedor BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(255),
    ruc VARCHAR(255),
    telefono VARCHAR(255),
    correo VARCHAR(255),
    persona_contacto VARCHAR(255),
    tipo_producto VARCHAR(255),
    condiciones_pago VARCHAR(255),
    estado BOOLEAN,
    fecha_registro DATE
);

-- Tabla metodos_pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla productos
CREATE TABLE productos (
    id_producto BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(255),
    nombre VARCHAR(255),
    descripcion TEXT,
    precio DOUBLE,
    stock INTEGER,
    imagen LONGTEXT,
    activo BOOLEAN,
    fecha_creacion DATE,
    id_categoria BIGINT,
    id_proveedor BIGINT,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
);

-- Tabla carrito
CREATE TABLE carrito (
    id_carrito BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_unitario DOUBLE NOT NULL,
    fecha_agregado DATE NOT NULL,
    idUsuario BIGINT NOT NULL,
    idProducto BIGINT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (idProducto) REFERENCES productos(id_producto)
);

-- Tabla pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    idPedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    fechaPedido DATE NOT NULL,
    idUsuario BIGINT NOT NULL,
    idMetodoPago BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (idMetodoPago) REFERENCES metodos_pago(id_metodo) ON DELETE RESTRICT
);

-- Tabla detalle_pedido
CREATE TABLE IF NOT EXISTS detalle_pedido (
    idDetalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioUnitario DECIMAL(10,2) NOT NULL CHECK (precioUnitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    idPedido BIGINT NOT NULL,
    idProducto BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPedido) REFERENCES pedidos(idPedido) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES productos(id_producto) ON DELETE RESTRICT
);

-- Tabla password_reset_tokens
CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    id_usuario BIGINT NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =====================================================
-- INSERCIÓN DE DATOS INICIALES
-- =====================================================

-- Métodos de pago
INSERT INTO metodos_pago (nombre, descripcion, activo) VALUES 
('Efectivo', 'Pago en efectivo al momento de la entrega', true),
('Tarjeta de Crédito', 'Pago con tarjeta de crédito', true),
('Tarjeta de Débito', 'Pago con tarjeta de débito', true),
('Transferencia Bancaria', 'Pago por transferencia bancaria', true),
('Yape', 'Pago mediante aplicación Yape', true),
('Plin', 'Pago mediante aplicación Plin', true);

-- Categorías
INSERT INTO categorias (nombre, descripcion, activo, fecha_creacion) VALUES 
('Medicamentos', 'Medicamentos con y sin receta médica', true, CURDATE()),
('Vitaminas y Suplementos', 'Vitaminas, minerales y suplementos nutricionales', true, CURDATE()),
('Cuidado Personal', 'Productos de higiene y cuidado personal', true, CURDATE()),
('Primeros Auxilios', 'Productos para primeros auxilios y emergencias', true, CURDATE()),
('Bebé y Mamá', 'Productos para el cuidado de bebés y madres', true, CURDATE()),
('Dermocosméticos', 'Productos dermatológicos y cosméticos', true, CURDATE()),
('Equipos Médicos', 'Equipos y dispositivos médicos', true, CURDATE()),
('Nutrición Deportiva', 'Suplementos para deportistas', true, CURDATE());

-- Proveedores
INSERT INTO proveedor (nombre_comercial, ruc, telefono, correo, persona_contacto, tipo_producto, condiciones_pago, estado, fecha_registro) VALUES 
('Laboratorios Bago', '20123456789', '01-2345678', 'ventas@bago.com.pe', 'Carlos Mendoza', 'Medicamentos', 'Crédito 30 días', true, CURDATE()),
('Droguería Alfaro', '20987654321', '01-8765432', 'contacto@alfaro.com.pe', 'Ana García', 'Medicamentos Genéricos', 'Contado', true, CURDATE()),
('Distribuidora Médica SAC', '20456789123', '01-4567891', 'info@distmedica.pe', 'Luis Rodríguez', 'Equipos Médicos', 'Crédito 45 días', true, CURDATE()),
('Cosméticos Naturales EIRL', '20789123456', '01-7891234', 'ventas@cosmenat.pe', 'María Flores', 'Dermocosméticos', 'Crédito 15 días', true, CURDATE());

-- Usuarios con contraseñas correctamente hasheadas con BCrypt
-- CREDENCIALES: admin@ecosalud.pe / admin123 | cliente@test.com / cliente123
INSERT INTO usuarios (email, password, nombres, apellidos, rol, activo, fecha_registro) VALUES 
('admin@ecosalud.pe', '$2a$10$o0dV.Z3U5w/kfuSZWUwyZees.VbzyimnwdN7vBKN.ytOi5V8EHniG', 'Administrador', 'Sistema', 'ADMIN', true, CURDATE()),
('cliente@test.com', '$2a$10$gkSrT0wGl1zpCtSXA1Eg2OtDAdpzdaMBpU3O0FMj1f2l.zNhyz.UO', 'Cliente', 'Prueba', 'USER', true, CURDATE());

-- Productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, precio, stock, imagen, activo, fecha_creacion, id_categoria, id_proveedor) VALUES 
('MED001', 'Paracetamol 500mg', 'Analgésico y antipirético - Caja x 20 tabletas', 8.50, 100, 'paracetamol.jpg', true, CURDATE(), 1, 1),
('MED002', 'Ibuprofeno 400mg', 'Antiinflamatorio - Caja x 10 cápsulas', 12.00, 75, 'ibuprofeno.jpg', true, CURDATE(), 1, 1),
('VIT001', 'Vitamina C 1000mg', 'Suplemento vitamínico - Frasco x 60 tabletas', 25.00, 50, 'vitamina-c.jpg', true, CURDATE(), 2, 2),
('VIT002', 'Complejo B', 'Vitaminas del complejo B - Frasco x 30 cápsulas', 18.50, 40, 'complejo-b.jpg', true, CURDATE(), 2, 2),
('CP001', 'Shampoo Anticaspa', 'Shampoo medicado para caspa - Frasco 400ml', 22.00, 30, 'shampoo.jpg', true, CURDATE(), 3, 4),
('CP002', 'Crema Hidratante', 'Crema hidratante para piel seca - Tubo 100g', 35.00, 25, 'crema.jpg', true, CURDATE(), 6, 4),
('PA001', 'Alcohol en Gel', 'Alcohol en gel antibacterial - Frasco 250ml', 8.00, 80, 'alcohol-gel.jpg', true, CURDATE(), 4, 3),
('PA002', 'Gasas Estériles', 'Gasas estériles 10x10cm - Paquete x 10 unidades', 15.00, 60, 'gasas.jpg', true, CURDATE(), 4, 3),
('BB001', 'Pañales Talla M', 'Pañales desechables talla M - Paquete x 30 unidades', 45.00, 20, 'panales.jpg', true, CURDATE(), 5, 2),
('EQ001', 'Termómetro Digital', 'Termómetro digital con pantalla LCD', 28.00, 15, 'termometro.jpg', true, CURDATE(), 7, 3);

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para mejorar rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_proveedor ON productos(id_proveedor);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_carrito_usuario ON carrito(idUsuario);
CREATE INDEX idx_pedidos_usuario ON pedidos(idUsuario);
CREATE INDEX idx_pedidos_fecha ON pedidos(fechaPedido);
CREATE INDEX idx_detalle_pedido ON detalle_pedido(idPedido);

-- =====================================================
-- VERIFICACIÓN DE DATOS
-- =====================================================

-- Mostrar resumen de datos insertados
SELECT 'Métodos de Pago' as Tabla, COUNT(*) as Registros FROM metodos_pago
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM proveedor
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Productos', COUNT(*) FROM productos;

-- =====================================================
-- CREDENCIALES DE ACCESO VERIFICADAS
-- =====================================================
-- Admin: admin@ecosalud.pe / admin123
-- Cliente: cliente@test.com / cliente123
-- 
-- Estos hashes fueron generados y verificados con BCrypt
-- =====================================================