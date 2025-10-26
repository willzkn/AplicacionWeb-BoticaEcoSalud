// src/views/pages/CarritoView.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout'; 
import  CartItem  from '../partials/CartItem';
import '../../styles/carrito.css'; 
import '../../styles/CheckoutPage.css';
import { useCart } from '../../controllers/CartContext';
import { useAuth } from '../../controllers/AuthContext';

// Función convertir precio a string
const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const n = Number(priceStr.replace('S/.', '').replace(',', '.').trim());
    return isNaN(n) ? 0 : n;
};

function CarritoView() {
    // Obtener el contexto del carrito y autenticación
    const { cart, updateCartQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // Estado para controlar qué paso del acordeón está abierto
    const [activeStep, setActiveStep] = useState(1);
    
    // Estados para checkout
    const [metodosPago, setMetodosPago] = useState([]);
    const [selectedMetodoPago, setSelectedMetodoPago] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados para los datos del formulario
    const [shippingData, setShippingData] = useState({
        tipo: 'envio', // 'envio' o 'retiro'
        direccion: user?.direccion || '',
        referencia: '',
        tienda: ''
    });
    
    const [contactData, setContactData] = useState({
        nombre: user?.nombres || '',
        apellido: user?.apellidos || '',
        telefono: user?.telefono || '',
        email: user?.email || ''
    });
    
    const [paymentData, setPaymentData] = useState({
        metodo: 'tarjeta', // 'tarjeta', 'yape', 'plin', 'efectivo'
        numeroTarjeta: '',
        nombreTitular: '',
        fechaExpiracion: '',
        cvv: ''
    }); 

    // Debug: Mostrar información del usuario y carrito
    useEffect(() => {
        console.log('=== DEBUG CARRITO ===');
        console.log('isAuthenticated():', isAuthenticated());
        console.log('user:', user);
        console.log('cart:', cart);
        console.log('cart.length:', cart.length);
        console.log('====================');
    }, [user, cart, isAuthenticated]);

    // Cargar métodos de pago al montar el componente
    useEffect(() => {
        if (isAuthenticated() && cart.length > 0) {
            cargarMetodosPago();
        }
    }, [isAuthenticated, cart.length]);

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
        console.log('Iniciando procesarPedido...');
        console.log('selectedMetodoPago:', selectedMetodoPago);
        console.log('user:', user);
        console.log('cart:', cart);

        if (!selectedMetodoPago) {
            setError('Selecciona un método de pago');
            return;
        }

        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        if (!user || !user.idUsuario) {
            setError('Error: Usuario no válido. Por favor, inicia sesión nuevamente.');
            navigate('/login');
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

            console.log('detalles:', detalles);

            // Validar que todos los productos tengan ID y cantidad válidos
            const detallesInvalidos = detalles.filter(d => !d.idProducto || !d.cantidad || d.cantidad <= 0);
            if (detallesInvalidos.length > 0) {
                console.error('Detalles inválidos:', detallesInvalidos);
                setError('Error: Algunos productos del carrito no son válidos');
                return;
            }

            const pedidoRequest = {
                idUsuario: user.idUsuario,
                idMetodoPago: parseInt(selectedMetodoPago),
                detalles: detalles
            };

            console.log('pedidoRequest:', pedidoRequest);

            const response = await fetch('http://localhost:8080/api/pedidos/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token || 'dummy-token'}`,
                    'X-User-Role': user.rol || 'CLIENTE'
                },
                body: JSON.stringify(pedidoRequest)
            });

            console.log('response status:', response.status);

            if (response.ok) {
                const pedidoCreado = await response.json();
                console.log('pedidoCreado:', pedidoCreado);
                setSuccess('¡Pedido realizado exitosamente!');
                clearCart();
                
                // Redirigir a la página de confirmación después de 2 segundos
                setTimeout(() => {
                    navigate('/pedido-confirmado', { 
                        state: { pedido: pedidoCreado } 
                    });
                }, 2000);
            } else {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    setError(errorData.error || 'Error al procesar el pedido');
                } catch (e) {
                    setError(`Error del servidor: ${response.status} - ${errorText}`);
                }
            }
        } catch (error) {
            console.error('Error al procesar pedido:', error);
            setError(`Error de conexión: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Calcular el subtotal cada vez que el carrito cambie
    const subtotal = useMemo(() => {
        if (getTotalPrice) {
            return getTotalPrice().toFixed(2);
        }
        return cart.reduce((acc, item) => {
            const price = parsePrice(item.price);
            return acc + (price * item.quantity);
        }, 0).toFixed(2);
    }, [cart, getTotalPrice]);

    return (
        <MainLayout backgroundImageUrl={`${process.env.PUBLIC_URL}/assets/mi-fondo.JPG`}> 
            <div className="cart-container">
                <h1 className="page-title">Resumen de compra</h1>                
                {cart.length === 0 ? (
                    <div className="empty-cart-message">
                        <h2>Tu carrito está vacío.</h2>
                        <p>¡Explora nuestro <a href="/catalogo">catálogo</a> para encontrar tus productos!</p>
                    </div>
                ) : (
                    <div className="cart-content-wrapper">
                        <section className="cart-items-list" aria-labelledby="products-in-cart">
                            <h2 id="products-in-cart" className="section-header">Productos de tu carrito</h2>
                            {cart.map(item => (
                                <CartItem 
                                    key={item.id || item.idProducto || item.name}
                                    item={item} 
                                    updateQuantity={updateCartQuantity} 
                                    removeItem={removeFromCart} 
                                />
                            ))}
                        </section>
                        <aside className="checkout-summary">
                            <h2 className="section-header">¿Listo para continuar?</h2>
                            
                            <div className="accordion-steps">
                                {/* Paso 1: Dirección de envío */}
                                <div className={`accordion-item ${activeStep === 1 ? 'active' : ''}`}>
                                    <button 
                                        className="accordion-header"
                                        onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}
                                    >
                                        <span>1. Método de entrega</span>
                                        <span>{activeStep === 1 ? '▼' : '▶'}</span>
                                    </button>
                                    {activeStep === 1 && (
                                        <div className="accordion-content">
                                            <div className="form-group">
                                                <label>
                                                    <input 
                                                        type="radio" 
                                                        name="tipo"
                                                        value="envio"
                                                        checked={shippingData.tipo === 'envio'}
                                                        onChange={(e) => setShippingData({...shippingData, tipo: e.target.value})}
                                                    />
                                                    Delivery
                                                </label>
                                                <label>
                                                    <input 
                                                        type="radio" 
                                                        name="tipo"
                                                        value="retiro"
                                                        checked={shippingData.tipo === 'retiro'}
                                                        onChange={(e) => setShippingData({...shippingData, tipo: e.target.value})}
                                                    />
                                                    Recojo en tienda
                                                </label>
                                            </div>
                                            
                                            {shippingData.tipo === 'envio' ? (
                                                <>
                                                    <input 
                                                        type="text"
                                                        placeholder="Dirección completa"
                                                        value={shippingData.direccion}
                                                        onChange={(e) => setShippingData({...shippingData, direccion: e.target.value})}
                                                        className="form-input"
                                                    />
                                                    <input 
                                                        type="text"
                                                        placeholder="Ejm: Av. Los Pinos 456, Dpto. 302"
                                                        value={shippingData.referencia}
                                                        onChange={(e) => setShippingData({...shippingData, referencia: e.target.value})}
                                                        className="form-input"
                                                    />
                                                </>
                                            ) : (
                                                <select 
                                                    value={shippingData.tienda}
                                                    onChange={(e) => setShippingData({...shippingData, tienda: e.target.value})}
                                                    className="form-input"
                                                >
                                                    <option value="">Selecciona una sede</option>
                                                    <option value="tienda1">Sede Los Olivos</option>
                                                    <option value="tienda2">Sede San Miguel</option>
                                                    <option value="tienda3">Sede Miraflores</option>
                                                </select>
                                            )}
                                            <button 
                                                className="btn-next"
                                                onClick={() => setActiveStep(2)}
                                            >
                                                Continuar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Paso 2: Datos de contacto */}
                                <div className={`accordion-item ${activeStep === 2 ? 'active' : ''}`}>
                                    <button 
                                        className="accordion-header"
                                        onClick={() => setActiveStep(activeStep === 2 ? 0 : 2)}
                                    >
                                        <span>2. Tus datos </span>
                                        <span>{activeStep === 2 ? '▼' : '▶'}</span>
                                    </button>
                                    {activeStep === 2 && (
                                        <div className="accordion-content">
                                            <input 
                                                type="text"
                                                placeholder="Nombre"
                                                value={contactData.nombre}
                                                onChange={(e) => setContactData({...contactData, nombre: e.target.value})}
                                                className="form-input"
                                            />
                                            <input 
                                                type="text"
                                                placeholder="Apellido"
                                                value={contactData.apellido}
                                                onChange={(e) => setContactData({...contactData, apellido: e.target.value})}
                                                className="form-input"
                                            />
                                            <input 
                                                type="tel"
                                                placeholder="Teléfono"
                                                value={contactData.telefono}
                                                onChange={(e) => setContactData({...contactData, telefono: e.target.value})}
                                                className="form-input"
                                            />
                                            <input 
                                                type="email"
                                                placeholder="Email"
                                                value={contactData.email}
                                                onChange={(e) => setContactData({...contactData, email: e.target.value})}
                                                className="form-input"
                                            />
                                            <button 
                                                className="btn-next"
                                                onClick={() => setActiveStep(3)}
                                            >
                                                Continuar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Paso 3: Método de pago */}
                                <div className={`accordion-item ${activeStep === 3 ? 'active' : ''}`}>
                                    <button 
                                        className="accordion-header"
                                        onClick={() => setActiveStep(activeStep === 3 ? 0 : 3)}
                                    >
                                        <span>3. Método de pago</span>
                                        <span>{activeStep === 3 ? '▼' : '▶'}</span>
                                    </button>
                                    {activeStep === 3 && (
                                        <div className="accordion-content">
                                            {/* Mensajes de error/éxito */}
                                            {error && (
                                                <div className="message message-error" style={{marginBottom: '1rem'}}>
                                                    {error}
                                                </div>
                                            )}

                                            {success && (
                                                <div className="message message-success" style={{marginBottom: '1rem'}}>
                                                    {success}
                                                </div>
                                            )}

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
                                            
                                            <button 
                                                className="btn-next"
                                                onClick={() => setActiveStep(4)}
                                                disabled={!selectedMetodoPago}
                                            >
                                                Continuar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Paso 4: Resumen */}
                                <div className={`accordion-item ${activeStep === 4 ? 'active' : ''}`}>
                                    <button 
                                        className="accordion-header"
                                        onClick={() => setActiveStep(activeStep === 4 ? 0 : 4)}
                                    >
                                        <span>4. Resumen y confirmación</span>
                                        <span>{activeStep === 4 ? '▼' : '▶'}</span>
                                    </button>
                                    {activeStep === 4 && (
                                        <div className="accordion-content">
                                            <div className="summary-section">
                                                <h4>📦 Envío</h4>
                                                <p>{shippingData.tipo === 'envio' ? shippingData.direccion : `Retiro en ${shippingData.tienda}`}</p>
                                            </div>
                                            <div className="summary-section">
                                                <h4>👤 Contacto</h4>
                                                <p>{contactData.nombre} {contactData.apellido}</p>
                                                <p>{contactData.telefono} - {contactData.email}</p>
                                            </div>
                                            <div className="summary-section">
                                                <h4>💳 Pago</h4>
                                                <p>{metodosPago.find(m => m.idMetodoPago == selectedMetodoPago)?.nombre || 'No seleccionado'}</p>
                                            </div>
                                            <div className="summary-section">
                                                <h4>💰 Total</h4>
                                                <h3>S/.{subtotal}</h3>
                                            </div>
                                            
                                            {/* Botón para confirmar pedido */}
                                            <button 
                                                className="btn btn-primary"
                                                onClick={procesarPedido}
                                                disabled={loading || !selectedMetodoPago}
                                                style={{width: '100%', marginTop: '1rem'}}
                                            >
                                                {loading && <span className="loading-spinner"></span>}
                                                {loading ? 'Procesando...' : 'Confirmar Pedido'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="cart-total-footer">
                                <h3>Subtotal: S/.{subtotal}</h3>
                                
                                {/* Botón de debug temporal */}
                                {isAuthenticated() && metodosPago.length > 0 && (
                                    <button 
                                        className="checkout-btn"
                                        onClick={procesarPedido}
                                        disabled={loading || cart.length === 0}
                                        style={{backgroundColor: '#dc2626', marginBottom: '10px'}}
                                    >
                                        🐛 DEBUG: Procesar Pedido Directo
                                    </button>
                                )}
                                
                                <button 
                                    className="checkout-btn"
                                    onClick={() => {
                                        if (!isAuthenticated()) {
                                            navigate('/login');
                                        } else {
                                            setActiveStep(1);
                                            // Scroll hacia el acordeón
                                            document.querySelector('.accordion-steps')?.scrollIntoView({ 
                                                behavior: 'smooth' 
                                            });
                                        }
                                    }}
                                    disabled={cart.length === 0}
                                >
                                    {!isAuthenticated() ? 'Iniciar Sesión para Comprar' : 'Proceder al Checkout'}
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default CarritoView;