import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function OrdersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/pedidos');
      if (!res.ok) throw new Error('No se pudo cargar pedidos');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Pedidos</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={load} disabled={loading}>{loading ? 'Actualizando...' : 'Refrescar'}</button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

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
                  <td>{o.usuario?.email ?? o.usuario?.nombres ?? '-'}</td>
                  <td>{o.fechaPedido ? new Date(o.fechaPedido).toLocaleDateString() : '-'}</td>
                  <td>S/. {o.total ?? '0.00'}</td>
                  <td>{o.estado ?? '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => viewOrderDetails(o)}>Ver</button>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => openStatusModal(o)}>Estado</button>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0, background: 'rgba(220, 53, 69, 0.9)' }} onClick={() => deleteOrder(o.idPedido)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para cambiar estado */}
        {showStatusModal && selectedOrder && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
              <h3>Cambiar Estado del Pedido #{selectedOrder.idPedido}</h3>
              <div style={{ marginBottom: '16px' }}>
                <label>Estado actual: <strong>{selectedOrder.estado}</strong></label>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Nuevo estado:</label>
                <select
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="">Seleccionar estado</option>
                  <option value="CREADO">Creado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="PREPARANDO">Preparando</option>
                  <option value="EN_CAMINO">En camino</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeStatusModal} style={{ padding: '8px 16px' }}>Cancelar</button>
                <button onClick={updateStatus} className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }}>
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.estado || '');
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const updateStatus = async () => {
    if (!newStatus) {
      alert('Selecciona un estado');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/pedidos/${selectedOrder.idPedido}/estado?estado=${newStatus}`, {
        method: 'PATCH'
      });

      if (!res.ok) throw new Error('Error al actualizar estado');
      
      closeStatusModal();
      load();
      alert('Estado actualizado correctamente');
    } catch (e) {
      alert(e.message || 'Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (order) => {
    const details = `
Pedido #${order.idPedido}
Usuario: ${order.usuario?.nombres} ${order.usuario?.apellidos} (${order.usuario?.email})
Fecha: ${order.fechaPedido ? new Date(order.fechaPedido).toLocaleDateString() : 'N/A'}
Total: S/. ${order.total}
Estado: ${order.estado}
Método de pago: ${order.metodoPago?.nombre || 'N/A'}
    `;
    alert(details);
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/pedidos/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar pedido');
      
      load();
      alert('Pedido eliminado');
    } catch (e) {
      alert(e.message || 'Error al eliminar pedido');
    } finally {
      setLoading(false);
    }
  };
}
