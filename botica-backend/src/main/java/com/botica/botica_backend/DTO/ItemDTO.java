package com.botica.botica_backend.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ItemDTO {
    @NotNull
    private Long idProducto;
    @NotNull
    @Min(1)
    private Integer cantidad;

    public Long getIdProducto() { return idProducto; }
    public void setIdProducto(Long idProducto) { this.idProducto = idProducto; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
