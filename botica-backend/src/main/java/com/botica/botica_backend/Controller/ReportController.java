package com.botica.botica_backend.Controller;

import com.botica.botica_backend.Service.ReportServiceApachePoi;
import com.botica.botica_backend.Service.ImportServiceApachePoi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class ReportController {

    @Autowired
    private ReportServiceApachePoi reportService;

    @Autowired
    private ImportServiceApachePoi importService;

    /**
     * Genera y descarga reporte de inventario en Excel
     */
    @GetMapping("/inventory")
    public ResponseEntity<byte[]> downloadInventoryReport() {
        try {
            System.out.println("Generando reporte de inventario...");
            byte[] excelData = reportService.generateInventoryReport();
            System.out.println("Reporte generado exitosamente. Tamaño: " + excelData.length + " bytes");
            
            String filename = "inventario_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error al generar reporte de inventario: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Genera y descarga reporte de usuarios en Excel
     */
    @GetMapping("/users")
    public ResponseEntity<byte[]> downloadUsersReport() {
        try {
            System.out.println("Generando reporte de usuarios...");
            byte[] excelData = reportService.generateUsersReport();
            System.out.println("Reporte generado exitosamente. Tamaño: " + excelData.length + " bytes");
            
            String filename = "usuarios_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error al generar reporte de usuarios: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Genera y descarga reporte de ventas en Excel
     */
    @GetMapping("/sales")
    public ResponseEntity<byte[]> downloadSalesReport() {
        try {
            System.out.println("Generando reporte de ventas...");
            byte[] excelData = reportService.generateSalesReport();
            System.out.println("Reporte generado exitosamente. Tamaño: " + excelData.length + " bytes");
            
            String filename = "ventas_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error al generar reporte de ventas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Importa productos desde archivo Excel
     */
    @PostMapping("/import/products")
    public ResponseEntity<Map<String, Object>> importProducts(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validar archivo
            if (file.isEmpty()) {
                response.put("error", "El archivo está vacío");
                return ResponseEntity.badRequest().body(response);
            }
            
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
                response.put("error", "Solo se permiten archivos Excel (.xlsx)");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Procesar importación
            ImportServiceApachePoi.ImportResult result = importService.importProductsFromExcel(file);
            
            response.put("successCount", result.getSuccessCount());
            response.put("errorCount", result.getErrorCount());
            response.put("successMessages", result.getSuccessMessages());
            response.put("errorMessages", result.getErrorMessages());
            
            if (result.hasErrors() && !result.hasSuccesses()) {
                return ResponseEntity.badRequest().body(response);
            } else {
                return ResponseEntity.ok(response);
            }
            
        } catch (IOException e) {
            response.put("error", "Error al procesar el archivo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("error", "Error inesperado: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Descarga plantilla de Excel para importar productos
     */
    @GetMapping("/template/products")
    public ResponseEntity<byte[]> downloadProductTemplate() {
        try {
            System.out.println("Generando plantilla de productos...");
            byte[] templateData = reportService.generateProductTemplate();
            System.out.println("Plantilla generada exitosamente. Tamaño: " + templateData.length + " bytes");
            
            String filename = "plantilla_productos.xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(templateData.length);
            
            return new ResponseEntity<>(templateData, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error al generar plantilla de productos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}