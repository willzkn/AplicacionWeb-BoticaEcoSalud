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
                const userData = JSON.parse(storedUser);
                setUser(userData);
                // Asegurar que el rol esté guardado
                localStorage.setItem('role', userData.rol === 'admin' ? 'ADMIN' : 'USER');
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('role');
            }
        }
        setLoading(false);
    }, []);

    // Función para iniciar sesión
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        // Guardar el rol por separado para RequireAdmin
        localStorage.setItem('role', userData.rol === 'admin' ? 'ADMIN' : 'USER');
    };

    // Función para cerrar sesión
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => {
        return user !== null;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
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
