package com.botica.botica_backend;

import com.botica.botica_backend.Service.ImagenService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ImagenServiceTest {

    @Autowired
    private ImagenService imagenService;

    @Test
    public void testObtenerImagenUsuario_ConImagenNull_DebeRetornarImagenDefault() {
        String resultado = imagenService.obtenerImagenUsuario(null);
        assertNotNull(resultado);
        assertTrue(resultado.startsWith("data:image/svg+xml;base64,"));
    }

    @Test
    public void testObtenerImagenUsuario_ConImagenVacia_DebeRetornarImagenDefault() {
        String resultado = imagenService.obtenerImagenUsuario("");
        assertNotNull(resultado);
        assertTrue(resultado.startsWith("data:image/svg+xml;base64,"));
    }

    @Test
    public void testObtenerImagenUsuario_ConImagenValida_DebeRetornarLaMismaImagen() {
        String imagenConPrefijo = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ";
        String resultado = imagenService.obtenerImagenUsuario(imagenConPrefijo);
        assertEquals(imagenConPrefijo, resultado);
    }

    @Test
    public void testEsImagenValida_ConImagenNull_DebeRetornarTrue() {
        assertTrue(imagenService.esImagenValida(null));
    }

    @Test
    public void testEsImagenValida_ConImagenVacia_DebeRetornarTrue() {
        assertTrue(imagenService.esImagenValida(""));
    }

    @Test
    public void testEsImagenValida_ConBase64Valido_DebeRetornarTrue() {
        String base64Valido = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        assertTrue(imagenService.esImagenValida(base64Valido));
    }

    @Test
    public void testEsImagenValida_ConBase64Invalido_DebeRetornarFalse() {
        String base64Invalido = "esto-no-es-base64-valido";
        assertFalse(imagenService.esImagenValida(base64Invalido));
    }

    @Test
    public void testNormalizarImagen_ConImagenNull_DebeRetornarNull() {
        assertNull(imagenService.normalizarImagen(null));
    }

    @Test
    public void testNormalizarImagen_ConImagenVacia_DebeRetornarNull() {
        assertNull(imagenService.normalizarImagen(""));
    }

    @Test
    public void testNormalizarImagen_ConBase64Puro_DebeAgregarPrefijo() {
        String base64Puro = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        String resultado = imagenService.normalizarImagen(base64Puro);
        assertEquals("data:image/jpeg;base64," + base64Puro, resultado);
    }

    @Test
    public void testNormalizarImagen_ConPrefijoExistente_DebeRetornarIgual() {
        String imagenConPrefijo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        String resultado = imagenService.normalizarImagen(imagenConPrefijo);
        assertEquals(imagenConPrefijo, resultado);
    }

    @Test
    public void testObtenerInfoImagen_ConImagenNull_DebeRetornarMensajeDefault() {
        String resultado = imagenService.obtenerInfoImagen(null);
        assertEquals("Imagen por defecto", resultado);
    }

    @Test
    public void testObtenerInfoImagen_ConImagenValida_DebeRetornarInfo() {
        String base64Valido = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        String resultado = imagenService.obtenerInfoImagen(base64Valido);
        assertTrue(resultado.contains("Imagen personalizada"));
        assertTrue(resultado.contains("KB"));
    }
}