import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { initialLoginState } from '../models/LoginModel';

export default function useLoginController() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState(initialLoginState.username);
  const [password, setPassword] = useState(initialLoginState.password);
  const [searchTerm, setSearchTerm] = useState('');

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!username || !password) {
        alert('Por favor, completa todos los campos');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/usuarios/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: username,
            password: password
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert('❌ Credenciales incorrectas');
            return;
          }
          throw new Error('Error al iniciar sesión');
        }

        const userData = await response.json();
        
        // Guardar usuario en el contexto
        login(userData);
        
        alert(`✅ Bienvenido ${userData.nombres}!`);
        navigate('/');
      } catch (error) {
        console.error(error);
        alert('Error en el servidor');
      }
    },
    [username, password, navigate, login]
  );

  const onSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      const term = e.target.value;
      if (term) {
        alert('Buscando: ' + term);
      }
    }
  }, []);

  return {
    username,
    password,
    searchTerm,
    setUsername,
    setPassword,
    setSearchTerm,
    onSubmit,
    onSearchKeyPress,
  };
}
