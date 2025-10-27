package com.botica.botica_backend.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPedido")
    private Long idPedido;

    @Column(name = "total")
    private Double total;
    
    @Column(name = "estado")
    private String estado;
    
    @Column(name = "fechaPedido")
    private LocalDate fechaPedido;

    @ManyToOne
    @JoinColumn(name = "idUsuario")
    @JsonIgnoreProperties({"password", "activo", "fechaRegistro", "debeCambiarPassword"})
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idMetodoPago")
    @JsonIgnoreProperties({"activo"})
    private Metodo_pago metodoPago;
    
    @OneToMany(mappedBy = "pedido", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Detalle_pedido> detalles;

    // Manual getters and setters as fallback
    public Long getIdPedido() { return idPedido; }
    public void setIdPedido(Long idPedido) { this.idPedido = idPedido; }
    
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public LocalDate getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDate fechaPedido) { this.fechaPedido = fechaPedido; }
    
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    
    public Metodo_pago getMetodoPago() { return metodoPago; }
    public void setMetodoPago(Metodo_pago metodoPago) { this.metodoPago = metodoPago; }
    
    public List<Detalle_pedido> getDetalles() { return detalles; }
    public void setDetalles(List<Detalle_pedido> detalles) { this.detalles = detalles; }
}