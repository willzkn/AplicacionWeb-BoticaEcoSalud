import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/inicio.css';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import Chatbot from '../partials/Chatbot';
import ProductoService from '../../services/ProductoService';

const FALLBACK_IMAGE_BY_NAME = {
  medicamentos: `${process.env.PUBLIC_URL}/assets/grid-1.JPG`,
  'vitaminas y suplementos': `${process.env.PUBLIC_URL}/assets/grid-2.JPG`,
  'cuidado personal': `${process.env.PUBLIC_URL}/assets/grid-3.JPG`,
  'primeros auxilios': `${process.env.PUBLIC_URL}/assets/grid-4.JPG`,
  'bebe y mama': `${process.env.PUBLIC_URL}/assets/grid-5.JPG`,
  'bebé y mamá': `${process.env.PUBLIC_URL}/assets/grid-5.JPG`,
  'dermocosmeticos': `${process.env.PUBLIC_URL}/assets/grid-6.JPG`,
  'dermocosméticos': `${process.env.PUBLIC_URL}/assets/grid-6.JPG`,
  'equipos medicos': `${process.env.PUBLIC_URL}/assets/grid-4.JPG`,
  'equipos médicos': `${process.env.PUBLIC_URL}/assets/grid-4.JPG`,
  'nutricion deportiva': `${process.env.PUBLIC_URL}/assets/grid-3.JPG`,
  'nutrición deportiva': `${process.env.PUBLIC_URL}/assets/grid-3.JPG`
};

const FALLBACK_GRID_IMAGES = [
  { id: 1, src: `${process.env.PUBLIC_URL}/assets/grid-1.JPG`, alt: 'Categoría destacada 1' },
  { id: 2, src: `${process.env.PUBLIC_URL}/assets/grid-2.JPG`, alt: 'Categoría destacada 2' },
  { id: 3, src: `${process.env.PUBLIC_URL}/assets/grid-3.JPG`, alt: 'Categoría destacada 3' },
  { id: 4, src: `${process.env.PUBLIC_URL}/assets/grid-4.JPG`, alt: 'Categoría destacada 4' },
  { id: 5, src: `${process.env.PUBLIC_URL}/assets/grid-5.JPG`, alt: 'Categoría destacada 5' },
  { id: 6, src: `${process.env.PUBLIC_URL}/assets/grid-6.JPG`, alt: 'Categoría destacada 6' }
];

// Componente de flecha para navegación
const Arrow = ({ direction, onClick }) => (
  <button 
    className={`slider__arrow slider__arrow--${direction}`}
    onClick={onClick}
    aria-label={`Ir a ${direction === 'left' ? 'anterior' : 'siguiente'}`}
  >
    {direction === 'left' ? '❮' : '❯'}
  </button>
);

// Componente del Slider
const ImageSlider = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideInterval = useRef();
  const sliderRef = useRef(null);

  const goToSlide = (index) => {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    setCurrentSlide(index);
    
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  // Efecto para el autoplay continuo
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);
  
  // Efecto para manejar el scroll infinito
  useEffect(() => {
    if (!sliderRef.current) return;
    
    const slideWidth = sliderRef.current.offsetWidth;
    
    // Si llegamos al final, hacemos una transición suave al principio
    if (currentSlide >= slides.length) {
      const resetSlider = () => {
        sliderRef.current.scrollTo({
          left: 0,
          behavior: 'auto'
        });
        setCurrentSlide(0);
      };
      
      // Primero animamos al último slide
      sliderRef.current.scrollTo({
        left: (slides.length) * slideWidth,
        behavior: 'smooth'
      });
      
      // Luego reseteamos sin animación
      const timer = setTimeout(resetSlider, 500);
      return () => clearTimeout(timer);
    } else {
      // Navegación normal
      sliderRef.current.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [currentSlide, slides.length]);

  return (
    <section 
      className="catalogo__slider"
      aria-label="Slider de productos destacados"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="slider__viewport" ref={sliderRef}>
        <div className="slider__track">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slider__slide ${index === currentSlide ? 'active' : ''}`}
              aria-hidden={index !== currentSlide}
            >
              <Link
                to="/catalogo"
                className="slider__link"
                aria-label={slide.alt || 'Ir al catálogo'}
              >
                <img src={slide.src} alt={slide.alt} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Arrow direction="left" onClick={prevSlide} />
      <Arrow direction="right" onClick={nextSlide} />

      <div className="slider__indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`slider__indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

// Componente principal de Inicio
const Inicio = () => {
  const sliderImages = [
    { id: 1, src: `${process.env.PUBLIC_URL}/assets/slider1.JPG`, alt: "Producto destacado 1" },
    { id: 2, src: `${process.env.PUBLIC_URL}/assets/slider2.JPG`, alt: "Producto destacado 2" },
    { id: 3, src: `${process.env.PUBLIC_URL}/assets/slider3.JPG`, alt: "Producto destacado 3" }
  ];

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/categorias/activas');
        if (!response.ok) throw new Error('No se pudieron cargar las categorías');
        const data = await response.json();
        const filtered = Array.isArray(data)
          ? data.filter((cat) => cat && (cat.activo ?? true))
          : [];
        setCategories(filtered);
      } catch (error) {
        console.error('Error al cargar categorías para el inicio:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const normalizeCategoryName = (value) => {
    if (typeof value !== 'string') return '';
    let normalized = value.trim();
    try {
      normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch (error) {
      // noop: algunos navegadores legacy podrían no soportar normalize
    }
    return normalized.toLowerCase();
  };

  const categoriesForGrid = categories.map((category, index) => {
    const normalizedName = normalizeCategoryName(category?.nombre);
    const fallbackImage = FALLBACK_IMAGE_BY_NAME[normalizedName] || FALLBACK_GRID_IMAGES[index % FALLBACK_GRID_IMAGES.length].src;
    const fallbackAlt = FALLBACK_GRID_IMAGES[index % FALLBACK_GRID_IMAGES.length].alt;

    const rawImage = typeof category?.imagen === 'string' ? category.imagen.trim() : '';
    const resolvedFromBackend = rawImage
      ? (rawImage.startsWith('data:image') || rawImage.startsWith('http'))
        ? rawImage
        : ProductoService.obtenerUrlImagen(rawImage)
      : null;

    return {
      key: category.idCategoria,
      to: `/catalogo?categoriaId=${category.idCategoria}&categoriaNombre=${encodeURIComponent(category.nombre || '')}`,
      src: resolvedFromBackend || fallbackImage,
      alt: (category?.nombre || '').trim() || fallbackAlt
    };
  });

  const gridImages = categoriesForGrid.length > 0 ? categoriesForGrid : FALLBACK_GRID_IMAGES;

  return (
    <div className="ecosalud-root">
      <Header onSearchChange={() => {}} onSearchKeyPress={() => {}} />
      <main className="catalogo">
        <div className="banner-container">
          <ImageSlider slides={sliderImages} />
        </div>

        <header className="catalogo__header" aria-label="Bienvenido a nuestra tienda">
          <h1 className="catalogo__title">
            Bienveni<span className="catalogo__title-accent">dos</span>
          </h1>
          <p className="catalogo__subtitle">Descubre nuestros productos destacados y novedades</p>
        </header>

        <section className="catalogo__grid">
          {gridImages.map((image, index) => (
            <div key={image.key ?? image.id ?? index} className="grid__item">
              {image.to ? (
                <Link to={image.to}>
                  <img src={image.src} alt={image.alt} loading="lazy" />
                </Link>
              ) : (
                <img src={image.src} alt={image.alt} loading="lazy" />
              )}
            </div>
          ))}
        </section>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Inicio;
