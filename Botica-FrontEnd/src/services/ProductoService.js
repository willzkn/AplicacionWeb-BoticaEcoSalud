// src/services/ProductoService.js

const API_BASE_URL = 'http://localhost:8080/api';

export const ProductoService = {

    // Obtener todos los productos públicos
    async obtenerProductosPublicos() {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/publicos`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Error al cargar productos');
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    },

    // Obtener producto por ID
    async obtenerProductoPorId(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/${id}`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Producto no encontrado');
        } catch (error) {
            console.error('Error al obtener producto:', error);
            throw error;
        }
    },

    // Buscar productos por nombre
    async buscarProductos(nombre) {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/buscar?nombre=${encodeURIComponent(nombre)}`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Error en la búsqueda');
        } catch (error) {
            console.error('Error al buscar productos:', error);
            throw error;
        }
    },

    // Obtener productos por categoría
    async obtenerProductosPorCategoria(categoriaId) {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/categoria/${categoriaId}`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Error al cargar productos de la categoría');
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            throw error;
        }
    },

    // Validar stock
    async validarStock(id, cantidad) {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/${id}/validarStock?cantidad=${cantidad}`);
            if (response.ok) {
                return await response.json();
            }
            return false;
        } catch (error) {
            console.error('Error al validar stock:', error);
            return false;
        }
    },

    // Obtener URL completa de imagen (soporta base64, data URLs y backend)
    obtenerUrlImagen(nombreImagen) {
        if (!nombreImagen || typeof nombreImagen !== 'string' || nombreImagen.trim() === '') {
            return `${API_BASE_URL}/imagenes/view/default-product.svg`;
        }

        const val = nombreImagen.trim();

        // 1) Si ya viene como data URL
        if (val.startsWith('data:image')) {
            return val;
        }

        // 2) Si es una URL absoluta
        if (val.startsWith('http')) {
            return val;
        }

        // 3) Si parece base64 "puro" (sin prefijo data:)
        // Heurística: es largo y solo contiene caracteres base64
        const base64Regex = /^[A-Za-z0-9+/=\r\n]+$/;
        if (val.length > 200 && base64Regex.test(val.replace(/\s/g, ''))) {
            // Intento de detectar formato por encabezado base64 (muy básico)
            // Si no se detecta, usar image/jpeg por defecto
            const mime = val.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
            return `data:${mime};base64,${val}`;
        }

        // 4) Caso por defecto: servido por backend; añadir cache-busting
        const cacheBust = `t=${Date.now()}`;
        const sep = val.includes('?') ? '&' : '?';
        return `${API_BASE_URL}/imagenes/view/${val}${sep}${cacheBust}`;
    },

    // Transformar producto del backend al formato del frontend
    transformarProducto(productoBackend) {
        return {
            id: productoBackend.idProducto,
            idProducto: productoBackend.idProducto,
            name: productoBackend.nombre,
            nombre: productoBackend.nombre,
            price: `S/.${productoBackend.precio.toFixed(2)}`,
            precio: productoBackend.precio,
            src: ProductoService.obtenerUrlImagen(productoBackend.imagen),
            imagen: productoBackend.imagen,
            // Presentación: usar descripcion de la categoría desde la BD
            presentation: (productoBackend.categoria?.descripcion || productoBackend.categoria?.nombre || 'General'),
            presentacion: (productoBackend.categoria?.descripcion || productoBackend.categoria?.nombre || 'General'),
            description: productoBackend.descripcion || '',
            descripcion: productoBackend.descripcion || '',
            stock: productoBackend.stock || 0,
            activo: productoBackend.activo,
            codigo: productoBackend.codigo,
            categoria: productoBackend.categoria,
            proveedor: productoBackend.proveedor
        };
    }
};

export default ProductoService;