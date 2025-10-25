package com.botica.botica_backend.Util;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Utilidad para generar archivos Excel usando Apache POI
 */
@Component
public class ExcelUtilPoi {

    public byte[] generateProductsExcel(List<Object[]> products) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Productos");
            
            // Crear encabezados
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Nombre", "Descripción", "Precio", "Stock", "Categoría"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // Llenar datos (máximo 100 productos para evitar problemas de memoria)
            int rowNum = 1;
            int maxRows = Math.min(products.size(), 100);
            
            for (int p = 0; p < maxRows; p++) {
                Object[] product = products.get(p);
                Row row = sheet.createRow(rowNum++);
                
                int maxCols = Math.min(product.length, headers.length);
                for (int i = 0; i < maxCols; i++) {
                    Cell cell = row.createCell(i);
                    if (product[i] != null) {
                        cell.setCellValue(product[i].toString());
                    }
                }
            }
            
            // Convertir a bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}