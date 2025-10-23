-- Schema para MySQL (XAMPP)
-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS botica_ecosalud;
USE botica_ecosalud;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedor (
    id_proveedor BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(255),
    ruc VARCHAR(255),
    persona_contacto VARCHAR(255),
    telefono VARCHAR(255),
    correo VARCHAR(255),
    condiciones_pago VARCHAR(255),
    tipo_producto VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(255) UNIQUE,
    direccion TEXT,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'cliente',
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATE,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de métodos de pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id_producto BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    imagen VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATE,
    id_categoria BIGINT,
    id_proveedor BIGINT,
    INDEX idx_nombre (nombre),
    INDEX idx_precio (precio),
    INDEX idx_categoria (id_categoria),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion_entrega TEXT,
    id_usuario BIGINT NOT NULL,
    id_metodo_pago BIGINT NOT NULL,
    INDEX idx_fecha (fecha_pedido),
    INDEX idx_estado (estado),
    INDEX idx_usuario (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id_metodo_pago) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    id_pedido BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    INDEX idx_pedido (id_pedido),
    INDEX idx_producto (id_producto),
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS carrito (
    id_carrito BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INTEGER NOT NULL DEFAULT 1,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    INDEX idx_usuario_carrito (id_usuario),
    INDEX idx_producto_carrito (id_producto),
    UNIQUE KEY unique_user_product (id_usuario, id_producto),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tokens de reseteo de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_expiracion TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    id_usuario BIGINT NOT NULL,
    INDEX idx_token (token),
    INDEX idx_expiracion (fecha_expiracion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;