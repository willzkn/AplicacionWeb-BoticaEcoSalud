import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';
import { useCart } from '../../controllers/CartContext';
import '../../styles/CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart, getTotalPrice } = useCart();
  
  const [metodosPago, setMetodosPago] = useState([]);
  const [selectedMetodoPago, setSelectedMetodoPago] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar métodos de pago al montar el componente
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      navigate('/carrito');
      return;
    }

    cargarMetodosPago();
  }, []);

  const cargarMetodosPago = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/metodos-pago/activos');
      if (response.ok) {
        const data = await response.json();
        setMetodosPago(data);
        if (data.length > 0) {
          setSelectedMetodoPago(data[0].idMetodoPago);
        }
      }
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      setError('Error al cargar métodos de pago');
    }
  };

  const procesarPedido = async () => {
    if (!selectedMetodoPago) {
      setError('Selecciona un método de pago');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Preparar los detalles del pedido
      const detalles = cart.map(item => ({
        idProducto: item.idProducto || item.id,
        cantidad: item.cantidad || item.quantity
      }));

      const pedidoRequest = {
        idUsuario: user.idUsuario,
        idMetodoPago: parseInt(selectedMetodoPago),
        detalles: detalles
      };

      const response = await fetch('http://localhost:8080/api/pedidos/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || 'dummy-token'}`,
          'X-User-Role': user.rol || 'CLIENT'
        },
        body: JSON.stringify(pedidoRequest)
      });

      if (response.ok) {
        const pedidoCreado = await response.json();
        setSuccess('¡Pedido realizado exitosamente!');
        clearCart();
        
        // Redirigir a la página de confirmación después de 2 segundos
        setTimeout(() => {
          navigate('/pedido-confirmado', { 
            state: { pedido: pedidoCreado } 
          });
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al procesar el pedido');
      }
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      setError('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <div className="checkout-card">
          {/* Header */}
          <div className="checkout-header">
            <h1 className="checkout-title">Finalizar Compra</h1>
          </div>

          <div className="checkout-content">
            {/* Mensajes */}
            {error && (
              <div className="message message-error">
                {error}
              </div>
            )}

            {success && (
              <div className="message message-success">
                {success}
              </div>
            )}

            <div className="checkout-grid">
              {/* Resumen del pedido */}
              <div>
                <h2 className="section-title">Resumen del Pedido</h2>
                <div className="order-summary">
                  {cart.map((item) => (
                    <div key={item.idProducto || item.id} className="order-item">
                      <div className="item-info">
                        <h4>{item.nombre || item.name}</h4>
                        <p className="item-quantity">Cantidad: {item.cantidad || item.quantity}</p>
                      </div>
                      <p className="item-price">S/ {((item.precio || parseFloat((item.price || '0').replace('S/.', ''))) * (item.cantidad || item.quantity)).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <div className="order-total">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">S/ {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Información de pago */}
              <div>
                <h2 className="section-title">Método de Pago</h2>
                
                <div className="payment-methods">
                  {metodosPago.map((metodo) => (
                    <label 
                      key={metodo.idMetodoPago} 
                      className={`payment-option ${selectedMetodoPago == metodo.idMetodoPago ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="metodoPago"
                        value={metodo.idMetodoPago}
                        checked={selectedMetodoPago == metodo.idMetodoPago}
                        onChange={(e) => setSelectedMetodoPago(e.target.value)}
                        className="payment-radio"
                      />
                      <div className="payment-info">
                        <h4>{metodo.nombre}</h4>
                        <p className="payment-description">{metodo.descripcion}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Información del usuario */}
                <div className="delivery-info">
                  <h3 className="delivery-title">Información de Entrega</h3>
                  <div className="delivery-details">
                    <p><strong>Nombre:</strong> {user.nombres} {user.apellidos}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    {user.telefono && <p><strong>Teléfono:</strong> {user.telefono}</p>}
                    {user.direccion && <p><strong>Dirección:</strong> {user.direccion}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="checkout-actions">
              <button
                onClick={() => navigate('/carrito')}
                className="btn btn-secondary"
              >
                Volver al Carrito
              </button>
              
              <button
                onClick={procesarPedido}
                disabled={loading || !selectedMetodoPago}
                className="btn btn-primary"
              >
                {loading && <span className="loading-spinner"></span>}
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}