package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Repository.ProductoRepository;
import com.botica.botica_backend.Repository.UsuarioRepository;
import com.botica.botica_backend.Repository.PedidoRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportServiceApachePoi {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    /**
     * Genera reporte de inventario en Excel
     */
    public byte[] generateInventoryReport() throws IOException {
        List<Producto> productos = productoRepository.findAll();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Inventario");
            
            // Crear estilo para el header
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Crear header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Nombre", "Descripción", "Precio", "Stock", "Categoría", "Fecha Actualización"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Llenar datos
            int rowNum = 1;
            for (Producto producto : productos) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(producto.getIdProducto());
                row.createCell(1).setCellValue(producto.getNombre());
                row.createCell(2).setCellValue(producto.getDescripcion() != null ? producto.getDescripcion() : "");
                row.createCell(3).setCellValue(producto.getPrecio());
                row.createCell(4).setCellValue(producto.getStock());
                row.createCell(5).setCellValue(producto.getCategoria() != null ? producto.getCategoria().getNombre() : "Sin categoría");
                row.createCell(6).setCellValue(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            }
            
            // Auto-ajustar columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Convertir a bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Genera reporte de usuarios registrados
     */
    public byte[] generateUsersReport() throws IOException {
        List<Usuario> usuarios = usuarioRepository.findAll();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Usuarios Registrados");
            
            // Crear estilo para el header
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Crear header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Email", "Nombres", "Apellidos", "Teléfono", "Dirección", "Rol", "Activo", "Fecha Registro"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Llenar datos
            int rowNum = 1;
            for (Usuario usuario : usuarios) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(usuario.getIdUsuario());
                row.createCell(1).setCellValue(usuario.getEmail());
                row.createCell(2).setCellValue(usuario.getNombres() != null ? usuario.getNombres() : "");
                row.createCell(3).setCellValue(usuario.getApellidos() != null ? usuario.getApellidos() : "");
                row.createCell(4).setCellValue(usuario.getTelefono() != null ? usuario.getTelefono() : "");
                row.createCell(5).setCellValue(usuario.getDireccion() != null ? usuario.getDireccion() : "");
                row.createCell(6).setCellValue(usuario.getRol() != null ? usuario.getRol() : "cliente");
                row.createCell(7).setCellValue(usuario.getActivo() ? "Sí" : "No");
                row.createCell(8).setCellValue(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            }
            
            // Auto-ajustar columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Convertir a bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Genera reporte de ventas (pedidos)
     */
    public byte[] generateSalesReport() throws IOException {
        List<Pedido> pedidos = pedidoRepository.findAll();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Reporte de Ventas");
            
            // Crear estilo para el header
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_RED.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Crear header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID Pedido", "Usuario", "Email", "Total", "Estado", "Método Pago", "Fecha Pedido"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Llenar datos
            int rowNum = 1;
            double totalVentas = 0.0;
            
            for (Pedido pedido : pedidos) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(pedido.getIdPedido());
                row.createCell(1).setCellValue(pedido.getUsuario() != null ? 
                    (pedido.getUsuario().getNombres() + " " + pedido.getUsuario().getApellidos()) : "Usuario desconocido");
                row.createCell(2).setCellValue(pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : "");
                row.createCell(3).setCellValue(pedido.getTotal());
                row.createCell(4).setCellValue(pedido.getEstado() != null ? pedido.getEstado() : "Pendiente");
                row.createCell(5).setCellValue(pedido.getMetodoPago() != null ? pedido.getMetodoPago().getNombre() : "");
                row.createCell(6).setCellValue(pedido.getFechaPedido() != null ? 
                    pedido.getFechaPedido().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
                
                totalVentas += pedido.getTotal();
            }
            
            // Agregar fila de total
            Row totalRow = sheet.createRow(rowNum + 1);
            Cell totalLabelCell = totalRow.createCell(2);
            totalLabelCell.setCellValue("TOTAL VENTAS:");
            
            CellStyle totalStyle = workbook.createCellStyle();
            Font totalFont = workbook.createFont();
            totalFont.setBold(true);
            totalStyle.setFont(totalFont);
            totalLabelCell.setCellStyle(totalStyle);
            
            Cell totalValueCell = totalRow.createCell(3);
            totalValueCell.setCellValue(totalVentas);
            totalValueCell.setCellStyle(totalStyle);
            
            // Auto-ajustar columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Convertir a bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}