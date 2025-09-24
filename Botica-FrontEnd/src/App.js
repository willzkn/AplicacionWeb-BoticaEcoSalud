import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LoginView from './views/pages/LoginView';
import Inicio from './views/pages/Inicio';
import CatalogoView from './views/pages/CatalogoView';
import ProductDetail from './views/pages/ProductDetail';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/catalogo" element={<CatalogoView />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
