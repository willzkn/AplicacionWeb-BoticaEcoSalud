import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function OrdersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/pedidos/all');
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
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={() => alert('Abrir modal: Crear pedido')}>Nuevo pedido</button>
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
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => alert(`Ver detalles pedido #${o.idPedido}`)}>Ver</button>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => alert(`Cambiar estado pedido #${o.idPedido}`)}>Estado</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
