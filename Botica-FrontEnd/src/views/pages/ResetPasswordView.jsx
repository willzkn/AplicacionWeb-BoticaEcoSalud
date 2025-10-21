import React, { useState } from 'react';
import '../../styles/ecosalud.css';
import MainLayout from '../layouts/MainLayout';
import { Link, useSearchParams, useNavigate } from "react-router-dom";

function ResetPasswordView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nuevaPassword || !confirmarPassword) {
      alert('Por favor, completa todos los campos');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (nuevaPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!token) {
      alert('Token inválido o no proporcionado');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          nuevaPassword: nuevaPassword 
        }),
      });

      if (response.ok) {
        setMessage('✅ Contraseña actualizada exitosamente. Redirigiendo...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorMsg = await response.text();
        setMessage('❌ ' + errorMsg);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="login-container liquid-glass">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />

        <div className="login-content">
          <h2 className="login-title">Restablecer contraseña</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
            Ingresa tu nueva contraseña
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="nuevaPassword">Nueva contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                id="nuevaPassword"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="confirmarPassword">Confirmar contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                id="confirmarPassword"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Restablecer contraseña'}
            </button>
          </form>

          {message && (
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              borderRadius: '5px',
              background: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <div className="register-link">
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ResetPasswordView;
