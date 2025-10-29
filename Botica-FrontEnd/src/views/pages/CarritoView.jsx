// src/views/pages/CarritoView.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout'; 
import  CartItem  from '../partials/CartItem';
import '../../styles/carrito.css'; 
import '../../styles/CheckoutPage.css';
import { useCart } from '../../controllers/CartContext';
import { useAuth } from '../../controllers/AuthContext';
import { jsPDF } from 'jspdf';
import { ProductoService } from '../../services/ProductoService';

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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pedidoActual, setPedidoActual] = useState(null);
    const [displayCart, setDisplayCart] = useState([]);
    
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

    useEffect(() => {
        let isMounted = true;
        const enrich = async () => {
            try {
                const enriched = await Promise.all(
                    (cart || []).map(async (item) => {
                        try {
                            const id = item.idProducto || item.id;
                            if (!id) return item;
                            const producto = await ProductoService.obtenerProductoPorId(id);
                            const src = ProductoService.obtenerUrlImagen(producto.imagen);
                            return { ...item, src, name: item.name || producto.nombre };
                        } catch {
                            return item;
                        }
                    })
                );
                if (isMounted) setDisplayCart(enriched);
            } catch {
                setDisplayCart(cart);
            }
        };
        enrich();
        return () => { isMounted = false; };
    }, [cart]);

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

    // Función para generar PDF de la boleta
    const generarPDFBoleta = async (pedido, options = {}) => {
        const { download = true, silent = false } = options;
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Cargar logo
            const logoPath = `${process.env.PUBLIC_URL}/assets/Logodef.png`;
            const logoImg = new Image();
            logoImg.src = logoPath;
            
            await new Promise((resolve) => {
                logoImg.onload = resolve;
                logoImg.onerror = () => {
                    console.warn('No se pudo cargar el logo');
                    resolve();
                };
            });
            
            // Agregar logo (arriba a la izquierda)
            if (logoImg.complete && logoImg.naturalHeight !== 0) {
                doc.addImage(logoImg, 'PNG', 10, 10, 40, 20);
            }
            
            // Título - BOLETA DE VENTA
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('BOLETA DE VENTA', pageWidth / 2, 20, { align: 'center' });
            
            // Información de la botica
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Botica EcoSalud', pageWidth / 2, 28, { align: 'center' });
            doc.text('RUC: 20123456789', pageWidth / 2, 33, { align: 'center' });
            doc.text('Dirección: Av. Principal 123, Lima', pageWidth / 2, 38, { align: 'center' });
            
            // Línea separadora
            doc.setLineWidth(0.5);
            doc.line(10, 43, pageWidth - 10, 43);
            
            // Información del pedido
            let yPos = 50;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`Pedido N°: ${pedido.idPedido || 'N/A'}`, 10, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha: ${pedido.fechaPedido || new Date().toLocaleDateString()}`, 10, yPos);
            yPos += 6;
            doc.text(`Estado: ${pedido.estado || 'PENDIENTE'}`, 10, yPos);
            yPos += 6;
            doc.text(`Método de Pago: ${pedido.metodoPago?.nombre || metodosPago.find(m => m.idMetodoPago == selectedMetodoPago)?.nombre || 'N/A'}`, 10, yPos);
            
            // Información del cliente
            yPos += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('DATOS DEL CLIENTE', 10, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.text(`Cliente: ${user?.nombres || ''} ${user?.apellidos || ''}`, 10, yPos);
            yPos += 6;
            doc.text(`Email: ${user?.email || ''}`, 10, yPos);
            yPos += 6;
            if (user?.telefono) {
                doc.text(`Teléfono: ${user.telefono}`, 10, yPos);
                yPos += 6;
            }
            if (contactData.direccion || user?.direccion) {
                doc.text(`Dirección: ${contactData.direccion || user?.direccion}`, 10, yPos);
                yPos += 6;
            }
            
            // Línea separadora
            yPos += 4;
            doc.line(10, yPos, pageWidth - 10, yPos);
            yPos += 8;
            
            // Encabezado de tabla de productos
            doc.setFont('helvetica', 'bold');
            doc.text('N°', 10, yPos);
            doc.text('Producto', 25, yPos);
            doc.text('Cant.', 120, yPos);
            doc.text('P. Unit.', 145, yPos);
            doc.text('Subtotal', 175, yPos);
            yPos += 2;
            doc.line(10, yPos, pageWidth - 10, yPos);
            yPos += 6;
            
            // Detalles de productos
            doc.setFont('helvetica', 'normal');
            let total = 0;
            
            // Obtener detalles del pedido o usar el carrito actual
            const detalles = pedido.detalles || cart.map(item => ({
                producto: {
                    idProducto: item.idProducto || item.id,
                    nombre: item.nombre || item.name,
                    precio: parsePrice(item.precio || item.price)
                },
                cantidad: item.cantidad || item.quantity || 1,
                precioUnitario: parsePrice(item.precio || item.price),
                subtotal: parsePrice(item.precio || item.price) * (item.cantidad || item.quantity || 1)
            }));
            
            detalles.forEach((detalle, index) => {
                const producto = detalle.producto || {};
                const numeroSecuencial = index + 1;
                const nombre = producto.nombre || detalle.nombre || 'Producto';
                const cantidad = detalle.cantidad || 1;
                const precioUnitario = detalle.precioUnitario || producto.precio || 0;
                const subtotal = detalle.subtotal || (precioUnitario * cantidad);
                
                doc.text(String(numeroSecuencial), 10, yPos);
                
                // Nombre del producto (con wrap si es muy largo)
                const nombreCorto = nombre.length > 35 ? nombre.substring(0, 35) + '...' : nombre;
                doc.text(nombreCorto, 25, yPos);
                
                doc.text(String(cantidad), 120, yPos);
                doc.text(`S/. ${precioUnitario.toFixed(2)}`, 145, yPos);
                doc.text(`S/. ${subtotal.toFixed(2)}`, 175, yPos);
                
                total += subtotal;
                yPos += 6;
                
                // Nueva página si es necesario
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
            });
            
            // Línea antes del total
            yPos += 4;
            doc.line(10, yPos, pageWidth - 10, yPos);
            yPos += 8;
            
            // Total
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`TOTAL: S/. ${(pedido.total || total).toFixed(2)}`, pageWidth - 10, yPos, { align: 'right' });
            
            // Pie de página
            yPos += 15;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text('¡Gracias por su compra!', pageWidth / 2, yPos, { align: 'center' });
            yPos += 5;
            doc.text('Botica EcoSalud - Cuidando tu salud naturalmente', pageWidth / 2, yPos, { align: 'center' });
            
            const qrPath = process.env.PUBLIC_URL + '/assets/QR.png';
                const qrImg = new Image();
                qrImg.src = qrPath;

                await new Promise((resolve) => {
                qrImg.onload = resolve;
                qrImg.onerror = () => {
                    console.warn("No se pudo cargar el QR");
                    resolve();
                };
                });

                // 🔹 Obtener dimensiones de la página
                const pageHeight = doc.internal.pageSize.getHeight();

                // 🔹 Agregar QR (abajo a la izquierda)
                if (qrImg.complete && qrImg.naturalHeight !== 0) {
                // Ajusta las coordenadas y tamaño según necesites
                const qrWidth = 30;
                const qrHeight = 30;
                const marginLeft = 10;
                const marginBottom = 10;

                doc.addImage(
                    qrImg,
                    "PNG",
                    marginLeft,
                    pageHeight - qrHeight - marginBottom,
                    qrWidth,
                    qrHeight
                );
                }
            // Guardar PDF
            const fileName = `Boleta_${pedido.idPedido || Date.now()}.pdf`;
            const dataUriString = doc.output('datauristring');
            const pdfBase64 = dataUriString.split(',')[1] || null;

            if (download) {
                doc.save(fileName);
            }

            if (!silent) {
                console.log('PDF generado exitosamente:', fileName);
            }

            return pdfBase64;
        } catch (error) {
            console.error('Error al generar PDF:', error);
            return null;
        }
    };

    const enviarConfirmacionConBoleta = async (pedido) => {
        if (!pedido?.idPedido) return;

        try {
            const pdfBase64 = await generarPDFBoleta(pedido, { download: false, silent: true });
            const body = pdfBase64 ? { boletaPdfBase64: pdfBase64 } : {};

            const response = await fetch(`http://localhost:8080/api/pedidos/${pedido.idPedido}/confirmacion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || 'dummy-token'}`,
                    'X-User-Role': user?.rol || 'USER'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al enviar confirmación de pedido:', response.status, errorText);
            } else {
                console.log('Confirmación de pedido enviada correctamente');
            }
        } catch (error) {
            console.error('Error al preparar o enviar la boleta del pedido:', error);
        }
    };

    const procesarPedido = async () => {
        console.log('Iniciando procesarPedido desde carrito...');
        console.log('selectedMetodoPago:', selectedMetodoPago);
        console.log('user:', user);
        console.log('user.rol:', user?.rol);

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
            // Preparar los detalles del pedido desde el carrito
            const detalles = cart.map(item => ({
                idProducto: item.idProducto || item.id,
                cantidad: item.cantidad || item.quantity || 1
            }));

            console.log('Productos en carrito:', cart);
            console.log('Detalles a enviar:', detalles);

            const pedidoRequest = {
                idUsuario: user.idUsuario,
                idMetodoPago: parseInt(selectedMetodoPago),
                detalles: detalles
            };

            console.log('pedidoRequest:', pedidoRequest);
            console.log('Headers a enviar:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token || 'dummy-token'}`,
                'X-User-Role': user.rol || 'USER'
            });

            const response = await fetch('http://localhost:8080/api/pedidos/crear-desde-carrito', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token || 'dummy-token'}`,
                    'X-User-Role': user.rol || 'USER'
                },
                body: JSON.stringify(pedidoRequest)
            });

            console.log('response status:', response.status);

            if (response.ok) {
                const pedidoCreado = await response.json();
                console.log('pedidoCreado:', pedidoCreado);
                
                // Guardar el pedido para poder descargarlo después
                setPedidoActual(pedidoCreado);

                // Enviar confirmación con la boleta generada desde el frontend
                await enviarConfirmacionConBoleta(pedidoCreado);

                // Mostrar modal de confirmación
                setShowConfirmModal(true);
                
                // Limpiar carrito
                clearCart();
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
            {/* Modal de confirmación de venta */}
            {showConfirmModal && pedidoActual && (
                <div className="modal-overlay">
                    <div className="modal-content success-modal">
                        <div className="modal-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h2>¡Venta registrada!</h2>
                        <p>Te llegará una confirmación a tu correo</p>
                        <div className="modal-email">
                            <strong>{user?.email}</strong>
                        </div>
                        <div className="modal-pedido-info">
                            <p style={{marginTop: '15px', fontSize: '14px', color: '#6b7280'}}>
                                Pedido N°: <strong>{pedidoActual.idPedido}</strong>
                            </p>
                        </div>
                        <div className="modal-buttons">
                            <button 
                                className="btn-download-pdf"
                                onClick={() => generarPDFBoleta(pedidoActual)}
                            >
                                📄 Descargar Boleta PDF
                            </button>
                            <button 
                                className="btn-close-modal"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setPedidoActual(null);
                                    setActiveStep(0);
                                    setSelectedMetodoPago('');
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            {displayCart.map(item => (
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
                                <p style={{fontSize: '14px', color: '#6b7280', marginTop: '10px'}}>
                                    Complete los pasos del checkout para confirmar su pedido
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default CarritoView;