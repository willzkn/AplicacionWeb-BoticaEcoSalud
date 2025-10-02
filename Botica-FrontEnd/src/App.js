import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LoginView from './views/pages/LoginView';
import RegisterView from './views/pages/RegisterView'; 
import Inicio from './views/pages/Inicio';
import CatalogoView from './views/pages/CatalogoView';
import ProductDetail from './views/pages/ProductDetail';
import { CartProvider } from './controllers/CartContext'; 
import CarritoView from './views/pages/CarritoView'; 

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} /> 
            <Route path="/catalogo" element={<CatalogoView />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<CarritoView />} /> 
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;
