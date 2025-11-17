import React, { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import useCatalogoController from '../../controllers/CatalogoController'; 
import '../../styles/catalogo.css';
import { Link } from 'react-router-dom';

// Componente para la barra lateral de filtros
const ProductFilters = ({
  priceMax,
  onPriceChange,
  presentations,
  onTogglePresentation,
  onClear,
  sortOption,
  setSortOption,
  categories,
}) => {
  return (
    <aside className="filters-sidebar">
      {/* Filtro de palabras clave removido por requerimiento */}

      <div className="filter-group">
        <label>Rango de precio</label>
        <div className="price-range">
          <span>S/.0 - {priceMax}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={priceMax}
            onChange={(e) => onPriceChange(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Presentación</label>
        {(() => {
          // Opciones curadas que deben mostrarse
          const curated = [
            { label: 'Medicamentos', targetName: 'Medicamentos' },
            { label: 'Vitaminas y Suplementos', targetName: 'Vitaminas y Suplementos' },
            { label: 'Higiene Personal', targetName: 'Cuidado Personal' },
            { label: 'Primeros Auxilios', targetName: 'Primeros Auxilios' },
            { label: 'Bebés y Madres', targetName: 'Bebé y Mamá' },
            { label: 'Dermocosmética o Cuidado de la Piel', targetName: 'Dermocosméticos' },
            { label: 'Equipos Médicos', targetName: 'Equipos Médicos' },
            { label: 'Nutrición Deportiva', targetName: 'Nutrición Deportiva' },
          ];

          const byName = (name) => (categories || []).find(c =>
            (c.nombre || '').toLowerCase() === (name || '').toLowerCase()
          );

          return (
            <div className="filter-options">
              {curated.map((opt) => {
                const cat = byName(opt.targetName);
                // Valor que usamos para filtrar: la descripcion si existe, si no el nombre
                const value = (cat && (cat.descripcion || cat.nombre)) || opt.label;
                const key = cat?.idCategoria || cat?.id || opt.targetName;
                const checked = presentations.has(value);
                return (
                  <label className="checkbox-pill" key={key}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onTogglePresentation(value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          );
        })()}
      </div>

      <div className="filter-actions">
        <button className="btn btn-primary" onClick={onClear}>Limpiar filtros</button>
      </div>
    </aside>
  );
};

// Componente de producto
const ProductItem = ({ product }) => {
  return (
    <div className="grid__item">
      <Link to={`/producto/${product.id}`} aria-label={`Ver detalle de ${product.name}`} title={`Ver detalle de ${product.name}`}>
        <img src={product.src} alt={product.name} />
        <h4>{product.name}</h4>
        <p>{product.price}</p>
        {product.presentation && (
          <p className="product-presentation" style={{color:'#1E4099', fontSize:'12px'}}>
            {product.presentation}
          </p>
        )}
      </Link>
    </div>
  );
};

function CatalogoView() {
  const {
    products,
    loading,
    error,
    priceMax,
    setPriceMax,
    presentations,
    togglePresentation,
    sortOption,
    setSortOption,
    clearFilters,
    categories,
    promotionsProducts,
    showPromotions,
    dismissPromotions,
  } = useCatalogoController();

  useEffect(() => {
    if (showPromotions) {
      const section = document.getElementById('promociones');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [showPromotions]);

  return (
    <MainLayout>
      <div className="catalogo-page-container">
        <ProductFilters
          priceMax={priceMax}
          onPriceChange={setPriceMax}
          presentations={presentations}
          onTogglePresentation={togglePresentation}
          sortOption={sortOption}
          setSortOption={setSortOption}
          onClear={clearFilters}
          categories={categories}
        />
        <div className="products-content">
          {showPromotions && (
            <section id="promociones" className="promotions-section">
              <div className="promotions-header">
                <div>
                  <h3>Promociones destacadas</h3>
                  <p>Seleccionamos algunos productos para ti. ¡Aprovecha mientras duren!</p>
                </div>
                <button
                  type="button"
                  className="promotions-close"
                  onClick={dismissPromotions}
                >
                  Cerrar
                </button>
              </div>
              <div className="promotions-grid">
                {promotionsProducts.length > 0 ? (
                  promotionsProducts.map(product => (
                    <ProductItem key={`promo-${product.id}`} product={product} />
                  ))
                ) : (
                  <p className="promotions-empty">Por el momento no hay promociones disponibles.</p>
                )}
              </div>
            </section>
          )}

          <div className="filter-pills-container">
            <span
              className={`filter-pill ${sortOption === 'nuevo' ? 'active' : ''}`}
              onClick={() => setSortOption('nuevo')}
            >
              Nuevo
            </span>
            <span
              className={`filter-pill ${sortOption === 'desc' ? 'active' : ''}`}
              onClick={() => setSortOption('desc')}
            >
              De mayor a menor
            </span>
            <span
              className={`filter-pill ${sortOption === 'asc' ? 'active' : ''}`}
              onClick={() => setSortOption('asc')}
            >
              De menor a mayor
            </span>
          </div>

          <div className="products-grid">
            {/* Estado de carga */}
            {loading && (
              <div className="loading-message">
                <p>Cargando productos...</p>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {/* Mapeo de productos filtrados */}
            {!loading && products && products.length > 0 ? (
              products.map(product => (
                <ProductItem key={product.id} product={product} />
              ))
            ) : !loading && (
              <p>No hay productos disponibles</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default CatalogoView;