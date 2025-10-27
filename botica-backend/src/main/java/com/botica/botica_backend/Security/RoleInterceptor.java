package com.botica.botica_backend.Security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * Interceptor para verificar permisos basados en roles
 */
@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // Solo procesar si es un método de controlador
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        Method method = handlerMethod.getMethod();

        // Verificar si el método tiene la anotación de control de acceso
        RoleBasedAccessControl roleControl = method.getAnnotation(RoleBasedAccessControl.class);
        if (roleControl == null) {
            return true; // No hay restricciones
        }

        // Verificar autenticación si es requerida
        if (roleControl.requireAuthentication()) {
            String authHeader = request.getHeader("Authorization");
            String userRole = getUserRoleFromRequest(request);

            // Permitir si tiene token Bearer O si tiene rol válido en header (para
            // desarrollo)
            if ((authHeader == null || !authHeader.startsWith("Bearer ")) && userRole == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Token de autenticación requerido\"}");
                response.setContentType("application/json");
                return false;
            }
        }

        // Verificar roles permitidos
        String[] allowedRoles = roleControl.allowedRoles();
        if (allowedRoles.length > 0) {
            String userRole = getUserRoleFromRequest(request);

            System.out.println("=== VALIDACIÓN DE ROLES ===");
            System.out.println("Roles permitidos: " + Arrays.toString(allowedRoles));
            System.out.println("Rol del usuario: " + userRole);
            
            // Convertir a mayúsculas para comparación case-insensitive
            String userRoleUpper = userRole != null ? userRole.toUpperCase() : null;
            boolean isAllowed = userRoleUpper != null && 
                Arrays.stream(allowedRoles)
                    .anyMatch(role -> role.equalsIgnoreCase(userRoleUpper));
            
            System.out.println("Rol del usuario (uppercase): " + userRoleUpper);
            System.out.println("¿Rol permitido?: " + isAllowed);
            System.out.println("===========================");

            if (!isAllowed) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"No tienes permisos para acceder a este recurso\"}");
                response.setContentType("application/json");
                return false;
            }
        }

        return true;
    }

    /**
     * Extrae el rol del usuario desde el request
     * En una implementación real, esto debería decodificar el JWT token
     */
    private String getUserRoleFromRequest(HttpServletRequest request) {
        // Por ahora, simulamos obtener el rol desde un header
        // En una implementación real, decodificarías el JWT token
        String role = request.getHeader("X-User-Role");

        // Si no hay header, intentar obtener desde parámetros (para testing)
        if (role == null) {
            role = request.getParameter("userRole");
        }

        System.out.println("=== DEBUG ROLE INTERCEPTOR ===");
        System.out.println("X-User-Role header: " + role);
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("==============================");

        return role;
    }
}