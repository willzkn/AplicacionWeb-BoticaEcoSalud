// src/views/pages/CarritoView.jsx

import React, { useMemo, useState, useEffect, useCallback } from 'react';

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
    return Number.isNaN(n) ? 0 : n;
};

const formatCardNumber = (value = '') => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const parts = digits.match(/.{1,4}/g);
    return parts ? parts.join(' ') : digits;
};

const normalizeExpiry = (value = '') => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const luhnCheck = (digits) => {
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i -= 1) {
        let digit = parseInt(digits[i], 10);
        if (Number.isNaN(digit)) {
            return false;
        }

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
};

const isValidCardNumber = (digits) => {
    if (!digits) return false;
    const length = digits.length;
    if (length < 13 || length > 19) return false;
    return luhnCheck(digits);
};

const getExpiryValidationError = (value) => {
    if (!value) return 'Ingresa la fecha de expiración';
    if (!/^\d{2}\/\d{2}$/.test(value)) return 'Usa el formato MM/AA';

    const month = parseInt(value.slice(0, 2), 10);
    const year = parseInt(value.slice(3), 10);

    if (Number.isNaN(month) || Number.isNaN(year)) {
        return 'Fecha inválida';
    }

    if (month < 1 || month > 12) {
        return 'Mes inválido';
    }

    const fullYear = year + 2000;
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expiryDate = new Date(fullYear, month - 1, 1);

    if (expiryDate < currentMonth) {
        return 'La tarjeta está vencida';
    }

    return '';
};

const createInitialPaymentData = () => ({
    metodo: 'tarjeta',
    tipoTarjeta: 'credito',
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: ''
});

const createEmptyPaymentErrors = () => ({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: ''
});

const CARD_KEYWORDS = ['tarjeta', 'card', 'crédito', 'credito', 'débito', 'debito'];
const CASH_KEYWORDS = ['efectivo', 'cash'];

const getMethodLookupValues = (metodo = {}) => [metodo.tipo, metodo.codigo, metodo.nombre]
    .filter(Boolean)
    .map((value) => value.toString().toLowerCase());

const hasKeyword = (keywords, lookupValues) =>
    lookupValues.some((value) => keywords.some((keyword) => value.includes(keyword)));

const isCardPaymentMethod = (metodo) => hasKeyword(CARD_KEYWORDS, getMethodLookupValues(metodo));

const isCashPaymentMethod = (metodo) => hasKeyword(CASH_KEYWORDS, getMethodLookupValues(metodo));

const isAllowedPaymentMethod = (metodo) =>
    isCardPaymentMethod(metodo) || isCashPaymentMethod(metodo);

const DEFAULT_INSTALLMENT_OPTIONS = ['1', '3', '6', '12'];

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
    const [showCardModal, setShowCardModal] = useState(false);
    const [cardSaved, setCardSaved] = useState(false);
    const [installmentOptions, setInstallmentOptions] = useState([]);
    const [selectedInstallment, setSelectedInstallment] = useState('');
    
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
    
    const [paymentData, setPaymentData] = useState(() => createInitialPaymentData()); 
    const [paymentErrors, setPaymentErrors] = useState(() => createEmptyPaymentErrors());

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

    const selectedMetodo = useMemo(
        () => metodosPago.find((metodo) => String(metodo.idMetodoPago) === String(selectedMetodoPago)),
        [metodosPago, selectedMetodoPago]
    );

    const isCardMethod = useMemo(() => {
        if (!selectedMetodo) return false;
        return isCardPaymentMethod(selectedMetodo);
    }, [selectedMetodo]);

    const requiresCardForm = useMemo(() => isCardMethod, [isCardMethod]);

    useEffect(() => {
        if (!requiresCardForm) {
            setPaymentErrors(createEmptyPaymentErrors());
            setCardSaved(false);
            setInstallmentOptions([]);
            setSelectedInstallment('');
            if (paymentErrors.cuotas) {
                setPaymentErrors((prev) => ({ ...prev, cuotas: '' }));
            }
        }
    }, [requiresCardForm, paymentErrors.cuotas]);

    useEffect(() => {
        if (!requiresCardForm) return;

        if (paymentData.tipoTarjeta === 'credito') {
            if (installmentOptions.length === 0) {
                setInstallmentOptions(DEFAULT_INSTALLMENT_OPTIONS);
                setSelectedInstallment(DEFAULT_INSTALLMENT_OPTIONS[0]);
            }
        } else {
            const isSingleInstallment = installmentOptions.length === 1 && installmentOptions[0] === '1';
            if (!isSingleInstallment) {
                setInstallmentOptions(['1']);
            }
            if (selectedInstallment !== '1') {
                setSelectedInstallment('1');
            }
            if (paymentErrors.cuotas) {
                setPaymentErrors((prev) => ({ ...prev, cuotas: '' }));
            }
        }
    }, [requiresCardForm, paymentData.tipoTarjeta, installmentOptions, selectedInstallment, paymentErrors.cuotas]);

    // Cargar métodos de pago al montar el componente
    useEffect(() => {
        if (isAuthenticated() && cart.length > 0) {
            cargarMetodosPago();
        }
    }, [isAuthenticated, cart.length]);

    const resetPaymentForm = useCallback(() => {
        setPaymentData(createInitialPaymentData());
        setPaymentErrors(createEmptyPaymentErrors());
        setCardSaved(false);
        setShowCardModal(false);
        setInstallmentOptions([]);
        setSelectedInstallment('');
    }, []);

    const handlePaymentFieldChange = useCallback((field, value) => {
        setPaymentData((prev) => {
            let nextValue = value;

            if (field === 'numeroTarjeta') {
                nextValue = formatCardNumber(value);
                setInstallmentOptions([]);
                setSelectedInstallment('');
            } else if (field === 'fechaExpiracion') {
                nextValue = normalizeExpiry(value);
            } else if (field === 'nombreTitular') {
                nextValue = value.toUpperCase();
            } else if (field === 'cvv') {
                nextValue = value.replace(/\D/g, '').slice(0, 3);
            }

            return {
                ...prev,
                [field]: nextValue
            };
        });

        setCardSaved(false);

        setPaymentErrors((prev) => ({
            ...prev,
            [field]: ''
        }));
        setSuccess('');
    }, []);

    const validatePaymentData = useCallback(() => {
        const errors = createEmptyPaymentErrors();

        if (!requiresCardForm) {
            return {
                isValid: true,
                errors
            };
        }

        const digits = paymentData.numeroTarjeta.replace(/\s/g, '');

        if (!digits) {
            errors.numeroTarjeta = 'Ingresa el número de tu tarjeta de crédito o débito';
        } else if (!isValidCardNumber(digits)) {
            errors.numeroTarjeta = 'Número de tarjeta inválido';
        }

        if (!paymentData.nombreTitular.trim()) {
            errors.nombreTitular = 'Ingresa el nombre del titular';
        }

        const expiryError = getExpiryValidationError(paymentData.fechaExpiracion);
        if (expiryError) {
            errors.fechaExpiracion = expiryError;
        }

        if (!paymentData.cvv) {
            errors.cvv = 'Ingresa el CVV';
        } else if (!/^\d{3}$/.test(paymentData.cvv)) {
            errors.cvv = 'El CVV debe tener 3 dígitos';
        }

        if (paymentData.tipoTarjeta === 'credito' && (!selectedInstallment || selectedInstallment === '')) {
            errors.cuotas = 'Selecciona el número de cuotas';
        }

        const isValid = Object.values(errors).every((message) => !message);
        return { isValid, errors };
    }, [requiresCardForm, paymentData, selectedInstallment]);

    const handleValidatePaymentOnBlur = useCallback(() => {
        setPaymentErrors(validatePaymentData().errors);
    }, [validatePaymentData]);

    const handleMetodoPagoChange = useCallback((value) => {
        setSelectedMetodoPago(value);
        const metodoSeleccionado = metodosPago.find((metodo) => String(metodo.idMetodoPago) === String(value));
        if (metodoSeleccionado && requiresCardForm) {
            setShowCardModal(true);
            setCardSaved(false);
            setSuccess('');
            setError('');
            setPaymentData((prev) => ({
                ...prev,
                tipoTarjeta: prev?.tipoTarjeta || 'credito'
            }));
            if (installmentOptions.length === 0) {
                setInstallmentOptions(DEFAULT_INSTALLMENT_OPTIONS);
                setSelectedInstallment(DEFAULT_INSTALLMENT_OPTIONS[0]);
            }
        } else {
            setShowCardModal(false);
            setCardSaved(false);
            setSuccess('');
            setError('');
            setInstallmentOptions([]);
            setSelectedInstallment('');
        }
    }, [metodosPago, installmentOptions.length, requiresCardForm]);

    // Auto-show card modal when step 3 is activated - EVERY TIME
    useEffect(() => {
        if (activeStep === 3 && requiresCardForm && !showCardModal) {
            setShowCardModal(true);
            setCardSaved(false);
            setSuccess('');
            setError('');
            if (installmentOptions.length === 0) {
                setInstallmentOptions(DEFAULT_INSTALLMENT_OPTIONS);
                setSelectedInstallment(DEFAULT_INSTALLMENT_OPTIONS[0]);
            }
        }
    }, [activeStep, requiresCardForm, showCardModal, installmentOptions.length]);

    const handleCardTypeChange = useCallback((tipo) => {
        setPaymentData((prev) => ({
            ...prev,
            tipoTarjeta: tipo
        }));
        setCardSaved(false);
        setSuccess('');
        setPaymentErrors((prev) => ({ ...prev, cuotas: '' }));
        if (tipo === 'credito') {
            setInstallmentOptions(DEFAULT_INSTALLMENT_OPTIONS);
            setSelectedInstallment(DEFAULT_INSTALLMENT_OPTIONS[0]);
        } else {
            setInstallmentOptions(['1']);
            setSelectedInstallment('1');
        }
    }, []);

    const handleInstallmentChange = useCallback((value) => {
        setSelectedInstallment(value);
        setCardSaved(false);
        setSuccess('');
        setPaymentErrors((prev) => ({ ...prev, cuotas: '' }));
    }, []);

    const handleCardModalClose = useCallback(() => {
        setShowCardModal(false);
        if (!cardSaved) {
            setSelectedMetodoPago('');
        }
    }, [cardSaved]);

    const handleCardModalSave = useCallback(() => {
        const { isValid, errors } = validatePaymentData();
        setPaymentErrors(errors);
        if (!isValid) {
            return;
        }
        setCardSaved(true);
        setShowCardModal(false);
        setSuccess('Datos de la tarjeta guardados correctamente.');
        // Avanzar automáticamente al paso 4
        setActiveStep(4);
    }, [validatePaymentData, setActiveStep]);

    const handlePaymentStepContinue = useCallback(() => {
        if (!selectedMetodoPago) {
            setError('Selecciona un método de pago');
            return;
        }

        if (requiresCardForm) {
            if (!cardSaved) {
                setError('Guarda primero los datos de tu tarjeta.');
                setShowCardModal(true);
                return;
            }
            const { isValid, errors } = validatePaymentData();
            setPaymentErrors(errors);

            if (!isValid) {
                setError('Revisa los datos de tu tarjeta.');
                return;
            }
        }

        setError('');
        setActiveStep(4);
    }, [requiresCardForm, selectedMetodoPago, setActiveStep, setError, validatePaymentData]);

    const maskedCardNumber = useMemo(() => {
        const digits = paymentData.numeroTarjeta.replace(/\D/g, '');
        if (digits.length < 4) return '';
        return `**** **** **** ${digits.slice(-4)}`;
    }, [paymentData.numeroTarjeta]);

    // Cargar métodos de pago al montar el componente
    const cargarMetodosPago = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/metodos-pago/activos');
            if (response.ok) {
                const data = await response.json();
                const filteredMetodos = Array.isArray(data) ? data.filter(isAllowedPaymentMethod) : [];
                setMetodosPago(filteredMetodos);
                if (filteredMetodos.length > 0) {
                    const metodoTarjeta = filteredMetodos.find(isCardPaymentMethod);
                    const metodoSeleccionado = metodoTarjeta || filteredMetodos[0];
                    setSelectedMetodoPago(metodoSeleccionado?.idMetodoPago ?? '');
                } else {
                    setSelectedMetodoPago('');
                }
            }
        } catch (error) {
            console.error('Error al cargar métodos de pago:', error);
            setError('Error al cargar métodos de pago');
        }
    };

    const generarPDFBoleta = useCallback(async (pedido, detalles = []) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            const logoPath = `${process.env.PUBLIC_URL}/assets/Logodef.png`;
            const logoImg = new Image();
            logoImg.src = logoPath;

            await new Promise((resolve) => {
                logoImg.onload = resolve;
                logoImg.onerror = () => resolve();
            });

            if (logoImg.complete && logoImg.naturalHeight !== 0) {
                doc.addImage(logoImg, 'PNG', 10, 10, 40, 20);
            }

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('BOLETA DE VENTA', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Botica EcoSalud', pageWidth / 2, 28, { align: 'center' });
            doc.text('RUC: 20123456789', pageWidth / 2, 33, { align: 'center' });
            doc.text('Dirección: Av. Principal 123, Lima', pageWidth / 2, 38, { align: 'center' });

            doc.setLineWidth(0.5);
            doc.line(10, 43, pageWidth - 10, 43);

            let yPos = 50;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`Pedido N°: ${pedido.idPedido}`, 10, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha: ${pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString() : new Date().toLocaleDateString()}`, 10, yPos);
            yPos += 6;
            doc.text(`Estado: ${pedido.estado || 'PENDIENTE'}`, 10, yPos);
            yPos += 6;
            doc.text(`Método de Pago: ${pedido.metodoPago?.nombre || 'N/A'}`, 10, yPos);

            yPos += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('DATOS DEL CLIENTE', 10, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.text(`Cliente: ${pedido.usuario?.nombres || ''} ${pedido.usuario?.apellidos || ''}`, 10, yPos);
            yPos += 6;
            doc.text(`Email: ${pedido.usuario?.email || ''}`, 10, yPos);
            yPos += 6;
            if (pedido.usuario?.telefono) {
                doc.text(`Teléfono: ${pedido.usuario.telefono}`, 10, yPos);
                yPos += 6;
            }
            if (pedido.usuario?.direccion) {
                doc.text(`Dirección: ${pedido.usuario.direccion}`, 10, yPos);
                yPos += 6;
            }

            yPos += 4;
            doc.line(10, yPos, pageWidth - 10, yPos);
            yPos += 8;

            doc.setFont('helvetica', 'bold');
            doc.text('N°', 10, yPos);
            doc.text('Producto', 25, yPos);
            doc.text('Cant.', 120, yPos);
            doc.text('P. Unit.', 145, yPos);
            doc.text('Subtotal', 175, yPos);
            yPos += 2;
            doc.line(10, yPos, pageWidth - 10, yPos);
            yPos += 6;

            doc.setFont('helvetica', 'normal');
            let total = 0;

            detalles.forEach((detalle, index) => {
                const producto = detalle.producto || {};
                const numeroSecuencial = index + 1;
                const nombre = producto.nombre || 'Producto';
                const cantidad = detalle.cantidad || 1;
                const precioUnitario = detalle.precioUnitario || 0;
                const subtotal = detalle.subtotal || (precioUnitario * cantidad);

                doc.text(String(numeroSecuencial), 10, yPos);
                const nombreCorto = nombre.length > 35 ? `${nombre.substring(0, 35)}...` : nombre;
                doc.text(nombreCorto, 25, yPos);
                doc.text(String(cantidad), 120, yPos);
                doc.text(`S/. ${precioUnitario.toFixed(2)}`, 145, yPos);
                doc.text(`S/. ${subtotal.toFixed(2)}`, 175, yPos);

                total += subtotal;
                yPos += 6;

                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            
            yPos += 4;
            doc.line(10, yPos, pageWidth - 10, yPos);
            yPos += 8;
            // Cálculo de IGV y subtotal
            const igv = (pedido.total || total) * 0.18; // 18% de IGV
            const subtotal = (pedido.total || total) - igv;
            // Mostrar subtotal
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Subtotal: S/. ${subtotal.toFixed(2)}`, pageWidth - 10, yPos, { align: 'right' });
            yPos += 6;
            // Mostrar IGV
            doc.text(`IGV (18%): S/. ${igv.toFixed(2)}`, pageWidth - 10, yPos, { align: 'right' });
            yPos += 6;
            // Línea divisoria antes del total
            doc.line(pageWidth - 100, yPos, pageWidth - 10, yPos);
            yPos += 8;
            // Mostrar total
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`TOTAL: S/. ${(pedido.total || total).toFixed(2)}`, pageWidth - 10, yPos, { align: 'right' });
            yPos += 6;



            yPos += 15;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text('¡Gracias por su compra!', pageWidth / 2, yPos, { align: 'center' });
            yPos += 5;
            doc.text('Botica EcoSalud - Cuidando tu salud naturalmente', pageWidth / 2, yPos, { align: 'center' });

            const fileName = `Boleta_${pedido.idPedido}.pdf`;
            doc.save(fileName);
        } catch (err) {
            console.error('Error al generar PDF:', err);
            setError('Error al generar la boleta PDF');
        }
    }, [setError]);

    const enviarConfirmacionConBoleta = useCallback(async (pedido) => {
        try {
            if (!pedido || !pedido.idPedido) return;

            // Primero generar el PDF
            const detallesResponse = await fetch(`http://localhost:8080/api/pedidos/${pedido.idPedido}/detalles`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || 'dummy-token'}`,
                    'X-User-Role': user?.rol || 'USER'
                }
            });

            let detalles = [];
            if (detallesResponse.ok) {
                const detallesData = await detallesResponse.json();
                detalles = Array.isArray(detallesData) ? detallesData : [];
            }

            await generarPDFBoleta(pedido, detalles);

            // Enviar correo de confirmación con la boleta
            const emailResponse = await fetch(`http://localhost:8080/api/pedidos/${pedido.idPedido}/enviar-confirmacion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || 'dummy-token'}`,
                    'X-User-Role': user?.rol || 'USER'
                }
            });

            if (emailResponse.ok) {
                console.log('Correo de confirmación enviado exitosamente');
            } else {
                console.error('Error al enviar correo de confirmación:', emailResponse.status);
            }
        } catch (err) {
            console.error('Error al enviar confirmación con boleta:', err);
        }
    }, [generarPDFBoleta, user]);

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

        if (requiresCardForm) {
            if (!cardSaved) {
                setError('Guarda primero los datos de tu tarjeta.');
                setShowCardModal(true);
                return;
            }

            const { isValid, errors } = validatePaymentData();
            setPaymentErrors(errors);

            if (!isValid) {
                setError('Revisa los datos de tu tarjeta.');
                setActiveStep(3);
                return;
            }
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

            const cardDigits = paymentData.numeroTarjeta.replace(/\s/g, '');
            const paymentPayload = requiresCardForm ? {
                tipoTarjeta: 'CARD',
                numeroTarjeta: cardDigits,
                ultimosDigitos: cardDigits.slice(-4),
                nombreTitular: paymentData.nombreTitular.trim(),
                fechaExpiracion: paymentData.fechaExpiracion,
                cvv: paymentData.cvv,
                modalidad: paymentData.tipoTarjeta,
                cuotas: paymentData.tipoTarjeta === 'credito' ? selectedInstallment : '1'
            } : null;

            const pedidoRequest = {
                idUsuario: user.idUsuario,
                idMetodoPago: parseInt(selectedMetodoPago, 10),
                detalles,
                ...(paymentPayload ? { datosPago: paymentPayload } : {})
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
                resetPaymentForm();
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
                                onClick={() => enviarConfirmacionConBoleta(pedidoActual)}
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
                                    resetPaymentForm();
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCardModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content card-modal" style={{ maxWidth: '520px', width: '100%', padding: '28px 32px', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(30,64,175,0.35)' }}>
                        <div className="card-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '22px', color: '#1f2937' }}>Datos de la tarjeta</h2>
                                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280' }}>Ingresa la información como aparece en tu tarjeta.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCardModalClose}
                                style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>

                        <div className="card-preview card-preview-lg" style={{ background: 'linear-gradient(135deg, #0ea5e9, #4338ca)', borderRadius: '18px', padding: '22px 24px', color: '#fff', boxShadow: '0 20px 40px -12px rgba(14,165,233,0.45)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, letterSpacing: '0.06em' }}>BOTICA ECOSALUD</span>
                                <span style={{ width: '36px', height: '26px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.25)' }}></span>
                            </div>
                            <div style={{ margin: '28px 0 18px', fontSize: '24px', letterSpacing: '0.18em' }}>
                                {paymentData.numeroTarjeta || '**** **** **** ****'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                <div>
                                    <span style={{ display: 'block', opacity: 0.7 }}>Titular</span>
                                    <span style={{ fontSize: '14px', letterSpacing: '0.05em' }}>{paymentData.nombreTitular || 'NOMBRE APELLIDO'}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', opacity: 0.7 }}>Expira</span>
                                    <span style={{ fontSize: '14px', letterSpacing: '0.05em' }}>{paymentData.fechaExpiracion || 'MM/AA'}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', opacity: 0.7 }}>CVV</span>
                                    <span style={{ fontSize: '14px', letterSpacing: '0.05em' }}>{paymentData.cvv ? '***' : '***'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-modal-body" style={{ display: 'grid', gap: '16px' }}>
                            <div className="card-type-toggle" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
                                <button
                                    type="button"
                                    className={`btn-secondary ${paymentData.tipoTarjeta === 'credito' ? 'active' : ''}`}
                                    onClick={() => handleCardTypeChange('credito')}
                                    style={{ padding: '10px 18px', borderRadius: '999px', borderWidth: paymentData.tipoTarjeta === 'credito' ? '2px' : '1px', borderColor: paymentData.tipoTarjeta === 'credito' ? '#4338ca' : '#d1d5db', color: paymentData.tipoTarjeta === 'credito' ? '#4338ca' : '#374151', background: paymentData.tipoTarjeta === 'credito' ? 'rgba(67,56,202,0.08)' : '#fff', transition: 'all 0.2s ease' }}
                                >
                                    Crédito
                                </button>
                                <button
                                    type="button"
                                    className={`btn-secondary ${paymentData.tipoTarjeta === 'debito' ? 'active' : ''}`}
                                    onClick={() => handleCardTypeChange('debito')}
                                    style={{ padding: '10px 18px', borderRadius: '999px', borderWidth: paymentData.tipoTarjeta === 'debito' ? '2px' : '1px', borderColor: paymentData.tipoTarjeta === 'debito' ? '#16a085' : '#d1d5db', color: paymentData.tipoTarjeta === 'debito' ? '#0f766e' : '#374151', background: paymentData.tipoTarjeta === 'debito' ? 'rgba(14,165,233,0.08)' : '#fff', transition: 'all 0.2s ease' }}
                                >
                                    Débito
                                </button>
                            </div>

                            <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                                Número de tarjeta
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                    placeholder="XXXX XXXX XXXX XXXX"
                                    value={paymentData.numeroTarjeta}
                                    onChange={(e) => handlePaymentFieldChange('numeroTarjeta', e.target.value)}
                                    onBlur={handleValidatePaymentOnBlur}
                                    className="form-input"
                                    style={{ padding: '14px 16px', borderRadius: '10px', border: paymentErrors.numeroTarjeta ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                                />
                                {paymentErrors.numeroTarjeta && (
                                    <span style={{ color: '#dc2626', fontSize: '12px' }}>{paymentErrors.numeroTarjeta}</span>
                                )}
                            </label>

                            <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                                Nombre del titular (como figura en la tarjeta)
                                <input
                                    type="text"
                                    autoComplete="cc-name"
                                    placeholder="EJM: JUAN PEREZ"
                                    value={paymentData.nombreTitular}
                                    onChange={(e) => handlePaymentFieldChange('nombreTitular', e.target.value)}
                                    onBlur={handleValidatePaymentOnBlur}
                                    className="form-input"
                                    style={{ padding: '14px 16px', borderRadius: '10px', border: paymentErrors.nombreTitular ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                                />
                                {paymentErrors.nombreTitular && (
                                    <span style={{ color: '#dc2626', fontSize: '12px' }}>{paymentErrors.nombreTitular}</span>
                                )}
                            </label>

                            <div className="card-modal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                                <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                                    Fecha de expiración
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="cc-exp"
                                        placeholder="MM/AA"
                                        value={paymentData.fechaExpiracion}
                                        onChange={(e) => handlePaymentFieldChange('fechaExpiracion', e.target.value)}
                                        onBlur={handleValidatePaymentOnBlur}
                                        className="form-input"
                                        style={{ padding: '14px 16px', borderRadius: '10px', border: paymentErrors.fechaExpiracion ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                                    />
                                    {paymentErrors.fechaExpiracion && (
                                        <span style={{ color: '#dc2626', fontSize: '12px' }}>{paymentErrors.fechaExpiracion}</span>
                                    )}
                                </label>

                                <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                                    CVV
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        autoComplete="cc-csc"
                                        placeholder="123"
                                        value={paymentData.cvv}
                                        onChange={(e) => handlePaymentFieldChange('cvv', e.target.value)}
                                        onBlur={handleValidatePaymentOnBlur}
                                        className="form-input"
                                        maxLength={3}
                                        style={{ padding: '14px 16px', borderRadius: '10px', border: paymentErrors.cvv ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                                    />
                                    {paymentErrors.cvv && (
                                        <span style={{ color: '#dc2626', fontSize: '12px' }}>{paymentErrors.cvv}</span>
                                    )}
                                </label>
                            </div>

                            {paymentData.tipoTarjeta === 'credito' && (
                                <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                                    Cuotas
                                    <select
                                        value={selectedInstallment || ''}
                                        onChange={(e) => handleInstallmentChange(e.target.value)}
                                        className="form-input"
                                        style={{ padding: '14px 16px', borderRadius: '10px', border: paymentErrors.cuotas ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                                    >
                                        <option value="" disabled>Selecciona el número de cuotas</option>
                                        {installmentOptions.map((option) => (
                                            <option key={option} value={option}>{`${option} cuota${option === '1' ? '' : 's'}`}</option>
                                        ))}
                                    </select>
                                    {paymentErrors.cuotas && (
                                        <span style={{ color: '#dc2626', fontSize: '12px' }}>{paymentErrors.cuotas}</span>
                                    )}
                                </label>
                            )}
                        </div>

                        <div className="card-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '26px' }}>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleCardModalClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleCardModalSave}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                Guardar tarjeta
                                <span aria-hidden="true">💳</span>
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

                                            <div className="payment-methods-single">
                                                <div className="payment-option selected" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <h4 style={{ margin: 0 }}>Tarjeta de crédito o débito</h4>
                                                    <p className="payment-description">
                                                        Paga de forma segura directamente en nuestra web con validación en tiempo real.
                                                    </p>
                                                    <p className="payment-description" style={{ fontStyle: 'italic', fontSize: '13px', color: '#4b5563' }}>
                                                        Tus datos son procesados de forma segura con encriptación SSL.
                                                    </p>
                                                </div>
                                            </div>

                                            {requiresCardForm && (
                                                <div className="card-summary-section">
                                                    <div className="card-summary-header">
                                                        <div>
                                                            <h4 style={{ margin: 0, color: '#1f2937' }}>Tarjeta de crédito o débito</h4>
                                                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                                                                Paga de forma segura directamente en nuestra web.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {cardSaved && paymentData.tipoTarjeta === 'credito' && (
                                                        <div style={{ marginTop: '0.5rem', fontSize: '13px', color: '#1f2937' }}>
                                                            Cuotas seleccionadas: <strong>{selectedInstallment} cuota{selectedInstallment === '1' ? '' : 's'}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {cardSaved && (
                                                <div style={{ 
                                                    marginTop: '1rem', 
                                                    padding: '0.75rem', 
                                                    backgroundColor: '#f0fdf4', 
                                                    border: '1px solid #22c55e', 
                                                    borderRadius: '8px',
                                                    color: '#16a34a',
                                                    fontSize: '14px'
                                                }}>
                                                    ✓ Tarjeta validada correctamente: {maskedCardNumber}
                                                </div>
                                            )}
                                            
                                            <button 
                                                className="btn-next"
                                                onClick={handlePaymentStepContinue}
                                                disabled={!selectedMetodoPago || (requiresCardForm && !cardSaved)}
                                                style={{ 
                                                    marginTop: cardSaved ? '0.5rem' : '0',
                                                    opacity: (!selectedMetodoPago || (requiresCardForm && !cardSaved)) ? 0.5 : 1
                                                }}
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
                                                {requiresCardForm && maskedCardNumber && (
                                                    <p style={{ fontSize: '13px', color: '#4b5563' }}>Tarjeta • {maskedCardNumber}</p>
                                                )}
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