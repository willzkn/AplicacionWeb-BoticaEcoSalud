import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const downloadReport = async (reportType) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/reports/${reportType}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error al generar el reporte: ${response.status} - ${errorText}`);
      }

      // Obtener el blob del archivo
      const blob = await response.blob();

      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Determinar nombre del archivo
      let filename = 'reporte.xlsx';
      switch (reportType) {
        case 'inventory':
          filename = `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`;
          break;
        case 'users':
          filename = `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`;
          break;
        case 'sales':
          filename = `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;
          break;
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Reporte descargado exitosamente');
    } catch (error) {
      alert('Error al descargar el reporte: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/reports/template/products', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al descargar la plantilla');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_productos.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Plantilla descargada exitosamente');
    } catch (error) {
      alert('Error al descargar la plantilla: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      alert('Solo se permiten archivos Excel (.xlsx)');
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/api/reports/import/products', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (response.ok) {
        // Notificar que se actualizaron productos
        window.dispatchEvent(new CustomEvent('productUpdated', {
          detail: { action: 'imported' }
        }));
      }
    } catch (error) {
      setImportResult({
        error: 'Error al procesar el archivo: ' + error.message,
        successCount: 0,
        errorCount: 1
      });
    } finally {
      setLoading(false);
      // Limpiar el input
      event.target.value = '';
    }
  };

  return (
    <AdminLayout>
      <div>
        <h2 className="login-title" style={{ marginBottom: 24 }}>Reportes y Gestión de Datos</h2>

        {/* Sección de Reportes */}
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#1E4099', marginBottom: 16 }}>📊 Generar Reportes</h3>
          <p style={{ marginBottom: 20, color: '#666' }}>
            Descarga reportes en formato Excel con la información actualizada del sistema.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <button
              className="login-button"
              style={{ width: '100%', padding: '12px 16px', margin: 0, background: '#28a745' }}
              onClick={() => downloadReport('inventory')}
              disabled={loading}
            >
              📦 Reporte de Inventario
            </button>

            <button
              className="login-button"
              style={{ width: '100%', padding: '12px 16px', margin: 0, background: '#17a2b8' }}
              onClick={() => downloadReport('users')}
              disabled={loading}
            >
              👥 Reporte de Usuarios
            </button>

            <button
              className="login-button"
              style={{ width: '100%', padding: '12px 16px', margin: 0, background: '#dc3545' }}
              onClick={() => downloadReport('sales')}
              disabled={loading}
            >
              💰 Reporte de Ventas
            </button>
          </div>
        </div>

        {/* Sección de Importación */}
        <div className="admin-card">
          <h3 style={{ color: '#1E4099', marginBottom: 16 }}>📥 Importar Productos</h3>
          <p style={{ marginBottom: 20, color: '#666' }}>
            Importa productos masivamente desde un archivo Excel. Descarga la plantilla para ver el formato requerido.
          </p>

          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <button
              className="login-button"
              style={{ width: 'auto', padding: '12px 16px', margin: 0, background: '#6f42c1' }}
              onClick={downloadTemplate}
              disabled={loading}
            >
              📄 Descargar Plantilla
            </button>

            <label className="login-button" style={{
              width: 'auto',
              padding: '12px 16px',
              margin: 0,
              background: '#fd7e14',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}>
              📤 Seleccionar Archivo Excel
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileImport}
                disabled={loading}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Resultado de la importación */}
          {importResult && (
            <div style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: importResult.error ? '#f8d7da' : '#d4edda',
              border: `1px solid ${importResult.error ? '#f5c6cb' : '#c3e6cb'}`,
              color: importResult.error ? '#721c24' : '#155724'
            }}>
              <h4 style={{ margin: '0 0 12px 0' }}>
                {importResult.error ? '❌ Error en la Importación' : '✅ Resultado de la Importación'}
              </h4>

              {importResult.error ? (
                <p style={{ margin: 0 }}>{importResult.error}</p>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Productos importados exitosamente:</strong> {importResult.successCount}
                  </p>
                  <p style={{ margin: '0 0 12px 0' }}>
                    <strong>Errores encontrados:</strong> {importResult.errorCount}
                  </p>

                  {importResult.successMessages && importResult.successMessages.length > 0 && (
                    <details style={{ marginBottom: 8 }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                        Ver productos importados ({importResult.successMessages.length})
                      </summary>
                      <ul style={{ margin: '8px 0 0 20px' }}>
                        {importResult.successMessages.map((msg, index) => (
                          <li key={index} style={{ margin: '4px 0' }}>{msg}</li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {importResult.errorMessages && importResult.errorMessages.length > 0 && (
                    <details>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#dc3545' }}>
                        Ver errores ({importResult.errorMessages.length})
                      </summary>
                      <ul style={{ margin: '8px 0 0 20px' }}>
                        {importResult.errorMessages.map((msg, index) => (
                          <li key={index} style={{ margin: '4px 0', color: '#dc3545' }}>{msg}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 8,
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: 16 }}>Procesando...</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}