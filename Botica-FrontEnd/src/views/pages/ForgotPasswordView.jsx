import React, { useState } from 'react';
import '../../styles/ecosalud.css';
import MainLayout from '../layouts/MainLayout';
import { Link } from "react-router-dom";

function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Por favor, ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('✅ Si el correo existe, recibirás un enlace de recuperación en tu bandeja de entrada.');
        setEmail('');
      } else if (response.status === 404) {
        setMessage('❌ El correo electrónico no está registrado.');
      } else {
        const errorText = await response.text();
        setMessage(`❌ ${errorText || 'Error al procesar la solicitud. Intenta nuevamente.'}`);
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
          <h2 className="login-title">Recuperar contraseña</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="Ej: pepito@gmail.com"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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
            ¿Recordaste tu contraseña?<br />
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ForgotPasswordView;
