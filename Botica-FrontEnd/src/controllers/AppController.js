
import { useState, useCallback } from 'react';
import { initialState } from '../models/AppModel';

export default function useAppController() {
    const [counter, setCounter] = useState(initialState.counter || 0);

    //  Nuevo estado para el carrito
    const [cart, setCart] = useState(initialState.cart || []);

    const increment = useCallback(() => setCounter((c) => c + 1), []);
    const decrement = useCallback(() => setCounter((c) => c - 1), []);

    // Lógica para agregar al carrito
    const addToCart = useCallback((product, quantity) => {
        setCart(prevCart => {
            // Normalizar el producto para usar tanto la estructura del frontend como del backend
            const normalizedProduct = {
                id: product.id || product.idProducto,
                idProducto: product.idProducto || product.id,
                name: product.name || product.nombre,
                nombre: product.nombre || product.name,
                price: product.price || product.precio,
                precio: typeof product.precio === 'number' ? product.precio : 
                       (typeof product.price === 'string' ? parseFloat(product.price.replace('S/.', '')) : product.price),
                src: product.src || product.imagen,
                imagen: product.imagen || product.src,
                presentation: product.presentation || product.presentacion,
                presentacion: product.presentacion || product.presentation,
                description: product.description || product.descripcion,
                descripcion: product.descripcion || product.description,
                quantity: quantity,
                cantidad: quantity
            };

            const productId = normalizedProduct.id;
            const existingItemIndex = prevCart.findIndex(item => 
                (item.id === productId) || (item.idProducto === productId)
            );

            if (existingItemIndex > -1) {
                // Si el producto existe, aumenta la cantidad
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                newCart[existingItemIndex].cantidad += quantity;
                return newCart;
            } else {
                // Si no existe, agrégalo al carrito
                return [...prevCart, normalizedProduct];
            }
        });
    }, []);

    // Logica para actualizar la cantidad
    const updateCartQuantity = useCallback((productId, quantity) => {
        setCart(prevCart => {
            if (quantity <= 0) {
                return prevCart.filter(item => 
                    item.id !== productId && item.idProducto !== productId
                );
            }
            return prevCart.map(item => {
                if (item.id === productId || item.idProducto === productId) {
                    return { 
                        ...item, 
                        quantity: quantity,
                        cantidad: quantity 
                    };
                }
                return item;
            });
        });
    }, []);

    // Lógica para eliminar
    const removeFromCart = useCallback((productId) => {
        setCart(prevCart => prevCart.filter(item => 
            item.id !== productId && item.idProducto !== productId
        ));
    }, []);

    // Lógica para limpiar el carrito
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    // Lógica para calcular el precio total
    const getTotalPrice = useCallback(() => {
        return cart.reduce((total, item) => {
            const precio = item.precio || (typeof item.price === 'string' ? 
                parseFloat(item.price.replace('S/.', '')) : item.price) || 0;
            const cantidad = item.cantidad || item.quantity || 0;
            return total + (precio * cantidad);
        }, 0);
    }, [cart]);

    // Lógica para obtener el número total de items
    const getTotalItems = useCallback(() => {
        return cart.reduce((total, item) => {
            const cantidad = item.cantidad || item.quantity || 0;
            return total + cantidad;
        }, 0);
    }, [cart]);

    return {
        title: initialState.title,
        subtitle: initialState.subtitle,
        counter,
        increment,
        decrement,

        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
    };
}