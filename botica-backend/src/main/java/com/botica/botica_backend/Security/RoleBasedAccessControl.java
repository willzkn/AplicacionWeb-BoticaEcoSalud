package com.botica.botica_backend.Security;

import org.springframework.stereotype.Component;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotación para controlar el acceso basado en roles
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RoleBasedAccessControl {
    String[] allowedRoles() default {};
    boolean requireAuthentication() default true;
}