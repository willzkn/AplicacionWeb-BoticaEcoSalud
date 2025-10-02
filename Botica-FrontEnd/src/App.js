 import './App.css';
 import { BrowserRouter, Routes, Route } from 'react-router-dom';
 import { HelmetProvider } from 'react-helmet-async';
 import LoginView from './views/pages/LoginView';
 import RegisterView from './views/pages/RegisterView'; 
 import Inicio from './views/pages/Inicio';
 import CatalogoView from './views/pages/CatalogoView';
 import ProductDetail from './views/pages/ProductDetail';
 import { CartProvider } from './controllers/CartContext'; 
 import { AuthProvider } from './controllers/AuthContext';
 import CarritoView from './views/pages/CarritoView'; 
 import Dashboard from './views/admin/Dashboard';
 import RequireAdmin from './views/admin/RequireAdmin';
 import CategoriesPage from './views/admin/CategoriesPage';
 import UsersPage from './views/admin/UsersPage';
 import ProductsPage from './views/admin/ProductsPage';
 import OrdersPage from './views/admin/OrdersPage';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} /> 
            <Route path="/catalogo" element={<CatalogoView />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<CarritoView />} /> 
            <Route path="/admin" element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            } />
            <Route path="/admin/usuarios" element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            } />
            <Route path="/admin/categorias" element={
              <RequireAdmin>
                <CategoriesPage />
              </RequireAdmin>
            } />
            <Route path="/admin/productos" element={
              <RequireAdmin>
                <ProductsPage />
              </RequireAdmin>
            } />
            <Route path="/admin/pedidos" element={
              <RequireAdmin>
                <OrdersPage />
              </RequireAdmin>
            } />
          </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
