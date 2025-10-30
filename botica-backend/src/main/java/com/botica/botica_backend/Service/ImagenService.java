package com.botica.botica_backend.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class ImagenService {
    
    private static final Logger log = LoggerFactory.getLogger(ImagenService.class);
    
    // Imagen por defecto (avatar genérico en base64)
    private static final String IMAGEN_DEFAULT = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiM2MzY2RjEiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMTUiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNSA3NUMyNSA2NS4zMzUgMzMuMzM1IDU3IDQzIDU3SDU3QzY2LjY2NSA1NyA3NSA2NS4zMzUgNzUgNzVWODVIMjVWNzVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
    
    /**
     * Obtener imagen del usuario o imagen por defecto
     */
    public String obtenerImagenUsuario(String imagenUsuario) {
        if (imagenUsuario == null || imagenUsuario.trim().isEmpty()) {
            return IMAGEN_DEFAULT;
        }
        
        // Verificar si la imagen ya tiene el prefijo data:
        if (!imagenUsuario.startsWith("data:")) {
            // Asumir que es base64 puro y agregar prefijo
            return "data:image/jpeg;base64," + imagenUsuario;
        }
        
        return imagenUsuario;
    }
    
    /**
     * Validar formato de imagen base64
     */
    public boolean esImagenValida(String imagenBase64) {
        if (imagenBase64 == null || imagenBase64.trim().isEmpty()) {
            return true; // null/vacío es válido (usará imagen por defecto)
        }
        
        try {
            // Extraer solo la parte base64 si tiene prefijo data:
            String base64Data = imagenBase64;
            if (imagenBase64.startsWith("data:")) {
                String[] parts = imagenBase64.split(",");
                if (parts.length == 2) {
                    base64Data = parts[1];
                } else {
                    return false;
                }
            }
            
            // Intentar decodificar
            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
            
            // Verificar tamaño (máximo 5MB)
            if (decodedBytes.length > 5 * 1024 * 1024) {
                log.warn("Imagen demasiado grande: {} bytes", decodedBytes.length);
                return false;
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error validando imagen base64: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Limpiar y normalizar imagen base64
     */
    public String normalizarImagen(String imagenBase64) {
        if (imagenBase64 == null || imagenBase64.trim().isEmpty()) {
            return null; // Se usará imagen por defecto
        }
        
        try {
            // Si ya tiene prefijo data:, devolverla tal como está
            if (imagenBase64.startsWith("data:")) {
                return imagenBase64;
            }
            
            // Si es base64 puro, agregar prefijo genérico
            return "data:image/jpeg;base64," + imagenBase64;
            
        } catch (Exception e) {
            log.error("Error normalizando imagen: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Obtener información de la imagen
     */
    public String obtenerInfoImagen(String imagenBase64) {
        if (imagenBase64 == null || imagenBase64.trim().isEmpty()) {
            return "Imagen por defecto";
        }
        
        try {
            String base64Data = imagenBase64;
            if (imagenBase64.startsWith("data:")) {
                String[] parts = imagenBase64.split(",");
                if (parts.length == 2) {
                    base64Data = parts[1];
                }
            }
            
            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
            double sizeKB = decodedBytes.length / 1024.0;
            
            return String.format("Imagen personalizada (%.1f KB)", sizeKB);
            
        } catch (Exception e) {
            return "Imagen inválida";
        }
    }
}