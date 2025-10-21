package com.botica.botica_backend.Repository;

import com.botica.botica_backend.Model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    @Transactional
    @Modifying
    @Query("DELETE FROM PasswordResetToken p WHERE p.usuario.idUsuario = :idUsuario")
    void deleteByUsuarioIdUsuario(@Param("idUsuario") Long idUsuario);
}
