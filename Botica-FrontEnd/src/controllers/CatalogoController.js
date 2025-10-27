import { useState, useMemo, useCallback, useEffect } from 'react';
import ProductoService from '../services/ProductoService';

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  const n = Number(priceStr.replace('S/.', '').replace(',', '.').trim());
  return isNaN(n) ? 0 : n;
};

export default function useCatalogoController() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceMax, setPriceMax] = useState(100); // soles
  const [presentations, setPresentations] = useState(new Set()); // 'Tableta', 'Jarabe', 'Cápsulas'
  const [sortOption, setSortOption] = useState('nuevo'); // 'nuevo' | 'desc' | 'asc' | 'rating'
  const [products, setProducts] = useState([]); // Solo productos del backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); // categorías activas desde backend

  const togglePresentation = useCallback((name) => {
    setPresentations(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setPriceMax(100);
    setPresentations(new Set());
    setSortOption('nuevo');
  }, []);

  // Cargar productos del backend al montar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productosBackend = await ProductoService.obtenerProductosPublicos();
        console.log('Productos del backend:', productosBackend);
        
        // Transformar productos del backend al formato del frontend
        const productosTransformados = productosBackend.map(producto => {
          try {
            return ProductoService.transformarProducto(producto);
          } catch (error) {
            console.error('Error al transformar producto:', producto, error);
            // Retornar un producto por defecto en caso de error
            return {
              id: producto.idProducto || Math.random(),
              idProducto: producto.idProducto || Math.random(),
              name: producto.nombre || 'Producto sin nombre',
              nombre: producto.nombre || 'Producto sin nombre',
              price: `S/.${(producto.precio || 0).toFixed(2)}`,
              precio: producto.precio || 0,
              src: `${process.env.PUBLIC_URL}/assets/paracetamol-generico.jpg`,
              imagen: null,
              presentation: 'General',
              presentacion: 'General',
              description: producto.descripcion || '',
              descripcion: producto.descripcion || '',
              stock: producto.stock || 0,
              activo: producto.activo !== false,
              codigo: producto.codigo || '',
              categoria: producto.categoria || null,
              proveedor: producto.proveedor || null
            };
          }
        });
        console.log('Productos transformados:', productosTransformados);
        
        setProducts(productosTransformados);
        
        // Actualizar el rango máximo de precio basado en los productos reales
        const precioMaximo = Math.max(...productosTransformados.map(p => p.precio));
        setPriceMax(Math.ceil(precioMaximo));
        
        // Cargar categorías activas para el filtro "Presentación"
        try {
          const resp = await fetch('http://localhost:8080/api/categorias/activas');
          if (resp.ok) {
            const cats = await resp.json();
            setCategories(Array.isArray(cats) ? cats : []);
          } else {
            setCategories([]);
          }
        } catch (e) {
          console.warn('No se pudieron cargar categorías activas', e);
          setCategories([]);
        }
        
      } catch (error) {
        console.error('Error al cargar productos del backend:', error);
        setError('Error al conectar con el servidor. No se pudieron cargar los productos.');
        setProducts([]); // Lista vacía si hay error
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Buscar por nombre (case-insensitive)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    // Rango de precio (0 - priceMax)
    list = list.filter(p => parsePrice(p.price) <= priceMax);

    // Presentación seleccionada(s): comparar con el campo transformado presentation
    if (presentations.size > 0) {
      list = list.filter(p => p.presentation && presentations.has(p.presentation));
    }

    // Orden
    if (sortOption === 'asc') {
      list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortOption === 'desc') {
      list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else if (sortOption === 'nuevo') {
      list.sort((a, b) => b.id - a.id);
    }
    // 'rating' no implementado por no existir campo; queda como orden por defecto

    return list;
  }, [products, searchTerm, priceMax, presentations, sortOption, categories]);

  return {
    // datos
    products: filteredProducts,
    loading,
    error,
    categories,
    // filtros y controladores
    searchTerm,
    setSearchTerm,
    priceMax,
    setPriceMax,
    presentations,
    togglePresentation,
    sortOption,
    setSortOption,
    clearFilters,
  };
}