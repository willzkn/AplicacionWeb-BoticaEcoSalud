package com.botica.botica_backend.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "metodos_pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Metodo_pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_metodo")
    private Long idMetodoPago;

    @Column(nullable = false)
    private String nombre;
    private String descripcion;
    @Column(nullable = false)
    private Boolean activo;

    // Manual getters and setters as fallback
    public Long getIdMetodoPago() { return idMetodoPago; }
    public void setIdMetodoPago(Long idMetodoPago) { this.idMetodoPago = idMetodoPago; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}

