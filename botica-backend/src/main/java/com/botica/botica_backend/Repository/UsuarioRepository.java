package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    /**
     * Buscar usuario por email
     */
    Optional<Usuario> findByEmail(String email);
    
    /**
     * Buscar usuarios por rol
     */
    List<Usuario> findByRol(String rol);
    
    /**
     * Buscar usuarios activos
     */
    List<Usuario> findByActivoTrue();
    
    /**
     * Verificar si existe un email
     */
    boolean existsByEmail(String email);
    
    /**
     * Verificar si existe un email (ignorando mayúsculas/minúsculas)
     */
    boolean existsByEmailIgnoreCase(String email);
    
    /**
     * Verificar si existe un teléfono
     */
    boolean existsByTelefono(String telefono);
    
    /**
     * Cambiar contraseña de un usuario
     */
    @Modifying
    @Query("UPDATE Usuario u SET u.password = :password WHERE u.idUsuario = :idUsuario")
    void cambiarPassword(@Param("idUsuario") Long idUsuario, @Param("password") String password);
    
    /**
     * Obtener dirección de entrega de un usuario
     */
    @Query("SELECT u.direccion FROM Usuario u WHERE u.idUsuario = :idUsuario")
    String obtenerDireccionEntrega(@Param("idUsuario") Long idUsuario);
}