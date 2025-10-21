import React, { useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout'; 
import  CartItem  from '../partials/CartItem';
import '../../styles/carrito.css'; 
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
    const { cart, updateCartQuantity, removeFromCart } = useCart();
    const { user } = useAuth();
    
    // Estado para controlar qué paso del acordeón está abierto
    const [activeStep, setActiveStep] = useState(1);
    
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

    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => {
            const price = parsePrice(item.price);
            return acc + (price * item.quantity);
        }, 0).toFixed(2);
    }, [cart]);



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
                                    key={item.id}
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
                                            <select 
                                                value={paymentData.metodo}
                                                onChange={(e) => setPaymentData({...paymentData, metodo: e.target.value})}
                                                className="form-input"
                                            >
                                                <option value="tarjeta">Tarjeta de crédito/débito</option>
                                                <option value="yape">Yape</option>
                                                <option value="plin">Plin</option>
                                                <option value="efectivo">Efectivo</option>
                                            </select>
                                            
                                            {paymentData.metodo === 'tarjeta' && (
                                                <>
                                                    <input 
                                                        type="text"
                                                        placeholder="Número de tarjeta"
                                                        value={paymentData.numeroTarjeta}
                                                        onChange={(e) => setPaymentData({...paymentData, numeroTarjeta: e.target.value})}
                                                        className="form-input"
                                                        maxLength="16"
                                                    />
                                                    <input 
                                                        type="text"
                                                        placeholder="Nombre del titular"
                                                        value={paymentData.nombreTitular}
                                                        onChange={(e) => setPaymentData({...paymentData, nombreTitular: e.target.value})}
                                                        className="form-input"
                                                    />
                                                    <div style={{display: 'flex', gap: '10px'}}>
                                                        <input 
                                                            type="text"
                                                            placeholder="MM/AA"
                                                            value={paymentData.fechaExpiracion}
                                                            onChange={(e) => setPaymentData({...paymentData, fechaExpiracion: e.target.value})}
                                                            className="form-input"
                                                            maxLength="5"
                                                        />
                                                        <input 
                                                            type="text"
                                                            placeholder="CVV"
                                                            value={paymentData.cvv}
                                                            onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                                                            className="form-input"
                                                            maxLength="3"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            
                                            {(paymentData.metodo === 'yape' || paymentData.metodo === 'plin') && (
                                                <div className="payment-info">
                                                    <p>Realiza el pago escaneando el código QR</p>
                                                    <div className="qr-placeholder">📱 QR Code</div>
                                                </div>
                                            )}
                                            
                                            {paymentData.metodo === 'efectivo' && (
                                                <div className="payment-info">
                                                    <p>💵 Pago en efectivo al recibir el pedido</p>
                                                </div>
                                            )}
                                            
                                            <button 
                                                className="btn-next"
                                                onClick={() => setActiveStep(4)}
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
                                                <p>{paymentData.metodo === 'tarjeta' ? 'Tarjeta' : paymentData.metodo.toUpperCase()}</p>
                                            </div>
                                            <div className="summary-section">
                                                <h4>💰 Total</h4>
                                                <h3>S/.{subtotal}</h3>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subtotal y botón final */}
                            <div className="cart-total-footer">
                                <h3>Subtotal: S/.{subtotal}</h3>
                                <button 
                                    className="checkout-btn"
                                    onClick={() => alert('Pedido confirmado!')}
                                    disabled={activeStep !== 4}
                                >
                                    Confirmar Pedido
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
