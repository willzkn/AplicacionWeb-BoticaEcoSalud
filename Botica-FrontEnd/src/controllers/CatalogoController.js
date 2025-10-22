import { useState, useMemo, useCallback, useEffect } from 'react';
import { initialProducts } from '../models/CatalogoModel';

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  const n = Number(priceStr.replace('S/.', '').replace(',', '.').trim());
  return isNaN(n) ? 0 : n;
};

// Función para determinar la presentación basada en el nombre del producto
const determinePresentation = (productName) => {
  const name = productName.toLowerCase();
  if (name.includes('jarabe') || name.includes('syrup')) return 'Jarabe';
  if (name.includes('cápsula') || name.includes('capsule')) return 'Cápsulas';
  return 'Tableta'; // Por defecto
};

export default function useCatalogoController() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceMax, setPriceMax] = useState(100); // soles
  const [presentations, setPresentations] = useState(new Set()); // 'Tableta', 'Jarabe', 'Cápsulas'
  const [sortOption, setSortOption] = useState('nuevo'); // 'nuevo' | 'desc' | 'asc' | 'rating'
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  // Función para cargar productos desde la API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/productos');
      if (response.ok) {
        const apiProducts = await response.json();
        
        // Convertir productos de la API al formato del catálogo
        const formattedProducts = apiProducts.map(product => ({
          id: product.idProducto,
          name: product.nombre,
          price: `S/.${parseFloat(product.precio).toFixed(2)}`,
          src: product.imagen || `${process.env.PUBLIC_URL}/assets/paracetamol-generico.jpg`,
          presentation: determinePresentation(product.nombre), // Determinar presentación basada en el nombre
          description: product.descripcion || 'Sin descripción disponible'
        }));
        
        // Combinar productos de la API con productos iniciales
        const allProducts = [...formattedProducts, ...initialProducts];
        
        // Eliminar duplicados basados en el ID
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        setProducts(uniqueProducts);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // En caso de error, mantener productos iniciales
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Escuchar eventos de actualización de productos
  useEffect(() => {
    const handleProductUpdate = () => {
      loadProducts();
    };

    window.addEventListener('productUpdated', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
    };
  }, [loadProducts]);

  // Polling para actualizar productos cada 2 minutos (como respaldo)
  useEffect(() => {
    const interval = setInterval(() => {
      loadProducts();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [loadProducts]);

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

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Buscar por nombre (case-insensitive)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    // Rango de precio (0 - priceMax)
    list = list.filter(p => parsePrice(p.price) <= priceMax);

    // Presentación seleccionada(s)
    if (presentations.size > 0) {
      list = list.filter(p => presentations.has(p.presentation));
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
  }, [products, searchTerm, priceMax, presentations, sortOption]);

  return {
    // datos
    products: filteredProducts,
    loading,
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
    // función para refrescar manualmente
    refreshProducts: loadProducts,
  };
}