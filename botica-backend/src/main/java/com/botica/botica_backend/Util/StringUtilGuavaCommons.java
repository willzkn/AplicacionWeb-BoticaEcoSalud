package com.botica.botica_backend.Util;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;

/**
 * Utilidades para manejo de strings usando Google Guava y funcionalidades
 * nativas de Java
 */
@Component
public class StringUtilGuavaCommons {

    /**
     * Valida si un string no está vacío (no es null, no está vacío y no contiene
     * solo espacios)
     */
    public boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }

    /**
     * Capitaliza la primera letra de un string
     */
    public String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    /**
     * Trunca un string a una longitud específica
     */
    public String truncate(String str, int maxLength) {
        if (str == null) {
            return null;
        }
        if (str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength);
    }

    /**
     * Valida si un string está vacío o es null usando Guava
     */
    public boolean isNullOrEmpty(String str) {
        return Strings.isNullOrEmpty(str);
    }

    /**
     * Rellena un string con ceros a la izquierda usando Guava
     */
    public String padStart(String str, int minLength, char padChar) {
        return Strings.padStart(str, minLength, padChar);
    }

    /**
     * Divide una lista en sublistas de tamaño específico usando Guava
     */
    public <T> List<List<T>> partition(List<T> list, int size) {
        return Lists.partition(list, size);
    }

    /**
     * Limpia y normaliza un string para búsquedas
     */
    public String normalizeForSearch(String str) {
        if (Strings.isNullOrEmpty(str)) {
            return "";
        }
        return stripAccents(str)
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", " ");
    }

    /**
     * Remueve acentos de un string usando funcionalidades nativas de Java
     */
    private String stripAccents(String str) {
        if (str == null) {
            return null;
        }
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }

    /**
     * Verifica si un string contiene solo dígitos
     */
    public boolean isNumeric(String str) {
        if (Strings.isNullOrEmpty(str)) {
            return false;
        }
        return str.matches("\\d+");
    }

    /**
     * Convierte un string a formato de título (primera letra de cada palabra en
     * mayúscula)
     */
    public String toTitleCase(String str) {
        if (Strings.isNullOrEmpty(str)) {
            return str;
        }

        StringBuilder result = new StringBuilder();
        boolean capitalizeNext = true;

        for (char c : str.toCharArray()) {
            if (Character.isWhitespace(c)) {
                capitalizeNext = true;
                result.append(c);
            } else if (capitalizeNext) {
                result.append(Character.toUpperCase(c));
                capitalizeNext = false;
            } else {
                result.append(Character.toLowerCase(c));
            }
        }

        return result.toString();
    }

    /**
     * Repite un string n veces
     */
    public String repeat(String str, int times) {
        if (str == null || times <= 0) {
            return "";
        }
        return str.repeat(times);
    }
}