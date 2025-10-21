import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Guard sencillo: asume que en localStorage se guarda el rol del usuario autenticado
// p.ej. localStorage.setItem('role', 'ADMIN') después del login
export default function RequireAdmin({ children }) {
  const location = useLocation();
  const role = localStorage.getItem('role');

  if (role !== 'ADMIN') {
    return <Navigate to="/login" replace state={{ from: location, reason: 'forbidden' }} />;
  }

  return children;
}
