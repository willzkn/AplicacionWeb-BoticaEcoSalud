import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginView from './views/LoginView';
import Inicio from './views/pages/Inicio';
import CatalogoView from './views/CatalogoView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<LoginView />} />
          <Route path="/catalogo" element={<CatalogoView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
