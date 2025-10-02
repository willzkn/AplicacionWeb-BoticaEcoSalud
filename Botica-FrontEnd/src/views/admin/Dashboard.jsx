import React from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="admin-card">
        <h2 className="login-title" style={{ marginTop: 0, marginBottom: 20 }}>Dashboard</h2>
        
        <div style={{ marginBottom: 24 }}>
          <strong style={{ fontSize: 16, color: '#1E4099' }}>Bienvenido al panel de administración</strong>
          <p style={{ marginTop: 8, color: '#333' }}>Aquí podrás gestionar usuarios, categorías, productos y pedidos.</p>
        </div>

        <div>
          <p style={{ margin: 0, fontWeight: 600, color: '#1E4099', marginBottom: 12 }}>Métricas básicas (placeholder):</p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Ventas del día: -</li>
            <li>Pedidos pendientes: -</li>
            <li>Productos con stock bajo: -</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
