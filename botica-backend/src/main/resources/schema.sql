-- Schema completo para la base de datos de la botica
-- Generado basándose en las entidades JPA del proyecto

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATE
);

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
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(255) UNIQUE,
    direccion VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATE
);

-- Tabla de métodos de pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

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
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(255),
    fecha_pedido DATE,
    direccion_entrega VARCHAR(255),
    id_usuario BIGINT NOT NULL,
    id_metodo_pago BIGINT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id_metodo_pago)
);

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    id_pedido BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS carrito (
    id_carrito BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INTEGER NOT NULL DEFAULT 1,
    fecha_agregado DATE,
    id_usuario BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Tabla de tokens de reseteo de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP,
    id_usuario BIGINT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);