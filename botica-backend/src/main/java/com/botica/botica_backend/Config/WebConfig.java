package com.botica.botica_backend.Config;

import com.botica.botica_backend.Security.RoleInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de interceptores web
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private RoleInterceptor roleInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(roleInterceptor)
                .addPathPatterns("/api/**") // Aplicar a todas las rutas de API
                .excludePathPatterns(
                    "/api/auth/**",     // Excluir rutas de autenticación
                    "/api/public/**",   // Excluir rutas públicas
                    "/api/productos/all", // Permitir ver productos sin autenticación
                    "/api/productos/publicos", // Permitir ver productos públicos
                    "/api/categorias/all", // Permitir ver categorías sin autenticación
                    "/api/metodos-pago/activos", // Permitir ver métodos de pago
                    "/api/imagenes/view/**" // Permitir ver imágenes sin autenticación
                );
    }
}