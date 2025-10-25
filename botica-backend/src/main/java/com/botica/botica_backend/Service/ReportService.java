package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Repository.ProductoRepository;
import com.botica.botica_backend.Util.ExcelUtilPoi;
// import com.botica.botica_backend.Util.StringUtilGuavaCommons;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.collect.Maps;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Servicio para generar reportes usando Google Guava para optimización
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    private final ProductoRepository productoRepository;
    private final ExcelUtilPoi excelUtil;
    // private final StringUtilGuavaCommons stringUtil;

    // Cache para reportes usando Guava Cache
    private final Cache<String, byte[]> reportCache = CacheBuilder.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(Duration.ofMinutes(30))
            .build();

    /**
     * Genera reporte de productos (versión simplificada sin cache)
     */
    public byte[] generarReporteProductos() throws IOException {
        log.info("Generando reporte de productos");

        List<Producto> productos = productoRepository.findAll();
        log.info("Productos encontrados: {}", productos.size());

        List<Object[]> productosData = productos.stream()
                .map(this::convertirProductoAArray)
                .toList();

        byte[] result = excelUtil.generateProductsExcel(productosData);

        log.info("Reporte generado exitosamente, tamaño: {} bytes", result.length);
        return result;
    }

    /**
     * Genera estadísticas de productos por categoría usando Guava
     */
    public Map<String, Integer> generarEstadisticasPorCategoria() {
        List<Producto> productos = productoRepository.findAll();

        // Usar Guava Maps para crear un mapa mutable
        Map<String, Integer> estadisticas = Maps.newHashMap();

        for (Producto producto : productos) {
            String categoria = producto.getCategoria() != null ? producto.getCategoria().getNombre() : "Sin categoría";
            estadisticas.merge(categoria, 1, Integer::sum);
        }

        log.info("Estadísticas generadas para {} categorías", estadisticas.size());
        return estadisticas;
    }

    /**
     * Procesa productos en lotes usando Guava Lists.partition
     */
    public void procesarProductosEnLotes(List<Producto> productos, int tamanoLote) {
        // Dividir productos en lotes manualmente
        List<List<Producto>> lotes = new ArrayList<>();
        for (int i = 0; i < productos.size(); i += tamanoLote) {
            lotes.add(productos.subList(i, Math.min(i + tamanoLote, productos.size())));
        }

        log.info("Procesando {} productos en {} lotes de tamaño {}",
                productos.size(), lotes.size(), tamanoLote);

        for (int i = 0; i < lotes.size(); i++) {
            List<Producto> lote = lotes.get(i);
            log.debug("Procesando lote {} con {} productos", i + 1, lote.size());
            procesarLoteProductos(lote);
        }
    }

    /**
     * Genera reporte de productos con stock bajo
     */
    public byte[] generarReporteStockBajo(int limite) throws IOException {
        List<Producto> productosStockBajo = productoRepository.findByStockLessThanAndActivoTrue(limite);

        List<Object[]> productosData = productosStockBajo.stream()
                .map(p -> new Object[] {
                        p.getIdProducto(),
                        p.getNombre() != null && !p.getNombre().isEmpty()
                                ? p.getNombre().substring(0, 1).toUpperCase() + p.getNombre().substring(1).toLowerCase()
                                : "Sin nombre",
                        p.getStock(),
                        "STOCK BAJO",
                        p.getCategoria() != null ? p.getCategoria().getNombre() : "Sin categoría"
                })
                .toList();

        log.warn("Generando reporte de stock bajo: {} productos encontrados", productosData.size());

        return excelUtil.generateProductsExcel(productosData);
    }

    /**
     * Limpia el cache de reportes
     */
    public void limpiarCacheReportes() {
        reportCache.invalidateAll();
        log.info("Cache de reportes limpiado");
    }

    /**
     * Obtiene estadísticas del cache
     */
    public Map<String, Object> obtenerEstadisticasCache() {
        Map<String, Object> stats = Maps.newHashMap();
        stats.put("tamaño", reportCache.size());
        stats.put("estadisticas", reportCache.stats());
        return stats;
    }

    // Métodos privados auxiliares

    private Object[] convertirProductoAArray(Producto producto) {
        return new Object[] {
                producto.getIdProducto(),
                producto.getNombre() != null && !producto.getNombre().trim().isEmpty()
                        ? producto.getNombre().substring(0, 1).toUpperCase()
                                + producto.getNombre().substring(1).toLowerCase()
                        : "Sin nombre",
                producto.getDescripcion() != null && producto.getDescripcion().length() > 50
                        ? producto.getDescripcion().substring(0, 50)
                        : (producto.getDescripcion() != null ? producto.getDescripcion() : ""),
                producto.getPrecio(),
                producto.getStock(),
                producto.getCategoria() != null ? producto.getCategoria().getNombre() : "Sin categoría",
                producto.getActivo() ? "ACTIVO" : "INACTIVO"
        };
    }

    private void procesarLoteProductos(List<Producto> lote) {
        // Lógica de procesamiento por lotes
        for (Producto producto : lote) {
            log.trace("Procesando producto: {}", producto.getNombre());
        }
    }
}