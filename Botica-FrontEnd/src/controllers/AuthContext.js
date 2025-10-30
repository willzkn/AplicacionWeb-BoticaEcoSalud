import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario desde localStorage al iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Función para iniciar sesión
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Función para actualizar datos del usuario
    const updateUser = (userData) => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Función para cerrar sesión
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => {
        return user !== null;
    };

    return (
        <AuthContext.Provider value={{ user, login, updateUser, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
