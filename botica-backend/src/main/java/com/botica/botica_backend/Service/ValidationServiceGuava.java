package com.botica.botica_backend.Service;

import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class ValidationServiceGuava {

    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("^[+]?[0-9]{9,15}$");
    
    private static final Pattern PASSWORD_PATTERN = 
        Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$");

    /**
     * Valida que el email no sea null, vacío y tenga formato válido
     */
    public void validateEmail(String email) {
        Preconditions.checkNotNull(email, "Email no puede ser null");
        Preconditions.checkArgument(!Strings.isNullOrEmpty(email.trim()), 
            "Email no puede estar vacío");
        Preconditions.checkArgument(EMAIL_PATTERN.matcher(email).matches(), 
            "Formato de email inválido: %s", email);
    }

    /**
     * Valida que el teléfono tenga formato válido
     */
    public void validatePhone(String phone) {
        if (!Strings.isNullOrEmpty(phone)) {
            Preconditions.checkArgument(PHONE_PATTERN.matcher(phone.replaceAll("\\s", "")).matches(), 
                "Formato de teléfono inválido: %s", phone);
        }
    }

    /**
     * Valida que la contraseña cumpla con los requisitos de seguridad
     */
    public void validatePassword(String password) {
        Preconditions.checkNotNull(password, "Contraseña no puede ser null");
        Preconditions.checkArgument(password.length() >= 6, 
            "Contraseña debe tener al menos 6 caracteres");
        // Para desarrollo, mantenemos validación simple
        // En producción se puede usar PASSWORD_PATTERN para mayor seguridad
    }

    /**
     * Valida que el nombre no sea null o vacío
     */
    public void validateName(String name, String fieldName) {
        Preconditions.checkNotNull(name, "%s no puede ser null", fieldName);
        Preconditions.checkArgument(!Strings.isNullOrEmpty(name.trim()), 
            "%s no puede estar vacío", fieldName);
        Preconditions.checkArgument(name.trim().length() >= 2, 
            "%s debe tener al menos 2 caracteres", fieldName);
    }

    /**
     * Valida que el precio sea válido
     */
    public void validatePrice(Double price) {
        Preconditions.checkNotNull(price, "Precio no puede ser null");
        Preconditions.checkArgument(price > 0, 
            "Precio debe ser mayor a 0, recibido: %s", price);
        Preconditions.checkArgument(price <= 10000, 
            "Precio no puede ser mayor a 10,000, recibido: %s", price);
    }

    /**
     * Valida que el stock sea válido
     */
    public void validateStock(Integer stock) {
        Preconditions.checkNotNull(stock, "Stock no puede ser null");
        Preconditions.checkArgument(stock >= 0, 
            "Stock no puede ser negativo, recibido: %s", stock);
        Preconditions.checkArgument(stock <= 100000, 
            "Stock no puede ser mayor a 100,000, recibido: %s", stock);
    }

    /**
     * Valida que el ID sea válido
     */
    public void validateId(Long id, String entityName) {
        Preconditions.checkNotNull(id, "ID de %s no puede ser null", entityName);
        Preconditions.checkArgument(id > 0, 
            "ID de %s debe ser mayor a 0, recibido: %s", entityName, id);
    }
}