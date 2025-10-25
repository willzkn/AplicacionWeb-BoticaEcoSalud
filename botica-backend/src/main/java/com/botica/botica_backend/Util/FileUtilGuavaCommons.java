package com.botica.botica_backend.Util;

import com.google.common.io.Files;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Utilidades para manejo de archivos usando Apache Commons IO y Google Guava
 */
@Component
public class FileUtilGuavaCommons {

    /**
     * Lee un archivo como string usando Apache Commons IO
     */
    public String readFileToString(File file) throws IOException {
        return FileUtils.readFileToString(file, StandardCharsets.UTF_8);
    }

    /**
     * Escribe un string a un archivo usando Apache Commons IO
     */
    public void writeStringToFile(File file, String content) throws IOException {
        FileUtils.writeStringToFile(file, content, StandardCharsets.UTF_8);
    }

    /**
     * Obtiene la extensión de un archivo usando Apache Commons IO
     */
    public String getFileExtension(String filename) {
        return FilenameUtils.getExtension(filename);
    }

    /**
     * Obtiene el nombre base de un archivo sin extensión
     */
    public String getBaseName(String filename) {
        return FilenameUtils.getBaseName(filename);
    }

    /**
     * Copia un archivo usando Apache Commons IO
     */
    public void copyFile(File source, File destination) throws IOException {
        FileUtils.copyFile(source, destination);
    }

    /**
     * Obtiene la extensión de un archivo usando Guava
     */
    public String getFileExtensionGuava(String filename) {
        return Files.getFileExtension(filename);
    }

    /**
     * Obtiene el nombre sin extensión usando Guava
     */
    public String getNameWithoutExtensionGuava(String filename) {
        return Files.getNameWithoutExtension(filename);
    }

    /**
     * Valida si un archivo tiene una extensión permitida
     */
    public boolean isValidImageExtension(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return extension.equals("jpg") || extension.equals("jpeg") || 
               extension.equals("png") || extension.equals("gif");
    }

    /**
     * Convierte bytes a formato legible
     */
    public String humanReadableByteCount(long bytes) {
        return FileUtils.byteCountToDisplaySize(bytes);
    }
}