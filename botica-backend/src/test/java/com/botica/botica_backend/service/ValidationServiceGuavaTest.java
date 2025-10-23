package com.botica.botica_backend.service;

import com.botica.botica_backend.Service.ValidationServiceGuava;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para ValidationServiceGuava
 * Implementación de TDD (Test-Driven Development)
 */
@DisplayName("ValidationServiceGuava Tests")
class ValidationServiceGuavaTest {

    private ValidationServiceGuava validationService;

    @BeforeEach
    void setUp() {
        validationService = new ValidationServiceGuava();
    }

    @Test
    @DisplayName("Debe validar email válido correctamente")
    void testValidateEmail_ValidEmail_ShouldPass() {
        // Given
        String validEmail = "usuario@ecosalud.pe";
        
        // When & Then
        assertDoesNotThrow(() -> validationService.validateEmail(validEmail));
    }

    @Test
    @DisplayName("Debe fallar con email inválido")
    void testValidateEmail_InvalidEmail_ShouldThrow() {
        // Given
        String invalidEmail = "email-invalido";
        
        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> validationService.validateEmail(invalidEmail));
    }

    @Test
    @DisplayName("Debe fallar con email null")
    void testValidateEmail_NullEmail_ShouldThrow() {
        // Given
        String nullEmail = null;
        
        // When & Then
        assertThrows(NullPointerException.class, 
            () -> validationService.validateEmail(nullEmail));
    }

    @Test
    @DisplayName("Debe validar nombre válido correctamente")
    void testValidateName_ValidName_ShouldPass() {
        // Given
        String validName = "Juan Carlos";
        
        // When & Then
        assertDoesNotThrow(() -> validationService.validateName(validName, "Nombre"));
    }

    @Test
    @DisplayName("Debe fallar con nombre con números")
    void testValidateName_NameWithNumbers_ShouldThrow() {
        // Given
        String nameWithNumbers = "Juan123";
        
        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> validationService.validateName(nameWithNumbers, "Nombre"));
    }

    @Test
    @DisplayName("Debe validar precio válido correctamente")
    void testValidatePrice_ValidPrice_ShouldPass() {
        // Given
        Double validPrice = 25.50;
        
        // When & Then
        assertDoesNotThrow(() -> validationService.validatePrice(validPrice));
    }

    @Test
    @DisplayName("Debe fallar con precio negativo")
    void testValidatePrice_NegativePrice_ShouldThrow() {
        // Given
        Double negativePrice = -10.0;
        
        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> validationService.validatePrice(negativePrice));
    }

    @Test
    @DisplayName("Debe validar stock válido correctamente")
    void testValidateStock_ValidStock_ShouldPass() {
        // Given
        Integer validStock = 100;
        
        // When & Then
        assertDoesNotThrow(() -> validationService.validateStock(validStock));
    }

    @Test
    @DisplayName("Debe fallar con stock negativo")
    void testValidateStock_NegativeStock_ShouldThrow() {
        // Given
        Integer negativeStock = -5;
        
        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> validationService.validateStock(negativeStock));
    }

    @Test
    @DisplayName("Debe validar teléfono válido correctamente")
    void testValidatePhone_ValidPhone_ShouldPass() {
        // Given
        String validPhone = "987654321";
        
        // When & Then
        assertDoesNotThrow(() -> validationService.validatePhone(validPhone));
    }

    @Test
    @DisplayName("Debe permitir teléfono vacío")
    void testValidatePhone_EmptyPhone_ShouldPass() {
        // Given
        String emptyPhone = "";
        
        // When & Then
        assertDoesNotThrow(() -> validationService.validatePhone(emptyPhone));
    }
}