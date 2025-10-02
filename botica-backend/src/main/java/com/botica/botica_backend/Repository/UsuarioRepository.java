package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmailIgnoreCase(String email);
    
    Optional<Usuario> findByEmail(String email);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Usuario u WHERE u.email = :email AND u.password = :password")
    boolean iniciarSesion(
            @Param("email") String email,
            @Param("password") String password
    );

    @Modifying
    @Transactional
    @Query("UPDATE Usuario u SET u.password = :nuevaPass WHERE u.idUsuario = :id")
    void cambiarPassword(
            @Param("id") Long idUsuario,
            @Param("nuevaPass") String nuevaPass
    );

    @Query("SELECT u.direccion FROM Usuario u WHERE u.idUsuario = :id")
    String obtenerDireccionEntrega(@Param("id") Long idUsuario);
}