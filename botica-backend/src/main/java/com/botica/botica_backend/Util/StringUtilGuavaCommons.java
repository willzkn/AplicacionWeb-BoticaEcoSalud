package com.botica.botica_backend.Util;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Utilidades para manejo de strings usando Apache Commons y Google Guava
 */
@Component
public class StringUtilGuavaCommons {

    /**
     * Valida si un string no está vacío usando Apache Commons
     */
    public boolean isNotEmpty(String str) {
        return StringUtils.isNotBlank(str);
    }

    /**
     * Capitaliza la primera letra usando Apache Commons
     */
    public String capitalize(String str) {
        return StringUtils.capitalize(str);
    }

    /**
     * Trunca un string a una longitud específica
     */
    public String truncate(String str, int maxLength) {
        return StringUtils.truncate(str, maxLength);
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
        return StringUtils.stripAccents(str)
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", " ");
    }
}