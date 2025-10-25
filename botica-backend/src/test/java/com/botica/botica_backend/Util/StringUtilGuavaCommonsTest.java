package com.botica.botica_backend.Util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests para StringUtilGuavaCommons
 */
@DisplayName("StringUtilGuavaCommons Tests")
class StringUtilGuavaCommonsTest {

    private StringUtilGuavaCommons stringUtil;

    @BeforeEach
    void setUp() {
        stringUtil = new StringUtilGuavaCommons();
    }

    @Test
    @DisplayName("Debe validar correctamente si un string no está vacío")
    void testIsNotEmpty() {
        // Given - Arrange
        String textoValido = "Paracetamol";
        String textoVacio = "";
        String textoNull = null;
        String textoEspacios = "   ";

        // When - Act & Then - Assert
        assertTrue(stringUtil.isNotEmpty(textoValido));
        assertFalse(stringUtil.isNotEmpty(textoVacio));
        assertFalse(stringUtil.isNotEmpty(textoNull));
        assertFalse(stringUtil.isNotEmpty(textoEspacios));
    }

    @Test
    @DisplayName("Debe capitalizar correctamente la primera letra")
    void testCapitalize() {
        // Given
        String textoMinuscula = "paracetamol";
        String textoMayuscula = "IBUPROFENO";
        String textoVacio = "";
        String textoNull = null;

        // When & Then
        assertEquals("Paracetamol", stringUtil.capitalize(textoMinuscula));
        assertEquals("Ibuprofeno", stringUtil.capitalize(textoMayuscula));
        assertEquals("", stringUtil.capitalize(textoVacio));
        assertNull(stringUtil.capitalize(textoNull));
    }

    @Test
    @DisplayName("Debe truncar strings correctamente")
    void testTruncate() {
        // Given
        String textoLargo = "Paracetamol 500mg tabletas";
        String textoCorto = "Aspirina";
        String textoNull = null;

        // When & Then
        assertEquals("Paracetamol", stringUtil.truncate(textoLargo, 11));
        assertEquals("Aspirina", stringUtil.truncate(textoCorto, 20));
        assertNull(stringUtil.truncate(textoNull, 10));
    }

    @Test
    @DisplayName("Debe validar correctamente null o empty usando Guava")
    void testIsNullOrEmpty() {
        // Given & When & Then
        assertTrue(stringUtil.isNullOrEmpty(null));
        assertTrue(stringUtil.isNullOrEmpty(""));
        assertFalse(stringUtil.isNullOrEmpty("Medicamento"));
        assertFalse(stringUtil.isNullOrEmpty("   ")); // Espacios no se consideran empty
    }

    @Test
    @DisplayName("Debe rellenar strings con caracteres usando Guava")
    void testPadStart() {
        // Given
        String numero = "123";
        String codigo = "A1";

        // When & Then
        assertEquals("00123", stringUtil.padStart(numero, 5, '0'));
        assertEquals("000A1", stringUtil.padStart(codigo, 5, '0'));
        assertEquals("123", stringUtil.padStart(numero, 2, '0')); // No padding si ya es más largo
    }

    @Test
    @DisplayName("Debe dividir listas en particiones usando Guava")
    void testPartition() {
        // Given
        List<String> medicamentos = Arrays.asList(
            "Paracetamol", "Ibuprofeno", "Aspirina", "Diclofenaco", "Naproxeno"
        );

        // When
        List<List<String>> particiones = stringUtil.partition(medicamentos, 2);

        // Then
        assertEquals(3, particiones.size()); // 5 elementos en grupos de 2 = 3 grupos
        assertEquals(2, particiones.get(0).size()); // Primer grupo: 2 elementos
        assertEquals(2, particiones.get(1).size()); // Segundo grupo: 2 elementos
        assertEquals(1, particiones.get(2).size()); // Tercer grupo: 1 elemento
    }

    @Test
    @DisplayName("Debe normalizar strings para búsqueda")
    void testNormalizeForSearch() {
        // Given
        String textoConAcentos = "Medicación Pediátrica";
        String textoConEspacios = "  Paracetamol   500mg  ";
        String textoMayusculas = "IBUPROFENO FORTE";
        String textoNull = null;

        // When & Then
        assertEquals("medicacion pediatrica", stringUtil.normalizeForSearch(textoConAcentos));
        assertEquals("paracetamol 500mg", stringUtil.normalizeForSearch(textoConEspacios));
        assertEquals("ibuprofeno forte", stringUtil.normalizeForSearch(textoMayusculas));
        assertEquals("", stringUtil.normalizeForSearch(textoNull));
    }

    @Test
    @DisplayName("Debe validar si un string es numérico")
    void testIsNumeric() {
        // Given & When & Then
        assertTrue(stringUtil.isNumeric("123"));
        assertTrue(stringUtil.isNumeric("0"));
        assertFalse(stringUtil.isNumeric("123.45"));
        assertFalse(stringUtil.isNumeric("abc"));
        assertFalse(stringUtil.isNumeric("12a3"));
        assertFalse(stringUtil.isNumeric(""));
        assertFalse(stringUtil.isNumeric(null));
    }

    @Test
    @DisplayName("Debe convertir a formato de título")
    void testToTitleCase() {
        // Given
        String textoMinuscula = "paracetamol forte";
        String textoMayuscula = "IBUPROFENO PEDIATRICO";
        String textoMixto = "aSpiRiNa InfAnTiL";

        // When & Then
        assertEquals("Paracetamol Forte", stringUtil.toTitleCase(textoMinuscula));
        assertEquals("Ibuprofeno Pediatrico", stringUtil.toTitleCase(textoMayuscula));
        assertEquals("Aspirina Infantil", stringUtil.toTitleCase(textoMixto));
    }

    @Test
    @DisplayName("Debe repetir strings correctamente")
    void testRepeat() {
        // Given
        String texto = "ABC";
        String textoVacio = "";

        // When & Then
        assertEquals("ABCABCABC", stringUtil.repeat(texto, 3));
        assertEquals("", stringUtil.repeat(texto, 0));
        assertEquals("", stringUtil.repeat(texto, -1));
        assertEquals("", stringUtil.repeat(textoVacio, 5));
        assertEquals("", stringUtil.repeat(null, 3));
    }
}