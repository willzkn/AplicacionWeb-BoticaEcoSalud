import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function CategoriesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/categorias/all');
      if (!res.ok) throw new Error('No se pudo cargar categorías');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Categorías</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={() => alert('Abrir modal: Crear categoría')}>Nueva categoría</button>
          <button className="login-button" style={{ width: 'auto', padding: '12px 24px', margin: 0 }} onClick={load} disabled={loading}>{loading ? 'Actualizando...' : 'Refrescar'}</button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div>
          <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', opacity: 0.7 }}>Sin datos</td>
                  </tr>
                )}
                {categories.map((c) => (
                  <tr key={c.idCategoria ?? c.id ?? c.nombre}>
                    <td>{c.idCategoria ?? '-'}</td>
                    <td>{c.nombre ?? '-'}</td>
                    <td>{String(c.activo ?? true)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} onClick={() => alert(`Editar ${c.nombre}`)}>Editar</button>
                        <button className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0, background: 'rgba(220, 53, 69, 0.9)' }} onClick={() => alert(`Desactivar ${c.nombre}`)}>Desactivar</button>
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
