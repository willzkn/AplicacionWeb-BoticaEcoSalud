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

    // Obtener URL completa de imagen
    obtenerUrlImagen(nombreImagen) {
        // Si no hay imagen, usar imagen por defecto del backend
        if (!nombreImagen || nombreImagen.trim() === '') {
            return `${API_BASE_URL}/imagenes/view/default-product.svg`;
        }
        
        // Si ya es una URL completa, devolverla tal como está
        if (nombreImagen.startsWith('http')) {
            return nombreImagen;
        }
        
        // Todas las imágenes vienen del backend
        return `${API_BASE_URL}/imagenes/view/${nombreImagen}`;
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
            presentation: productoBackend.categoria?.nombre || 'General',
            presentacion: productoBackend.categoria?.nombre || 'General',
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