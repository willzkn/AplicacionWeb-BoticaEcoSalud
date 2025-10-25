package com.botica.botica_backend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test simple para verificar que JUnit funciona
 */
@DisplayName("Simple Test")
class SimpleTest {

    @Test
    @DisplayName("Debe ejecutar test básico correctamente")
    void testBasico() {
        // Given
        int a = 2;
        int b = 3;
        
        // When
        int resultado = a + b;
        
        // Then
        assertEquals(5, resultado);
        assertTrue(resultado > 0);
        assertNotNull(resultado);
    }

    @Test
    @DisplayName("Debe validar strings correctamente")
    void testStrings() {
        // Given
        String texto = "Hola Mundo";
        
        // When & Then
        assertNotNull(texto);
        assertEquals(10, texto.length());
        assertTrue(texto.contains("Mundo"));
        assertFalse(texto.isEmpty());
    }
}