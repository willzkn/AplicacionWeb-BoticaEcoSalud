import React from 'react';
import '../../styles/ecosalud.css';
import useLoginController from '../../controllers/LoginController';
import MainLayout from '../layouts/MainLayout';
import { Link } from "react-router-dom";

function LoginView() {
  const {
    username,
    password,
    searchTerm,
    setUsername,
    setPassword,
    setSearchTerm,
    onSubmit,
    onSearchKeyPress,
  } = useLoginController();

  return (
    <MainLayout
      searchTerm={searchTerm}
      onSearchChange={(e) => setSearchTerm(e.target.value)}
      onSearchKeyPress={onSearchKeyPress}
    >
      {/* Login Form */}
      <div className="login-container liquid-glass">
        {/* Liquid blobs background */}
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />

        <div className="login-content">
          <h2 className="login-title">Iniciar sesión</h2>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Correo electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="Ej: pepito@gmail.com"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">Aceptar</button>
          </form>
          <div className="forgot-password-link">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
          <div className="register-link">
            ¿No tienes una cuenta?<br />
            <Link to="/register">Regístrate aquí</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default LoginView;
