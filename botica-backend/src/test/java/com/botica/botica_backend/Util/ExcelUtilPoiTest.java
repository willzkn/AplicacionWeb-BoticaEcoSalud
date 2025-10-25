package com.botica.botica_backend.Util;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests para ExcelUtilPoi usando JUnit 5
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ExcelUtilPoi Tests")
class ExcelUtilPoiTest {

    private ExcelUtilPoi excelUtil;
    private List<Object[]> productosEjemplo;

    @BeforeEach
    void setUp() {
        excelUtil = new ExcelUtilPoi();
        
        // Crear datos de prueba
        productosEjemplo = Arrays.asList(
            new Object[]{1L, "Paracetamol 500mg", "Analgésico y antipirético", 15.50, 100, "Analgésicos"},
            new Object[]{2L, "Ibuprofeno 400mg", "Antiinflamatorio", 18.00, 50, "Antiinflamatorios"},
            new Object[]{3L, "Aspirina 100mg", "Antiagregante plaquetario", 12.00, 75, "Analgésicos"}
        );
    }

    @Test
    @DisplayName("Debe generar archivo Excel correctamente")
    void testGenerateProductsExcel() throws IOException {
        // When
        byte[] excelBytes = excelUtil.generateProductsExcel(productosEjemplo);

        // Then
        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 0);
        
        // Verificar que el archivo Excel es válido
        try (ByteArrayInputStream bis = new ByteArrayInputStream(excelBytes);
             Workbook workbook = new XSSFWorkbook(bis)) {
            
            assertNotNull(workbook);
            assertEquals(1, workbook.getNumberOfSheets());
            
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals("Productos", sheet.getSheetName());
        }
    }

    @Test
    @DisplayName("Debe crear encabezados correctamente")
    void testExcelHeaders() throws IOException {
        // When
        byte[] excelBytes = excelUtil.generateProductsExcel(productosEjemplo);

        // Then
        try (ByteArrayInputStream bis = new ByteArrayInputStream(excelBytes);
             Workbook workbook = new XSSFWorkbook(bis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            
            assertNotNull(headerRow);
            assertEquals("ID", headerRow.getCell(0).getStringCellValue());
            assertEquals("Nombre", headerRow.getCell(1).getStringCellValue());
            assertEquals("Descripción", headerRow.getCell(2).getStringCellValue());
            assertEquals("Precio", headerRow.getCell(3).getStringCellValue());
            assertEquals("Stock", headerRow.getCell(4).getStringCellValue());
            assertEquals("Categoría", headerRow.getCell(5).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Debe escribir datos de productos correctamente")
    void testExcelData() throws IOException {
        // When
        byte[] excelBytes = excelUtil.generateProductsExcel(productosEjemplo);

        // Then
        try (ByteArrayInputStream bis = new ByteArrayInputStream(excelBytes);
             Workbook workbook = new XSSFWorkbook(bis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Verificar primera fila de datos (fila 1, ya que 0 son los encabezados)
            Row dataRow1 = sheet.getRow(1);
            assertNotNull(dataRow1);
            assertEquals("1", dataRow1.getCell(0).getStringCellValue());
            assertEquals("Paracetamol 500mg", dataRow1.getCell(1).getStringCellValue());
            assertEquals("Analgésico y antipirético", dataRow1.getCell(2).getStringCellValue());
            assertEquals("15.5", dataRow1.getCell(3).getStringCellValue());
            assertEquals("100", dataRow1.getCell(4).getStringCellValue());
            assertEquals("Analgésicos", dataRow1.getCell(5).getStringCellValue());
            
            // Verificar segunda fila de datos
            Row dataRow2 = sheet.getRow(2);
            assertNotNull(dataRow2);
            assertEquals("2", dataRow2.getCell(0).getStringCellValue());
            assertEquals("Ibuprofeno 400mg", dataRow2.getCell(1).getStringCellValue());
            
            // Verificar tercera fila de datos
            Row dataRow3 = sheet.getRow(3);
            assertNotNull(dataRow3);
            assertEquals("3", dataRow3.getCell(0).getStringCellValue());
            assertEquals("Aspirina 100mg", dataRow3.getCell(1).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Debe manejar lista vacía correctamente")
    void testEmptyProductList() throws IOException {
        // Given
        List<Object[]> productosVacios = Arrays.asList();

        // When
        byte[] excelBytes = excelUtil.generateProductsExcel(productosVacios);

        // Then
        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 0);
        
        try (ByteArrayInputStream bis = new ByteArrayInputStream(excelBytes);
             Workbook workbook = new XSSFWorkbook(bis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals("Productos", sheet.getSheetName());
            
            // Solo debe tener la fila de encabezados
            Row headerRow = sheet.getRow(0);
            assertNotNull(headerRow);
            
            // No debe tener filas de datos
            Row dataRow = sheet.getRow(1);
            assertNull(dataRow);
        }
    }

    @Test
    @DisplayName("Debe manejar valores null en los datos")
    void testNullValues() throws IOException {
        // Given
        List<Object[]> productosConNull = Arrays.asList(
            new Object[]{1L, null, "Descripción", 15.50, null, "Categoría"},
            new Object[]{2L, "Producto", null, 18.00, 50, null}
        );

        // When
        byte[] excelBytes = excelUtil.generateProductsExcel(productosConNull);

        // Then
        assertNotNull(excelBytes);
        
        try (ByteArrayInputStream bis = new ByteArrayInputStream(excelBytes);
             Workbook workbook = new XSSFWorkbook(bis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Verificar que maneja valores null correctamente
            Row dataRow1 = sheet.getRow(1);
            assertNotNull(dataRow1);
            assertEquals("1", dataRow1.getCell(0).getStringCellValue());
            // La celda 1 (nombre) debería estar vacía o manejar el null
            assertEquals("Descripción", dataRow1.getCell(2).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Debe limitar a máximo 100 productos")
    void testMaxProductLimit() throws IOException {
        // Given - Crear lista con más de 100 productos
        List<Object[]> muchosProductos = Arrays.asList(new Object[150][]);
        for (int i = 0; i < 150; i++) {
            muchosProductos.set(i, new Object[]{
                (long) i, 
                "Producto " + i, 
                "Descripción " + i, 
                10.0 + i, 
                100 - i, 
                "Categoría " + (i % 5)
            });
        }

        // When
        byte[] excelBytes = excelUtil.generateProductsExcel(muchosProductos);

        // Then
        try (ByteArrayInputStream bis = new ByteArrayInputStream(excelBytes);
             Workbook workbook = new XSSFWorkbook(bis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Debe tener máximo 101 filas (1 encabezado + 100 datos)
            int lastRowNum = sheet.getLastRowNum();
            assertTrue(lastRowNum <= 100, "Debe tener máximo 100 filas de datos");
            
            // Verificar que la fila 100 existe (índice 100, ya que 0 es encabezado)
            Row row100 = sheet.getRow(100);
            assertNotNull(row100);
            
            // Verificar que no hay fila 101 (índice 101)
            Row row101 = sheet.getRow(101);
            assertNull(row101);
        }
    }

    @Test
    @DisplayName("Debe manejar arrays con diferentes longitudes")
    void testDifferentArrayLengths() throws IOException {
        // Given
        List<Object[]> productosVariados = Arrays.asList(
            new Object[]{1L, "Producto 1"}, // Solo 2 campos
            new Object[]{2L, "Producto 2", "Descripción", 15.50}, // 4 campos
            new Object[]{3L, "Producto 3", "Descripción", 18.00, 50, "Categoría", "Extra"} // 7 campos
        );

        // When
        byte[] excelBytes = excelUtil.generateProductsExcel(productosVariados);

        // Then
        assertNotNull(excelBytes);
        
        try (ByteArrayInputStream bis = new ByteArrayInputStream(excelBytes);
             Workbook workbook = new XSSFWorkbook(bis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Verificar que maneja diferentes longitudes sin errores
            Row dataRow1 = sheet.getRow(1);
            assertNotNull(dataRow1);
            assertEquals("1", dataRow1.getCell(0).getStringCellValue());
            assertEquals("Producto 1", dataRow1.getCell(1).getStringCellValue());
        }
    }
}