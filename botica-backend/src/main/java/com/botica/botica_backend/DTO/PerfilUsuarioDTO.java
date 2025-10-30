package com.botica.botica_backend.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PerfilUsuarioDTO {
    
    private Long idUsuario;
    
    @NotBlank(message = "Los nombres son obligatorios")
    @Size(min = 2, max = 50, message = "Los nombres deben tener entre 2 y 50 caracteres")
    private String nombres;
    
    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(min = 2, max = 50, message = "Los apellidos deben tener entre 2 y 50 caracteres")
    private String apellidos;
    
    @Email(message = "El formato del email no es válido")
    private String email;
    
    @Size(max = 15, message = "El teléfono no puede tener más de 15 caracteres")
    private String telefono;
    
    @Size(max = 200, message = "La dirección no puede tener más de 200 caracteres")
    private String direccion;
    
    // Imagen en base64 (opcional)
    private String imagen;
    
    // Para cambio de contraseña (opcional)
    private String nuevaPassword;
    
    private String confirmarPassword;
    
    // Getters y setters manuales
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
    
    public String getNuevaPassword() { return nuevaPassword; }
    public void setNuevaPassword(String nuevaPassword) { this.nuevaPassword = nuevaPassword; }
    
    public String getConfirmarPassword() { return confirmarPassword; }
    public void setConfirmarPassword(String confirmarPassword) { this.confirmarPassword = confirmarPassword; }
}