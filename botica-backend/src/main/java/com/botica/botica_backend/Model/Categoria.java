package com.botica.botica_backend.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "categorias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long idCategoria;

    @Column(nullable = false)
    private String nombre;
    
    private String descripcion;
    
    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo = true;
    
    @Column(name = "fecha_creacion")
    private LocalDate fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDate.now();
        }
        if (activo == null) {
            activo = true;
        }
    }
}
