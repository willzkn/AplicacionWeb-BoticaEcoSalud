import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function OrdersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/pedidos/all', {
        headers: {
          'X-User-Role': 'ADMIN'
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

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/pedidos/${orderId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'ADMIN'
        },
        body: JSON.stringify({ nuevoEstado: newStatus })
      });

      if (response.ok) {
        setSuccess('Estado del pedido actualizado correctamente');
        load(); // Recargar la lista
        setShowStatusModal(false);
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

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/pedidos/export/csv', {
        headers: {
          'X-User-Role': 'ADMIN'
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
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={() => alert('Abrir modal: Crear pedido')}>Nuevo pedido</button>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={load} disabled={loading}>{loading ? 'Actualizando...' : 'Refrescar'}</button>
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
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="login-button" 
                        style={{ width: 'auto', padding: '8px 16px', margin: 0, fontSize: '12px' }} 
                        onClick={() => alert(`Ver detalles pedido #${o.idPedido}`)}
                      >
                        Ver
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
      </div>
    </AdminLayout>
  );
}
