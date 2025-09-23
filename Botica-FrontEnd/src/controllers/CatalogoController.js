        import { useState, useCallback } from 'react';
        import { initialProducts } from '../models/CatalogoModel';

        export default function useCatalogoController() {
        const [searchTerm, setSearchTerm] = useState('');
        const [filters, setFilters] = useState({});
        const [products, setProducts] = useState(initialProducts);

        // Asegura que siempre retorne un array
        const filterProducts = useCallback(() => {
            // Si no hay lógica de filtrado, retorna los productos directamente
            return products || []; // ← Garantiza que nunca sea undefined
        }, [searchTerm, products, filters]);

        const handleFilterChange = useCallback((filterName, value) => {
            setFilters(prevFilters => ({
            ...prevFilters,
            [filterName]: value
            }));
        }, []);

        return {
            products: filterProducts(), // ← Siempre será un array
            searchTerm,
            setSearchTerm,
            filters,
            handleFilterChange,
        };
        }