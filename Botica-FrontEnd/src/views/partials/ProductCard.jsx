import React, { useState } from 'react';
import '../../styles/ProductCard.css';

const stripPunctuation = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[.,;:!?¡¿"'()\[\]{}]/g, '').trim();
};

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.src} alt={product.name} />
      </div>
      <div className="product-info">
        <h2 className="product-title">{stripPunctuation(product.name)}</h2>
        <div className="product-price">{product.price}</div>
        {(() => {
          const pres = product.presentation || product.presentacion || product?.categoria?.descripcion || product?.categoria?.nombre || '';
          return pres ? (
            <div className="product-presentation">{stripPunctuation(pres)}</div>
          ) : null;
        })()}
        {product.description && (
          <p className="product-description">{stripPunctuation(product.description)}</p>
        )}
        
        <div className="quantity-section">
          <div className="quantity-label">Cantidad</div>
          <div className="quantity-selector">
            <button className="quantity-btn" onClick={handleDecrement}>-</button>
            <input 
              type="number" 
              className="quantity-input" 
              value={quantity} 
              min="1" 
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
            <button className="quantity-btn" onClick={handleIncrement}>+</button>
          </div>
          
          <button 
            className="add-to-cart"
            onClick={() => onAddToCart(product, quantity)}
          >
            AGREGAR AL CARRITO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
