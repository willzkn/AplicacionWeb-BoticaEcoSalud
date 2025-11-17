package com.botica.botica_backend.Service;

import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private static final Logger logger = LoggerFactory.getLogger(CategoriaService.class);
    private final CategoriaRepository categoriaRepository;
    private final ImagenService imagenService;
    private final DataSource dataSource;

    @PostConstruct
    public void asegurarColumnaImagenCategorias() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection == null) {
                logger.warn("No se pudo obtener conexión para verificar columna imagen en categorías");
                return;
            }

            String schema = connection.getCatalog();
            if (schema == null || schema.isBlank()) {
                schema = connection.getSchema();
            }

            ColumnMetadata metadata = obtenerMetadataColumna(connection, schema, "categorias", "imagen");

            if (!metadata.exists) {
                logger.info("Columna 'imagen' no existe en la tabla categorias. Creándola automáticamente");
                try (Statement stmt = connection.createStatement()) {
                    stmt.executeUpdate("ALTER TABLE categorias ADD COLUMN imagen LONGTEXT NULL");
                }
                logger.info("Columna 'imagen' en categorias creada correctamente");
                return;
            }

            if (metadata.typeName != null && !metadata.typeName.equalsIgnoreCase("LONGTEXT")) {
                logger.info("Columna 'imagen' en categorias detectada con tipo {}. Actualizando a LONGTEXT", metadata.typeName);
                try (Statement stmt = connection.createStatement()) {
                    stmt.executeUpdate("ALTER TABLE categorias MODIFY COLUMN imagen LONGTEXT NULL");
                }
                logger.info("Columna 'imagen' en categorias actualizada a LONGTEXT");
            }
        } catch (SQLException e) {
            logger.error("No se pudo verificar o crear la columna imagen en categorias", e);
        }
    }

    private ColumnMetadata obtenerMetadataColumna(Connection connection, String schema, String tabla, String columna) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();

        ColumnMetadata metadata = extraerMetadata(metaData, schema, tabla, columna);
        if (metadata.exists) {
            return metadata;
        }

        // Intento con nombres en mayúsculas (según config MySQL)
        return extraerMetadata(metaData, schema, tabla != null ? tabla.toUpperCase() : null, columna != null ? columna.toUpperCase() : null);
    }

    private ColumnMetadata extraerMetadata(DatabaseMetaData metaData, String schema, String tabla, String columna) throws SQLException {
        ColumnMetadata metadata = new ColumnMetadata();

        try (ResultSet rs = metaData.getColumns(schema, null, tabla, columna)) {
            if (rs.next()) {
                metadata.exists = true;
                metadata.typeName = rs.getString("TYPE_NAME");
                metadata.columnSize = rs.getInt("COLUMN_SIZE");
            }
        }

        return metadata;
    }

    private static class ColumnMetadata {
        boolean exists;
        String typeName;
        Integer columnSize;
    }

    // =====================================================
    // OPERACIONES CRUD COMPLETAS
    // =====================================================

    // CREATE
    @Transactional
    public Categoria crearCategoria(Categoria c) {
        // Validaciones
        if (c.getNombre() == null || c.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
        
        // Verificar que no exista una categoría con el mismo nombre
        if (categoriaRepository.existsByNombreIgnoreCase(c.getNombre())) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }
        
        // Valores por defecto
        c.setActivo(Boolean.TRUE);
        if (c.getFechaCreacion() == null) {
            c.setFechaCreacion(LocalDate.now());
        }

        // Procesar imagen si se proporciona
        if (c.getImagen() != null && !c.getImagen().trim().isEmpty()) {
            if (!imagenService.esImagenValida(c.getImagen())) {
                throw new IllegalArgumentException("La imagen proporcionada no es válida");
            }
            c.setImagen(imagenService.normalizarImagen(c.getImagen()));
        }

        return categoriaRepository.save(c);
    }

    // READ
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> obtenerPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    public List<Categoria> obtenerTodasActivas() {
        return categoriaRepository.obtenerTodasActivas();
    }

    public List<Categoria> buscarPorNombre(String nombre) {
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre);
    }

    // UPDATE
    @Transactional
    public Categoria actualizarCategoria(Categoria categoria) {
        // Verificar que la categoría existe
        Optional<Categoria> existente = categoriaRepository.findById(categoria.getIdCategoria());
        if (existente.isEmpty()) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }

        // Validaciones
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }

        // Verificar que no exista otra categoría con el mismo nombre
        Optional<Categoria> otraCategoria = categoriaRepository.findByNombreIgnoreCaseAndIdCategoriaNotIn(
            categoria.getNombre(), categoria.getIdCategoria());
        if (otraCategoria.isPresent()) {
            throw new IllegalArgumentException("Ya existe otra categoría con ese nombre");
        }

        // Mantener fecha de creación original
        Categoria original = existente.get();
        categoria.setFechaCreacion(original.getFechaCreacion());

        // Procesar imagen si se proporciona (permitir mantener actual)
        if (categoria.getImagen() != null && !categoria.getImagen().trim().isEmpty()) {
            if (!imagenService.esImagenValida(categoria.getImagen())) {
                throw new IllegalArgumentException("La imagen proporcionada no es válida");
            }
            categoria.setImagen(imagenService.normalizarImagen(categoria.getImagen()));
        } else {
            categoria.setImagen(original.getImagen());
        }

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public void cambiarEstado(Long id, Boolean activo) {
        Optional<Categoria> categoria = categoriaRepository.findById(id);
        if (categoria.isEmpty()) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
        
        Categoria c = categoria.get();
        c.setActivo(activo);
        categoriaRepository.save(c);
    }

    @Transactional
    public void desactivarCategoria(Long id) {
        cambiarEstado(id, false);
    }

    // DELETE (Hard delete con validaciones)
    @Transactional
    public void eliminarCategoria(Long id) {
        Optional<Categoria> categoria = categoriaRepository.findById(id);
        if (categoria.isEmpty()) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
        
        // Verificar si tiene productos asociados
        Long productosCount = categoriaRepository.contarProductosPorCategoria(id);
        if (productosCount > 0) {
            throw new IllegalArgumentException("No se puede eliminar la categoría porque tiene " + productosCount + " productos asociados. Desactívela en su lugar.");
        }
        
        // Hard delete - eliminar completamente
        categoriaRepository.deleteById(id);
    }

    // =====================================================
    // OPERACIONES ESPECIALES
    // =====================================================

    public Long contarProductosPorCategoria(Long categoriaId) {
        return categoriaRepository.contarProductosPorCategoria(categoriaId);
    }
}
