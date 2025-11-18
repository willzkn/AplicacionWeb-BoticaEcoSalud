import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../../controllers/CartContext';
import { useAuth } from '../../controllers/AuthContext';

const API_URL = 'http://localhost:8080/api/pedidos/checkout/mercadopago/confirmacion';

const STATUS_VARIANTS = {
  approved: {
    title: '¡Pago aprobado!',
    tone: 'success',
    description: 'Tu pedido fue confirmado y está listo para ser procesado.'
  },
  pending: {
    title: 'Pago pendiente',
    tone: 'warning',
    description: 'Mercado Pago está procesando tu pago. Te avisaremos cuando se confirme.'
  },
  in_process: {
    title: 'Pago en proceso',
    tone: 'warning',
    description: 'Estamos esperando la confirmación de Mercado Pago.'
  },
  authorized: {
    title: 'Pago autorizado',
    tone: 'warning',
    description: 'El pago fue autorizado pero aún no está confirmado.'
  },
  rejected: {
    title: 'Pago rechazado',
    tone: 'error',
    description: 'El pago no pudo completarse. Revisa tus datos o intenta con otro medio.'
  },
  cancelled: {
    title: 'Pago cancelado',
    tone: 'error',
    description: 'El pago fue cancelado. Puedes intentar nuevamente desde el carrito.'
  },
  refunded: {
    title: 'Pago reembolsado',
    tone: 'info',
    description: 'El pago fue reembolsado. Si tienes dudas contáctanos.'
  },
  charged_back: {
    title: 'Pago contracargado',
    tone: 'info',
    description: 'Mercado Pago informó una contracarga. Comunícate con soporte si es un error.'
  }
};

function PagoResultado() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const cartClearedRef = useRef(false);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const paymentId = searchParams.get('payment_id') || searchParams.get('paymentId');
  const preferenceId = searchParams.get('preference_id');
  const requestStatus = searchParams.get('status');

  const checkoutContext = useMemo(() => {
    try {
      const raw = localStorage.getItem('mpCheckoutContext');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!paymentId) {
      setError('No se recibió un identificador de pago válido.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchConfirmacion = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(API_URL);
        url.searchParams.set('payment_id', paymentId);
        if (preferenceId) url.searchParams.set('preference_id', preferenceId);
        if (requestStatus) url.searchParams.set('status', requestStatus);

        const headers = {
          'Content-Type': 'application/json'
        };
        if (user?.token) {
          headers.Authorization = `Bearer ${user.token}`;
        }
        if (user?.rol) {
          headers['X-User-Role'] = user.rol;
        }

        const response = await fetch(url.toString(), {
          headers,
          signal: controller.signal
        });

        if (!response.ok) {
          const text = await response.text();
          let message = 'No se pudo confirmar el pago.';
          try {
            const data = JSON.parse(text);
            if (data?.error) message = data.error;
          } catch {
            message = `${message} (${response.status})`;
          }
          throw new Error(message);
        }

        const data = await response.json();
        setResultado(data);
        localStorage.removeItem('mpCheckoutContext');

        const estado = (data?.pedidoEstado || '').toLowerCase();
        if (estado === 'completado' && !cartClearedRef.current) {
          clearCart();
          cartClearedRef.current = true;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'No se pudo confirmar el estado del pago.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmacion();
    return () => controller.abort();
  }, [paymentId, preferenceId, requestStatus, user, clearCart]);

  const tone = useMemo(() => {
    const status = (resultado?.status || requestStatus || '').toLowerCase();
    if (!status) return STATUS_VARIANTS.pending;
    return STATUS_VARIANTS[status] || {
      title: 'Estado del pago',
      tone: 'info',
      description: 'Hemos recibido la respuesta de Mercado Pago.'
    };
  }, [resultado, requestStatus]);

  const pedidoId = resultado?.pedido?.idPedido || checkoutContext?.pedidoId;
  const mensajePrincipal = resultado?.mensaje || tone.title;
  const descripcionSecundaria = tone.description;

  const renderStatusChip = (label, variant) => (
    <span className={`status-chip status-chip-${variant}`}>
      {label}
    </span>
  );

  return (
    <MainLayout>
      <div className="checkout-result-container">
        <div className={`checkout-result-card ${tone.tone}`}>
          {loading ? (
            <div className="checkout-result-loading">
              <div className="spinner" aria-hidden="true" />
              <h2>Confirmando tu pago...</h2>
              <p>Esto puede tardar unos segundos. No cierres esta página.</p>
            </div>
          ) : error ? (
            <div className="checkout-result-error">
              <h2>Hubo un problema</h2>
              <p>{error}</p>
              <div className="checkout-result-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/carrito')}
                >
                  Volver al carrito
                </button>
              </div>
            </div>
          ) : (
            <>
              <header className="checkout-result-header">
                <div className="status-icon" aria-hidden="true">
                  {tone.tone === 'success' && '✅'}
                  {tone.tone === 'warning' && '⏳'}
                  {tone.tone === 'error' && '⚠️'}
                  {tone.tone === 'info' && 'ℹ️'}
                </div>
                <h1>{mensajePrincipal}</h1>
                <p>{descripcionSecundaria}</p>
              </header>

              <section className="checkout-result-details">
                <dl>
                  <div>
                    <dt>Estado del pago</dt>
                    <dd>
                      {renderStatusChip(
                        (resultado?.status || requestStatus || 'Desconocido').toUpperCase(),
                        tone.tone
                      )}
                    </dd>
                  </div>

                  {resultado?.statusDetail && (
                    <div>
                      <dt>Detalle</dt>
                      <dd>{resultado.statusDetail}</dd>
                    </div>
                  )}

                  {pedidoId && (
                    <div>
                      <dt>Pedido asociado</dt>
                      <dd>#{pedidoId}</dd>
                    </div>
                  )}

                  {resultado?.paymentId && (
                    <div>
                      <dt>ID de pago</dt>
                      <dd>{resultado.paymentId}</dd>
                    </div>
                  )}

                  {(resultado?.externalReference || checkoutContext?.preferenceId) && (
                    <div>
                      <dt>Referencia externa</dt>
                      <dd>{resultado?.externalReference || checkoutContext?.preferenceId}</dd>
                    </div>
                  )}

                  {resultado?.pedido && (
                    <div>
                      <dt>Total del pedido</dt>
                      <dd>S/. {(resultado.pedido.total ?? 0).toFixed(2)}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className="checkout-result-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/catalogo')}
                >
                  Seguir comprando
                </button>
                {resultado?.pedido && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/pedido-confirmado`, { state: { pedido: resultado.pedido } })}
                  >
                    Ver resumen del pedido
                  </button>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default PagoResultado;
