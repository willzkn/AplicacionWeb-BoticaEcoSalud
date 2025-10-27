import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';
import MainLayout from '../layouts/MainLayout';
import '../../styles/access-denied.css';

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
    <MainLayout backgroundImageUrl={`${process.env.PUBLIC_URL}/assets/mi-fondo.JPG`}>
      <div className="access-denied-container">
        <div className="access-denied-card">
          {/* Icono de advertencia con estilo de botica */}
          <div className="access-denied-icon">
            <svg 
              className="icon-warning" 
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
          <h1 className="access-denied-title">
            🔒 Acceso Denegado
          </h1>
          
          {/* Mensaje personalizado */}
          <p className="access-denied-message">
            {message}
          </p>

          {/* Información adicional basada en el estado del usuario */}
          {!isAuthenticated() ? (
            <div className="access-denied-alert alert-info">
              <div className="alert-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="alert-content">
                <p>
                  Necesitas iniciar sesión con una cuenta de administrador para acceder a esta sección.
                </p>
              </div>
            </div>
          ) : (
            <div className="access-denied-alert alert-warning">
              <div className="alert-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="alert-content">
                <p>
                  Tu cuenta <strong>({user?.email})</strong> no tiene permisos de administrador. 
                  Solo los administradores pueden acceder a esta sección.
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="access-denied-actions">
            {!isAuthenticated() ? (
              <Link to="/login" className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Iniciar Sesión
              </Link>
            ) : (
              <Link to="/" className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Ir al Inicio
              </Link>
            )}
            
            <Link to="/catalogo" className="btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Ver Catálogo de Productos
            </Link>
          </div>

          {/* Información de contacto */}
          <div className="access-denied-footer">
            <p>
              💡 Si crees que esto es un error, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}