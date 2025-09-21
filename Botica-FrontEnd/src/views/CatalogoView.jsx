    import React from 'react';
    import MainLayout from './layouts/MainLayout';
    import useCatalogoController from '../controllers/CatalogoController'; 
    import '../styles/catalogo.css';

    // Componente para la barra lateral de filtros
    const ProductFilters = () => {
            return (
        <aside className="filters-sidebar">
        <div className="filter-group">
            <label>Palabras clave</label>
            <input type="text" placeholder="Buscar..." className="search-input" />
        </div>

        <div className="filter-group">
            <label>Rango de precio</label>
            <div className="price-range">
                <span>S/.0-100</span>
                <input type="range" min="0" max="100" step="1" />
            </div>
        </div>

        <div className="filter-group">
            <label>Presentación</label>
            <div><input type="checkbox" /> Tableta</div>
            <div><input type="checkbox" /> Jarabe</div>
            <div><input type="checkbox" /> Cápsulas</div>
        </div>

        <div className="filter-group">
            <label>Tamaño o tipo de empaque</label>
            <div><input type="checkbox" /> Caja x 10 tabletas</div>
            <div><input type="checkbox" /> Caja x 20 tabletas</div>
            <div><input type="checkbox" /> Frasco 120ml</div>
        </div>


        <div className="filter-actions">
            <button className="btn btn-primary">Aplicar filtros</button>
        </div>
        </aside>
    );

    };

    // Componente de producto
    const ProductItem = ({ product }) => {
    return (
        <div className="grid__item">
        <img src={product.src} alt={product.name} />
        <h4>{product.name}</h4>
        <p>{product.price}</p>
        </div>
    );
    };


    function CatalogoView() {
    const { products } = useCatalogoController();

    return (
        <MainLayout>
        <div className="catalogo-page-container">
            <ProductFilters />
            <div className="products-content">
            <div className="filter-pills-container">
                <span className="filter-pill active">Nuevo</span>
                <span className="filter-pill">De mayor a menor</span>
                <span className="filter-pill">De menor a mayor</span>
                <span className="filter-pill">Puntuación</span>
            </div>
            
            <div className="products-grid">

                {/* Mapeo de productos filtrados */}
            {products && products.length > 0 ? (
                products.map(product => (
                <ProductItem key={product.id} product={product} />
                ))
            ) : (
                <p>No hay productos disponibles</p>
            )}
            </div>
            </div>
        </div>
        </MainLayout>
    );
    }

    export default CatalogoView;