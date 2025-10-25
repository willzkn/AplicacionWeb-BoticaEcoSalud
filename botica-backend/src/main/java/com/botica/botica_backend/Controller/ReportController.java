package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Service.ReportService;
import com.botica.botica_backend.Util.FileUtilGuavaCommons;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Controlador para generar reportes usando todas las utilidades implementadas
 */
@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportController {
    
    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    private final ReportService reportService;
    private final FileUtilGuavaCommons fileUtil;

    /**
     * Genera reporte completo de productos en Excel
     */
    @GetMapping("/productos/excel")
    public ResponseEntity<byte[]> generarReporteProductosExcel() {
        try {
            log.info("Solicitud de reporte de productos recibida");
            
            byte[] excelBytes = reportService.generarReporteProductos();
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "reporte_productos_" + timestamp + ".xlsx";
            
            log.info("Reporte generado exitosamente: {}", filename);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
                
        } catch (IOException e) {
            log.error("Error al generar reporte Excel", e);
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            log.error("Error inesperado al generar reporte", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Genera reporte de productos con stock bajo
     */
    @GetMapping("/productos/stock-bajo")
    public ResponseEntity<byte[]> generarReporteStockBajo(
            @RequestParam(defaultValue = "10") int limite) {
        try {
            log.info("Generando reporte de stock bajo con límite: {}", limite);
            
            byte[] excelBytes = reportService.generarReporteStockBajo(limite);
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "stock_bajo_" + timestamp + ".xlsx";
            
            log.warn("Reporte de stock bajo generado: {}", filename);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
                
        } catch (Exception e) {
            log.error("Error al generar reporte de stock bajo", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtiene estadísticas de productos por categoría
     */
    @GetMapping("/estadisticas/categorias")
    public ResponseEntity<Map<String, Integer>> obtenerEstadisticasCategorias() {
        try {
            log.info("Generando estadísticas por categoría");
            
            Map<String, Integer> estadisticas = reportService.generarEstadisticasPorCategoria();
            
            log.info("Estadísticas generadas para {} categorías", estadisticas.size());
            return ResponseEntity.ok(estadisticas);
            
        } catch (Exception e) {
            log.error("Error al generar estadísticas", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Limpia el cache de reportes
     */
    @DeleteMapping("/cache")
    public ResponseEntity<String> limpiarCache() {
        try {
            reportService.limpiarCacheReportes();
            log.info("Cache de reportes limpiado por solicitud del usuario");
            return ResponseEntity.ok("Cache limpiado exitosamente");
            
        } catch (Exception e) {
            log.error("Error al limpiar cache", e);
            return ResponseEntity.internalServerError().body("Error al limpiar cache");
        }
    }

    /**
     * Obtiene estadísticas del cache
     */
    @GetMapping("/cache/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasCache() {
        try {
            Map<String, Object> stats = reportService.obtenerEstadisticasCache();
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas del cache", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Endpoint de prueba para validar las utilidades
     */
    @GetMapping("/test/utilidades")
    public ResponseEntity<Map<String, Object>> testUtilidades() {
        try {
            Map<String, Object> resultado = Map.of(
                "fileUtil_extension", fileUtil.getFileExtension("test.xlsx"),
                "fileUtil_baseName", fileUtil.getBaseName("reporte_productos.xlsx"),
                "fileUtil_humanReadable", fileUtil.humanReadableByteCount(1024000),
                "timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                "status", "Todas las utilidades funcionando correctamente"
            );
            
            log.info("Test de utilidades ejecutado exitosamente");
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            log.error("Error en test de utilidades", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}