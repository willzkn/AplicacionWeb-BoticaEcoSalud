 import React from 'react';
 import { Link } from 'react-router-dom';
 import MainLayout from './MainLayout';
 import '../../styles/ecosalud.css';

// AdminLayout: reutiliza Header/Footer de MainLayout y agrega un sidebar simple para secciones de admin
export default function AdminLayout({ children }) {
  return (
    <MainLayout searchTerm="" onSearchChange={() => {}} onSearchKeyPress={() => {}}>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <h3 className="login-title">Panel Admin</h3>
            <ul>
              <li><Link to="/admin" className="link">Dashboard</Link></li>
              <li><Link to="/admin/usuarios" className="link">Usuarios</Link></li>
              <li><Link to="/admin/categorias" className="link">Categorías</Link></li>
              <li><Link to="/admin/productos" className="link">Productos</Link></li>
              <li><Link to="/admin/pedidos" className="link">Pedidos</Link></li>
            </ul>
          </nav>
        </aside>
        <section className="admin-content">
          {children}
        </section>
      </div>
    </MainLayout>
  );
}


