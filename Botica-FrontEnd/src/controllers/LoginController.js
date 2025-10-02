import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialLoginState } from '../models/LoginModel';

export default function useLoginController() {
  const navigate = useNavigate();
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
            email: username,   // 👈 tu backend espera "email"
            password: password // 👈 y "password"
          }),
        });

        if (!response.ok) {
          throw new Error('Error al iniciar sesión');
        }

        const data = await response.json(); // en tu backend retorna Boolean
        if (data === true) {
          alert('✅ Inicio de sesión exitoso');
          // Redirigir a la página de inicio
          navigate('/');
        } else {
          alert('❌ Credenciales incorrectas');
        }
      } catch (error) {
        console.error(error);
        alert('Error en el servidor');
      }
    },
    [username, password, navigate]
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
