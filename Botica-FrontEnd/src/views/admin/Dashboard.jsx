import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../../controllers/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosCompletados: 0,
    pedidosCancelados: 0,
    ventasHoy: 0
  });
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token || 'dummy-token'}`,
        'X-User-Role': user?.rol || 'ADMIN'
      };

      // Cargar estadísticas de pedidos
      const statsRes = await fetch('http://localhost:8080/api/pedidos/estadisticas', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Cargar pedidos
      const pedidosRes = await fetch('http://localhost:8080/api/pedidos/all', { headers });
      if (pedidosRes.ok) {
        const pedidosData = await pedidosRes.json();
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      }

      // Cargar productos
      const productosRes = await fetch('http://localhost:8080/api/productos/all', { headers });
      if (productosRes.ok) {
        const productosData = await productosRes.json();
        setProductos(Array.isArray(productosData) ? productosData : []);
      }

      // Cargar usuarios
      const usuariosRes = await fetch('http://localhost:8080/api/usuarios/all', { headers });
      if (usuariosRes.ok) {
        const usuariosData = await usuariosRes.json();
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular productos con stock bajo (menos de 10 unidades)
  const productosStockBajo = productos.filter(p => p.stock < 10);
  
  // Obtener últimos pedidos
  const ultimosPedidos = pedidos.slice(0, 5);

  // Calcular porcentajes para gráficos
  const totalPedidosCount = stats.totalPedidos || 1;
  const porcentajePendientes = ((stats.pedidosPendientes / totalPedidosCount) * 100).toFixed(1);
  const porcentajeCompletados = ((stats.pedidosCompletados / totalPedidosCount) * 100).toFixed(1);
  const porcentajeCancelados = ((stats.pedidosCancelados / totalPedidosCount) * 100).toFixed(1);

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <h2 className="login-title" style={{ marginTop: 0, marginBottom: 8 }}>📊 Dashboard</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Bienvenido, <strong>{user?.nombres || 'Administrador'}</strong>. Aquí tienes un resumen de tu botica.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Cargando estadísticas...
          </div>
        ) : (
          <>
            {/* Tarjetas de estadísticas principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {/* Total Pedidos */}
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Pedidos</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.totalPedidos}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>📦 Todos los tiempos</div>
              </div>

              {/* Ventas del Día */}
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Ventas Hoy</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>S/. {stats.ventasHoy?.toFixed(2) || '0.00'}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>💰 Ingresos del día</div>
              </div>

              {/* Productos */}
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Productos</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{productos.length}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>📦 {productosStockBajo.length} con stock bajo</div>
              </div>

              {/* Usuarios */}
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Usuarios</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{usuarios.length}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>👥 Clientes registrados</div>
              </div>
            </div>

            {/* Sección de gráficos y detalles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {/* Estado de Pedidos */}
              <div className="admin-card" style={{ padding: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#1f2937' }}>📊 Estado de Pedidos</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span>🟡 Pendientes</span>
                    <strong>{stats.pedidosPendientes} ({porcentajePendientes}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${porcentajePendientes}%`, height: '100%', backgroundColor: '#fbbf24', transition: 'width 0.3s' }}></div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span>🟢 Completados</span>
                    <strong>{stats.pedidosCompletados} ({porcentajeCompletados}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${porcentajeCompletados}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.3s' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span>🔴 Cancelados</span>
                    <strong>{stats.pedidosCancelados} ({porcentajeCancelados}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${porcentajeCancelados}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.3s' }}></div>
                  </div>
                </div>
              </div>

              {/* Productos con Stock Bajo */}
              <div className="admin-card" style={{ padding: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#1f2937' }}>⚠️ Stock Bajo ({"<"}10 unidades)</h3>
                {productosStockBajo.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>✅ Todos los productos tienen stock suficiente</p>
                ) : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {productosStockBajo.slice(0, 5).map(p => (
                      <div key={p.idProducto} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '12px', 
                        marginBottom: '8px', 
                        backgroundColor: '#fef3c7', 
                        borderRadius: '8px',
                        borderLeft: '4px solid #f59e0b'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{p.nombre}</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#d97706' }}>{p.stock} unid.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Últimos Pedidos */}
            <div className="admin-card" style={{ padding: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#1f2937' }}>🕒 Últimos Pedidos</h3>
              {ultimosPedidos.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>No hay pedidos recientes</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: '14px' }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimosPedidos.map(pedido => (
                        <tr key={pedido.idPedido}>
                          <td>#{pedido.idPedido}</td>
                          <td>{pedido.usuario ? `${pedido.usuario.nombres} ${pedido.usuario.apellidos}` : '-'}</td>
                          <td>{pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString() : '-'}</td>
                          <td><strong>S/. {pedido.total?.toFixed(2)}</strong></td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: 
                                pedido.estado === 'COMPLETADO' ? '#d1fae5' :
                                pedido.estado === 'PENDIENTE' ? '#fef3c7' :
                                pedido.estado === 'PROCESANDO' ? '#dbeafe' : '#fee2e2',
                              color:
                                pedido.estado === 'COMPLETADO' ? '#065f46' :
                                pedido.estado === 'PENDIENTE' ? '#92400e' :
                                pedido.estado === 'PROCESANDO' ? '#1e40af' : '#991b1b'
                            }}>
                              {pedido.estado || 'PENDIENTE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
