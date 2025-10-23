package com.botica.botica_backend.Service;

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

    @Autowired
    private ValidationServiceGuava validationService;

    /**
     * Importa productos desde un archivo Excel
     * Formato esperado: Nombre | Descripción | Precio | Stock | Categoría | Imagen URL
     */
    public ImportResult importProductsFromExcel(MultipartFile file) throws IOException {
        ImportResult result = new ImportResult();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Verificar que tenga al menos 2 filas (header + 1 dato)
            if (sheet.getLastRowNum() < 1) {
                result.addError("El archivo debe contener al menos una fila de datos además del header");
                return result;
            }
            
            // Validar header (fila 0)
            Row headerRow = sheet.getRow(0);
            if (!validateHeader(headerRow)) {
                result.addError("Header inválido. Formato esperado: Nombre | Descripción | Precio | Stock | Categoría | Imagen URL");
                return result;
            }
            
            // Procesar cada fila de datos
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    Producto producto = processProductRow(row, i);
                    if (producto != null) {
                        productoRepository.save(producto);
                        result.addSuccess("Fila " + (i + 1) + ": Producto '" + producto.getNombre() + "' importado correctamente");
                    }
                } catch (Exception e) {
                    result.addError("Fila " + (i + 1) + ": " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            result.addError("Error al procesar el archivo: " + e.getMessage());
        }
        
        return result;
    }

    private boolean validateHeader(Row headerRow) {
        if (headerRow == null || headerRow.getLastCellNum() < 5) {
            return false;
        }
        
        String[] expectedHeaders = {"Nombre", "Descripción", "Precio", "Stock", "Categoría", "Imagen URL"};
        
        for (int i = 0; i < Math.min(expectedHeaders.length, headerRow.getLastCellNum()); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell == null || !expectedHeaders[i].equalsIgnoreCase(getCellValueAsString(cell).trim())) {
                return false;
            }
        }
        
        return true;
    }

    private Producto processProductRow(Row row, int rowIndex) {
        // Validar que la fila tenga al menos las columnas mínimas
        if (row.getLastCellNum() < 5) {
            throw new RuntimeException("La fila debe tener al menos 5 columnas (Nombre, Descripción, Precio, Stock, Categoría)");
        }
        
        // Extraer datos de las celdas
        String nombre = getCellValueAsString(row.getCell(0));
        String descripcion = getCellValueAsString(row.getCell(1));
        String precioStr = getCellValueAsString(row.getCell(2));
        String stockStr = getCellValueAsString(row.getCell(3));
        String categoriaNombre = getCellValueAsString(row.getCell(4));
        String imagenUrl = row.getLastCellNum() > 5 ? getCellValueAsString(row.getCell(5)) : null;
        
        // Validaciones usando ValidationService
        validationService.validateName(nombre, "Nombre del producto");
        
        // Validar y convertir precio
        Double precio;
        try {
            precio = Double.parseDouble(precioStr.replace(",", "."));
            validationService.validatePrice(precio);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Precio inválido: " + precioStr);
        }
        
        // Validar y convertir stock
        Integer stock;
        try {
            stock = Integer.parseInt(stockStr.replace(",", "").replace(".", ""));
            validationService.validateStock(stock);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Stock inválido: " + stockStr);
        }
        
        // Buscar o crear categoría
        Categoria categoria = findOrCreateCategory(categoriaNombre);
        
        // Crear producto
        Producto producto = new Producto();
        producto.setNombre(nombre.trim());
        producto.setDescripcion(descripcion != null ? descripcion.trim() : "");
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setCategoria(categoria);
        producto.setImagen(imagenUrl != null ? imagenUrl.trim() : null);
        
        return producto;
    }

    private Categoria findOrCreateCategory(String nombreCategoria) {
        if (nombreCategoria == null || nombreCategoria.trim().isEmpty()) {
            throw new RuntimeException("Nombre de categoría no puede estar vacío");
        }
        
        String nombre = nombreCategoria.trim();
        
        // Buscar categoría existente
        return categoriaRepository.findByNombre(nombre)
                .orElseGet(() -> {
                    // Crear nueva categoría si no existe
                    Categoria nuevaCategoria = new Categoria();
                    nuevaCategoria.setNombre(nombre);
                    nuevaCategoria.setDescripcion("Categoría creada automáticamente durante importación");
                    nuevaCategoria.setActivo(true);
                    return categoriaRepository.save(nuevaCategoria);
                });
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    // Para números, eliminar decimales si es un entero
                    double numValue = cell.getNumericCellValue();
                    if (numValue == Math.floor(numValue)) {
                        return String.valueOf((long) numValue);
                    } else {
                        return String.valueOf(numValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    /**
     * Clase para manejar resultados de importación
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
        
        public boolean hasErrors() {
            return !errorMessages.isEmpty();
        }
        
        public boolean hasSuccesses() {
            return !successMessages.isEmpty();
        }
        
        public int getSuccessCount() {
            return successMessages.size();
        }
        
        public int getErrorCount() {
            return errorMessages.size();
        }
    }
}