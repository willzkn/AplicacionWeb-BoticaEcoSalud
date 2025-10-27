import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../../controllers/AuthContext';
import { jsPDF } from 'jspdf';

export default function OrdersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/pedidos/all', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || 'dummy-token'}`,
          'X-User-Role': user?.rol || 'ADMIN'
        }
      });
      if (!res.ok) throw new Error('No se pudo cargar pedidos');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/pedidos/${orderId}/detalles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || 'dummy-token'}`,
          'X-User-Role': user?.rol || 'ADMIN'
        }
      });
      if (!res.ok) throw new Error('No se pudo cargar detalles');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      setError('Error al cargar detalles: ' + e.message);
      return [];
    }
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    const details = await loadOrderDetails(order.idPedido);
    setOrderDetails(details);
    setShowDetailModal(true);
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/pedidos/${orderId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || 'dummy-token'}`,
          'X-User-Role': user?.rol || 'ADMIN'
        },
        body: JSON.stringify({ nuevoEstado: newStatus })
      });

      if (response.ok) {
        setSuccess('Estado del pedido actualizado correctamente');
        load(); // Recargar la lista
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Error al actualizar el estado');
      }
    } catch (error) {
      setError('Error al actualizar estado: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDIENTE': return '#fbbf24';
      case 'PROCESANDO': return '#3b82f6';
      case 'COMPLETADO': return '#10b981';
      case 'CANCELADO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  useEffect(() => { load(); }, []);

  const generarPDFBoleta = async (pedido, detalles) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Cargar logo
      const logoPath = `${process.env.PUBLIC_URL}/assets/Logodef.png`;
      const logoImg = new Image();
      logoImg.src = logoPath;
      
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = () => resolve();
      });
      
      // Agregar logo
      if (logoImg.complete && logoImg.naturalHeight !== 0) {
        doc.addImage(logoImg, 'PNG', 10, 10, 40, 20);
      }
      
      // Título
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
      doc.text(`Pedido N°: ${pedido.idPedido}`, 10, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString() : new Date().toLocaleDateString()}`, 10, yPos);
      yPos += 6;
      doc.text(`Estado: ${pedido.estado || 'PENDIENTE'}`, 10, yPos);
      yPos += 6;
      doc.text(`Método de Pago: ${pedido.metodoPago?.nombre || 'N/A'}`, 10, yPos);
      
      // Información del cliente
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
      
      // Línea separadora
      yPos += 4;
      doc.line(10, yPos, pageWidth - 10, yPos);
      yPos += 8;
      
      // Encabezado de tabla
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
      
      detalles.forEach((detalle, index) => {
        const producto = detalle.producto || {};
        const numeroSecuencial = index + 1;
        const nombre = producto.nombre || 'Producto';
        const cantidad = detalle.cantidad || 1;
        const precioUnitario = detalle.precioUnitario || 0;
        const subtotal = detalle.subtotal || (precioUnitario * cantidad);
        
        doc.text(String(numeroSecuencial), 10, yPos);
        const nombreCorto = nombre.length > 35 ? nombre.substring(0, 35) + '...' : nombre;
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
      
      // Total
      yPos += 4;
      doc.line(10, yPos, pageWidth - 10, yPos);
      yPos += 8;
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
      
      // Guardar PDF
      const fileName = `Boleta_${pedido.idPedido}.pdf`;
      doc.save(fileName);
      
      setSuccess('Boleta PDF descargada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setError('Error al generar PDF: ' + error.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/pedidos/export/csv', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || 'dummy-token'}`,
          'X-User-Role': user?.rol || 'ADMIN'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al generar el archivo CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Archivo CSV de pedidos generado y descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al exportar CSV: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Pedidos</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={load} disabled={loading}>{loading ? 'Actualizando...' : '🔄 Refrescar'}</button>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0, backgroundColor: '#17a2b8', color: '#fff' }} onClick={handleExportCSV} disabled={loading}>📄 Exportar CSV</button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: 16 }}>{success}</div>}

        <div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', opacity: 0.7 }}>Sin datos</td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.idPedido ?? o.id}>
                  <td>{o.idPedido ?? '-'}</td>
                  <td>
                    {o.usuario ? `${o.usuario.nombres || ''} ${o.usuario.apellidos || ''}`.trim() : '-'}
                    <br />
                    <small style={{ color: '#666' }}>{o.usuario?.email || '-'}</small>
                  </td>
                  <td>{o.fechaPedido ? new Date(o.fechaPedido).toLocaleDateString() : '-'}</td>
                  <td>S/. {o.total ? o.total.toFixed(2) : '0.00'}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: getStatusColor(o.estado), 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      {o.estado ?? 'PENDIENTE'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleViewDetails(o)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <select
                        style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
                        value={o.estado || 'PENDIENTE'}
                        onChange={(e) => handleChangeStatus(o.idPedido, e.target.value)}
                        disabled={loading}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PROCESANDO">Procesando</option>
                        <option value="COMPLETADO">Completado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de detalles del pedido */}
        {showDetailModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>
                  📋 Detalle del Pedido #{selectedOrder.idPedido}
                </h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '28px', 
                    cursor: 'pointer',
                    color: '#6b7280',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Información del pedido */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '25px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div>
                  <strong style={{ color: '#6b7280', fontSize: '12px' }}>FECHA:</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    {selectedOrder.fechaPedido ? new Date(selectedOrder.fechaPedido).toLocaleDateString('es-PE', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#6b7280', fontSize: '12px' }}>ESTADO:</strong>
                  <p style={{ margin: '5px 0 0 0' }}>
                    <span style={{ 
                      backgroundColor: getStatusColor(selectedOrder.estado), 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {selectedOrder.estado || 'PENDIENTE'}
                    </span>
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#6b7280', fontSize: '12px' }}>CLIENTE:</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    {selectedOrder.usuario ? `${selectedOrder.usuario.nombres} ${selectedOrder.usuario.apellidos}` : '-'}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    {selectedOrder.usuario?.email || '-'}
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#6b7280', fontSize: '12px' }}>MÉTODO DE PAGO:</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    {selectedOrder.metodoPago?.nombre || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Tabla de productos */}
              <h3 style={{ marginBottom: '15px', fontSize: '18px', color: '#374151' }}>Productos</h3>
              <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <table className="table" style={{ fontSize: '14px' }}>
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>P. Unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.map((detalle, index) => (
                      <tr key={detalle.idDetalle || index}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{detalle.producto?.nombre || 'Producto'}</strong>
                          {detalle.producto?.descripcion && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                              {detalle.producto.descripcion.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td>{detalle.cantidad}</td>
                        <td>S/. {detalle.precioUnitario?.toFixed(2)}</td>
                        <td><strong>S/. {detalle.subtotal?.toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>TOTAL:</td>
                      <td style={{ fontWeight: 'bold', fontSize: '16px', color: '#059669' }}>
                        S/. {selectedOrder.total?.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                <button 
                  className="login-button"
                  style={{ width: 'auto', padding: '12px 24px', margin: 0, backgroundColor: '#2196F3' }}
                  onClick={async () => {
                    await generarPDFBoleta(selectedOrder, orderDetails);
                  }}
                >
                  📄 Descargar Boleta PDF
                </button>
                <button 
                  className="login-button"
                  style={{ width: 'auto', padding: '12px 24px', margin: 0, backgroundColor: '#6b7280' }}
                  onClick={() => setShowDetailModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
