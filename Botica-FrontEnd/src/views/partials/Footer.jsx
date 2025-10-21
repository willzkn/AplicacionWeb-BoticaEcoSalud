import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';

function Footer() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="footer">
      <div className="footer-section">
        <h4>Accesos directos</h4>
        <Link to="/">Inicio</Link>
        <Link to="/catalogo">Catálogo</Link>
        <Link to="/carrito">Carrito</Link>
        {isAuthenticated() ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: '#1E4099' }}>👤 {user?.nombres || 'Usuario'}</span>
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #1E4099',
                color: '#1E4099',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </div>
      <div className="footer-section">
        <h4>Contáctanos</h4>
        <p>Teléfono: (01) 456 7890</p>
        <p>WhatsApp: +51 987 654 321</p>
        <p>Correo: contacto@ecosalud.pe</p>
        <Link to="/login">¿Alguna consulta rápida? Te invitamos a usar nuestro chatbot</Link>
      </div>
      <div className="footer-section">
        <div className="footer-logo">
          <img className="footer-logo-img" src={`${process.env.PUBLIC_URL}/assets/Logodef.png`} alt="EcoSalud" />
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              "Cuidamos tu salud con cercanía y confianza"
            </p>
          </div>
        </div>
        <h4>Horarios de atención</h4>
        <p>Lunes a Sábado:</p>
        <p>08:00 a.m. - 22:00 p.m.</p>
        <p>Domingo:</p>
        <p>10:00 a.m. - 19:00 p.m.</p>
        <p>Av. Los Olivos 345, Urb. Central Lima</p>
      </div>
    </div>
  );
}

export default Footer;
