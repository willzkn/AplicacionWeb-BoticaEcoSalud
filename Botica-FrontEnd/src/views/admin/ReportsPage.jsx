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
        throw new Error('Error al generar el reporte');
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
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h2 className="h3 mb-4 text-primary">
              <i className="bi bi-graph-up me-2"></i>
              Reportes y Gestión de Datos
            </h2>
          </div>
        </div>

        {/* Sección de Reportes */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  Generar Reportes
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">
                  Descarga reportes en formato Excel con la información actualizada del sistema.
                </p>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <button 
                      className="btn btn-success w-100 py-3" 
                      onClick={() => downloadReport('inventory')}
                      disabled={loading}
                    >
                      <i className="bi bi-box-seam me-2"></i>
                      Reporte de Inventario
                    </button>
                  </div>
                  
                  <div className="col-md-4">
                    <button 
                      className="btn btn-info w-100 py-3" 
                      onClick={() => downloadReport('users')}
                      disabled={loading}
                    >
                      <i className="bi bi-people me-2"></i>
                      Reporte de Usuarios
                    </button>
                  </div>
                  
                  <div className="col-md-4">
                    <button 
                      className="btn btn-danger w-100 py-3" 
                      onClick={() => downloadReport('sales')}
                      disabled={loading}
                    >
                      <i className="bi bi-currency-dollar me-2"></i>
                      Reporte de Ventas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Importación */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-secondary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-upload me-2"></i>
                  Importar Productos
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">
                  Importa productos masivamente desde un archivo Excel. Descarga la plantilla para ver el formato requerido.
                </p>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <button 
                      className="btn btn-outline-primary w-100 py-2" 
                      onClick={downloadTemplate}
                      disabled={loading}
                    >
                      <i className="bi bi-file-earmark-excel me-2"></i>
                      Descargar Plantilla
                    </button>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="btn btn-warning w-100 py-2" style={{ 
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}>
                      <i className="bi bi-cloud-upload me-2"></i>
                      Seleccionar Archivo Excel
                      <input 
                        type="file" 
                        accept=".xlsx"
                        onChange={handleFileImport}
                        disabled={loading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                {/* Resultado de la importación */}
                {importResult && (
                  <div className={`alert ${importResult.error ? 'alert-danger' : 'alert-success'} shadow-sm`}>
                    <h5 className="alert-heading">
                      {importResult.error ? (
                        <><i className="bi bi-exclamation-triangle me-2"></i>Error en la Importación</>
                      ) : (
                        <><i className="bi bi-check-circle me-2"></i>Resultado de la Importación</>
                      )}
                    </h5>
                    
                    {importResult.error ? (
                      <p className="mb-0">{importResult.error}</p>
                    ) : (
                      <>
                        <p className="mb-2">
                          <strong>Productos importados exitosamente:</strong> {importResult.successCount}
                        </p>
                        <p className="mb-3">
                          <strong>Errores encontrados:</strong> {importResult.errorCount}
                        </p>
                        
                        {importResult.successMessages && importResult.successMessages.length > 0 && (
                          <details className="mb-2">
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                              Ver productos importados ({importResult.successMessages.length})
                            </summary>
                            <ul className="mt-2 ms-3">
                              {importResult.successMessages.map((msg, index) => (
                                <li key={index} className="mb-1">{msg}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                        
                        {importResult.errorMessages && importResult.errorMessages.length > 0 && (
                          <details>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#dc3545' }}>
                              Ver errores ({importResult.errorMessages.length})
                            </summary>
                            <ul className="mt-2 ms-3">
                              {importResult.errorMessages.map((msg, index) => (
                                <li key={index} className="mb-1 text-danger">{msg}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
               style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
            <div className="bg-white p-4 rounded text-center">
              <div className="spinner-border text-primary me-2" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mb-0">Procesando...</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}