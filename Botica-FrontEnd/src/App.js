 import './App.css';
 import './styles/admin.css';
 import { BrowserRouter, Routes, Route } from 'react-router-dom';
 import { HelmetProvider } from 'react-helmet-async';
 import LoginView from './views/pages/LoginView';
 import RegisterView from './views/pages/RegisterView'; 
 import ForgotPasswordView from './views/pages/ForgotPasswordView';
 import ResetPasswordView from './views/pages/ResetPasswordView';
 import PerfilView from './views/pages/PerfilView';
 import Inicio from './views/pages/Inicio';
 import CatalogoView from './views/pages/CatalogoView';
 import ProductDetail from './views/pages/ProductDetail';
 import AccessDenied from './views/pages/AccessDenied';
 import CheckoutPage from './views/pages/CheckoutPage';
 import OrderConfirmation from './views/pages/OrderConfirmation';
 import { CartProvider } from './controllers/CartContext'; 
 import { AuthProvider } from './controllers/AuthContext';
 import CarritoView from './views/pages/CarritoView'; 
 import Dashboard from './views/admin/Dashboard';
 import RequireAdmin from './views/admin/RequireAdmin';
 import CategoriesPage from './views/admin/CategoriesPage';
 import UsersPage from './views/admin/UsersPage';
 import ProductsPage from './views/admin/ProductsPage';
 import ProvidersPage from './views/admin/ProvidersPage';
 import OrdersPage from './views/admin/OrdersPage';


function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} /> 
            <Route path="/forgot-password" element={<ForgotPasswordView />} />
            <Route path="/reset-password" element={<ResetPasswordView />} />
            <Route path="/perfil" element={<PerfilView />} />
            <Route path="/catalogo" element={<CatalogoView />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<CarritoView />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            
            {/* Rutas de administrador - Protegidas */}
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
            <Route path="/admin/proveedores" element={
              <RequireAdmin>
                <ProvidersPage />
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
