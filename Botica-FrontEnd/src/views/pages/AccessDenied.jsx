import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';

/**
 * Página de acceso denegado
 * Se muestra cuando un usuario intenta acceder a una página sin permisos
 */
export default function AccessDenied() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const message = location.state?.message || 'No tienes permisos para acceder a esta página';
  const reason = location.state?.reason || 'insufficient_permissions';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Icono de advertencia */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg 
              className="h-6 w-6 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Título */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso Denegado
            </h2>
            
            {/* Mensaje personalizado */}
            <p className="text-sm text-gray-600 mb-6">
              {message}
            </p>

            {/* Información adicional basada en el estado del usuario */}
            {!isAuthenticated() ? (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Necesitas iniciar sesión con una cuenta de administrador para acceder a esta sección.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Tu cuenta ({user?.email}) no tiene permisos de administrador. 
                      Solo los administradores pueden acceder a esta sección.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-3">
              {!isAuthenticated() ? (
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Iniciar Sesión
                </Link>
              ) : (
                <Link
                  to="/"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ir al Inicio
                </Link>
              )}
              
              <Link
                to="/catalogo"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver Catálogo
              </Link>
            </div>

            {/* Información de contacto */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Si crees que esto es un error, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}