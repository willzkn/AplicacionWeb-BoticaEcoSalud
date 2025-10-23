package com.botica.botica_backend.Config;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Model.Categoria;
import com.botica.botica_backend.Repository.ProductoRepository;
import com.botica.botica_backend.Repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfigGuava {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Bean
    public LoadingCache<Long, Producto> productCache() {
        return CacheBuilder.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .build(new CacheLoader<Long, Producto>() {
                    @Override
                    public Producto load(Long id) throws Exception {
                        return productoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
                    }
                });
    }

    @Bean
    public LoadingCache<String, List<Categoria>> categoryCache() {
        return CacheBuilder.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .build(new CacheLoader<String, List<Categoria>>() {
                    @Override
                    public List<Categoria> load(String key) throws Exception {
                        if ("active".equals(key)) {
                            return categoriaRepository.findByActivoTrue();
                        }
                        return categoriaRepository.findAll();
                    }
                });
    }

    @Bean
    public LoadingCache<String, List<Producto>> popularProductsCache() {
        return CacheBuilder.newBuilder()
                .maximumSize(50)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build(new CacheLoader<String, List<Producto>>() {
                    @Override
                    public List<Producto> load(String key) throws Exception {
                        // Por ahora retornamos todos los productos
                        // En el futuro se puede implementar lógica de productos populares
                        return productoRepository.findAll();
                    }
                });
    }
}