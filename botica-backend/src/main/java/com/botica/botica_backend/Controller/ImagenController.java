package com.botica.botica_backend.Controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/imagenes")
@RequiredArgsConstructor
public class ImagenController {

    private static final Logger log = LoggerFactory.getLogger(ImagenController.class);
    
    // Directorio donde se guardarán las imágenes
    @Value("${app.upload.dir:uploads/productos}")
    private String uploadDir;

    /**
     * Subir imagen de producto
     */
    @PostMapping("/upload")
    public ResponseEntity<?> subirImagen(@RequestParam("file") MultipartFile file) {
        try {
            // Validar que el archivo no esté vacío
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
            }

            // Validar tipo de archivo
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solo se permiten archivos de imagen"));
            }

            // Crear directorio si no existe
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generar nombre único para el archivo
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Guardar archivo
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Construir URL de acceso
            String imageUrl = "/api/imagenes/view/" + filename;

            log.info("Imagen subida exitosamente: {}", filename);

            Map<String, String> response = new HashMap<>();
            response.put("filename", filename);
            response.put("url", imageUrl);
            response.put("originalName", originalFilename);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Error al subir imagen", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al guardar la imagen"));
        }
    }

    /**
     * Servir imagen
     */
    @GetMapping("/view/{filename}")
    public ResponseEntity<Resource> verImagen(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Determinar tipo de contenido
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (MalformedURLException e) {
            log.error("Error al servir imagen: {}", filename, e);
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            log.error("Error al leer imagen: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Eliminar imagen
     */
    @DeleteMapping("/{filename}")
    public ResponseEntity<?> eliminarImagen(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Imagen eliminada: {}", filename);
                return ResponseEntity.ok(Map.of("message", "Imagen eliminada correctamente"));
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (IOException e) {
            log.error("Error al eliminar imagen: {}", filename, e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al eliminar la imagen"));
        }
    }
}