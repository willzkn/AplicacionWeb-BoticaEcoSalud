package com.botica.botica_backend.Util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

/**
 * Utilidades para logging usando Logback
 */
@Component
public class LoggingUtilLogback {

    private static final Logger logger = LoggerFactory.getLogger(LoggingUtilLogback.class);
    private static final Logger businessLogger = LoggerFactory.getLogger("BUSINESS_OPERATIONS");
    private static final Logger loginLogger = LoggerFactory.getLogger("LOGIN_EVENTS");
    private static final Logger errorLogger = LoggerFactory.getLogger("ERROR_LOGGER");

    /**
     * Registra eventos de negocio
     */
    public void logBusinessOperation(String operation, String details, String userId) {
        MDC.put("userId", userId);
        MDC.put("operation", operation);
        businessLogger.info("Operación: {} - Detalles: {}", operation, details);
        MDC.clear();
    }

    /**
     * Registra eventos de login
     */
    public void logLoginEvent(String username, String action, String ipAddress) {
        MDC.put("username", username);
        MDC.put("ipAddress", ipAddress);
        loginLogger.info("Login event: {} para usuario: {}", action, username);
        MDC.clear();
    }

    /**
     * Registra errores críticos
     */
    public void logError(String message, Throwable throwable, String context) {
        MDC.put("context", context);
        errorLogger.error("Error: {} - Contexto: {}", message, context, throwable);
        MDC.clear();
    }

    /**
     * Registra información general
     */
    public void logInfo(String message, Object... params) {
        logger.info(message, params);
    }

    /**
     * Registra advertencias
     */
    public void logWarning(String message, Object... params) {
        logger.warn(message, params);
    }

    /**
     * Registra información de depuración
     */
    public void logDebug(String message, Object... params) {
        logger.debug(message, params);
    }
}