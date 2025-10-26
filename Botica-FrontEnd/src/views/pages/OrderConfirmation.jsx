import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);

  useEffect(() => {
    const pedidoData = location.state?.pedido;
    if (!pedidoData) {
      navigate('/');
      return;
    }

    setPedido(pedidoData);
    cargarDetallesPedido(pedidoData.idPedido);
  }, [location.state]);

  const cargarDetallesPedido = async (idPedido) => {
    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/${idPedido}/detalles`);
      if (response.ok) {
        const data = await response.json();
        setDetalles(data);
      }
    } catch (error) {
      console.error('Error al cargar detalles del pedido:', error);
    }
  };

  if (!pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header de confirmación */}
          <div className="bg-green-600 px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">¡Pedido Confirmado!</h1>
            <p className="text-green-100">Tu pedido ha sido procesado exitosamente</p>
          </div>

          <div className="p-6">
            {/* Información del pedido */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Información del Pedido</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Número de Pedido</p>
                    <p className="font-semibold text-lg">#{pedido.idPedido}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-semibold">{new Date(pedido.fechaPedido).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {pedido.estado}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold text-lg text-green-600">S/ {pedido.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles del pedido */}
            {detalles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Productos Pedidos</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {detalles.map((detalle, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-medium">{detalle.producto.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {detalle.cantidad} x S/ {detalle.precioUnitario.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">S/ {detalle.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información de entrega */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Información de Entrega</h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="mb-2"><strong>Cliente:</strong> {pedido.usuario.nombres} {pedido.usuario.apellidos}</p>
                <p className="mb-2"><strong>Email:</strong> {pedido.usuario.email}</p>
                {pedido.usuario.telefono && (
                  <p className="mb-2"><strong>Teléfono:</strong> {pedido.usuario.telefono}</p>
                )}
                {pedido.usuario.direccion && (
                  <p><strong>Dirección:</strong> {pedido.usuario.direccion}</p>
                )}
              </div>
            </div>

            {/* Método de pago */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{pedido.metodoPago.nombre}</p>
                <p className="text-sm text-gray-600">{pedido.metodoPago.descripcion}</p>
              </div>
            </div>

            {/* Próximos pasos */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Próximos Pasos</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-yellow-600 mr-2">1.</span>
                    <span>Recibirás un email de confirmación con los detalles de tu pedido</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-yellow-600 mr-2">2.</span>
                    <span>Nuestro equipo procesará tu pedido en las próximas 24 horas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-yellow-600 mr-2">3.</span>
                    <span>Te contactaremos para coordinar la entrega</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/catalogo"
                className="px-6 py-3 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
              >
                Seguir Comprando
              </Link>
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}