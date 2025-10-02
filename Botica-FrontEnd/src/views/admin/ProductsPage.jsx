import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/productos/all');
      if (!res.ok) throw new Error('No se pudo cargar productos');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Productos</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={() => alert('Abrir modal: Crear producto')}>Nuevo producto</button>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={load} disabled={loading}>{loading ? 'Actualizando...' : 'Refrescar'}</button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', opacity: 0.7 }}>Sin datos</td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.idProducto ?? p.id ?? p.nombre}>
                  <td>{p.idProducto ?? '-'}</td>
                  <td>{p.nombre ?? '-'}</td>
                  <td>S/. {p.precio ?? '0.00'}</td>
                  <td>{p.stock ?? '0'}</td>
                  <td>{p.categoria?.nombre ?? '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => alert(`Editar ${p.nombre}`)}>Editar</button>
                      <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0, background: 'rgba(220, 53, 69, 0.9)' }} onClick={() => alert(`Eliminar ${p.nombre}`)}>Eliminar</button>
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
