import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SearchIcon = () => (
  <svg 
    className="search-icon" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MenuIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function Header({
  searchTerm = '',
  onSearchChange,
  onSearchKeyPress,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="header">
      <div className="logo">
        <Link to="/" aria-label="Ir al inicio">
          <img className="logo-img" src={`${process.env.PUBLIC_URL}/assets/Logodef.png`} alt="EcoSalud" />
        </Link>
      </div>

      <div className="search-center">
        <div className="search-container">
          <SearchIcon />
          <input
            type="text"
            className="search-input"
            placeholder="Busca una marca o producto"
            value={searchTerm}
            onChange={onSearchChange}
            onKeyPress={onSearchKeyPress}
            aria-label="Buscar"
          />
        </div>
      </div>

      {/* Botón hamburguesa */}
      <button 
        className="hamburger-btn" 
        onClick={toggleMenu}
        aria-label="Abrir menú"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Menú de navegación */}
      <nav className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
        <Link to="/" className="nav-link" onClick={closeMenu}>Inicio</Link>
        <Link to="/catalogo" className="nav-link" onClick={closeMenu}>Catálogo</Link>
        <Link to="/carrito" className="nav-link" onClick={closeMenu}>Carrito</Link>
        <Link to="/login" className="login-btn" onClick={closeMenu}>Iniciar sesión</Link>
      </nav>

      {/* Overlay para cerrar el menú al hacer click fuera */}
      {isMenuOpen && (
        <div 
          className="menu-overlay" 
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default Header;
