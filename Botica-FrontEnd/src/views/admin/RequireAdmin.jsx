import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';

/**
 * Componente de protección para rutas de administrador
 * Bloquea el acceso a usuarios que no tengan rol de ADMIN
 */
export default function RequireAdmin({ children }) {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated()) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location, 
          reason: 'authentication_required',
          message: 'Debes iniciar sesión para acceder a esta página'
        }} 
      />
    );
  }

  // Verificar si el usuario tiene rol de administrador
  const userRole = user?.rol || user?.role;
  if (userRole !== 'ADMIN' && userRole !== 'admin') {
    return (
      <Navigate 
        to="/access-denied" 
        replace 
        state={{ 
          from: location, 
          reason: 'insufficient_permissions',
          message: 'No tienes permisos para acceder a esta página de administrador'
        }} 
      />
    );
  }

  // Si todo está bien, mostrar el contenido
  return children;
}
