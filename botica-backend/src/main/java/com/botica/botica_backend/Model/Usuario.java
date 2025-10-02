package com.botica.botica_backend.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    @NotBlank
    @Column(nullable = false)
    private String nombres;
    @NotBlank
    @Column(nullable = false)
    private String apellidos;
    @Column(unique = true)
    private String telefono;
    private String direccion;
    private String rol;
    private Boolean activo;
    private LocalDate fechaRegistro;
}