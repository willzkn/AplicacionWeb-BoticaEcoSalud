package com.botica.botica_backend.service;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Repository.ProductoRepository;
import com.botica.botica_backend.Repository.CategoriaRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ImportServiceApachePoi {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    /**
     * Importa productos desde un archivo Excel
     */
    public ImportResult importProductsFromExcel(MultipartFile file) throws IOException {
        ImportResult result = new ImportResult();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Saltar la primera fila (headers)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    Producto producto = createProductFromRow(row);
                    if (producto != null) {
                        productoRepository.save(producto);
                        result.addSuccess("Producto importado: " + producto.getNombre());
                    }
                } catch (Exception e) {
                    result.addError("Error en fila " + (i + 1) + ": " + e.getMessage());
                }
            }
        }
        
        return result;
    }

    private Producto createProductFromRow(Row row) {
        if (row.getCell(0) == null || row.getCell(0).getStringCellValue().trim().isEmpty()) {
            return null; // Fila vacía
        }
        
        Producto producto = new Producto();
        
        // Nombre (columna 0)
        producto.setNombre(getCellValueAsString(row.getCell(0)));
        
        // Descripción (columna 1)
        producto.setDescripcion(getCellValueAsString(row.getCell(1)));
        
        // Precio (columna 2)
        producto.setPrecio(getCellValueAsDouble(row.getCell(2)));
        
        // Stock (columna 3)
        producto.setStock(getCellValueAsInteger(row.getCell(3)));
        
        // Categoría (columna 4)
        String categoriaNombre = getCellValueAsString(row.getCell(4));
        if (categoriaNombre != null && !categoriaNombre.trim().isEmpty()) {
            Categoria categoria = categoriaRepository.findByNombre(categoriaNombre)
                .orElse(null);
            producto.setCategoria(categoria);
        }
        
        // Imagen URL (columna 5) - comentado temporalmente
        // producto.setImagenUrl(getCellValueAsString(row.getCell(5)));
        
        return producto;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }

    private Double getCellValueAsDouble(Cell cell) {
        if (cell == null) return 0.0;
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            default:
                return 0.0;
        }
    }

    private Integer getCellValueAsInteger(Cell cell) {
        if (cell == null) return 0;
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return (int) cell.getNumericCellValue();
            case STRING:
                try {
                    return Integer.parseInt(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    return 0;
                }
            default:
                return 0;
        }
    }

    /**
     * Clase para encapsular el resultado de la importación
     */
    public static class ImportResult {
        private List<String> successMessages = new ArrayList<>();
        private List<String> errorMessages = new ArrayList<>();

        public void addSuccess(String message) {
            successMessages.add(message);
        }

        public void addError(String message) {
            errorMessages.add(message);
        }

        public List<String> getSuccessMessages() {
            return successMessages;
        }

        public List<String> getErrorMessages() {
            return errorMessages;
        }

        public int getSuccessCount() {
            return successMessages.size();
        }

        public int getErrorCount() {
            return errorMessages.size();
        }

        public boolean hasErrors() {
            return !errorMessages.isEmpty();
        }

        public boolean hasSuccesses() {
            return !successMessages.isEmpty();
        }
    }
}