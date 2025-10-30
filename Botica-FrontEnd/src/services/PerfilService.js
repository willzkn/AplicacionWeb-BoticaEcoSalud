import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/usuarios';

class PerfilService {
  
  /**
   * Obtener perfil del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise} Datos del perfil
   */
  async obtenerPerfil(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}/perfil`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw new Error(error.response?.data || 'Error al obtener el perfil');
    }
  }

  /**
   * Actualizar perfil del usuario
   * @param {number} userId - ID del usuario
   * @param {Object} perfilData - Datos del perfil a actualizar
   * @returns {Promise} Perfil actualizado
   */
  async actualizarPerfil(userId, perfilData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/${userId}/perfil`, perfilData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || 'Error al actualizar el perfil';
      throw new Error(errorMessage);
    }
  }

  /**
   * Cambiar contraseña del usuario (usando endpoint original)
   * @param {number} userId - ID del usuario
   * @param {string} nuevaPassword - Nueva contraseña
   * @returns {Promise} Resultado de la operación
   */
  async cambiarPassword(userId, nuevaPassword) {
    try {
      const response = await axios.put(`${API_BASE_URL}/${userId}/password`, {
        nuevaPass: nuevaPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || 'Error al cambiar la contraseña';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validar imagen antes de subirla
   * @param {File} file - Archivo de imagen
   * @returns {Object} Resultado de la validación
   */
  validarImagen(file) {
    const result = {
      valida: true,
      mensaje: ''
    };

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      result.valida = false;
      result.mensaje = 'El archivo debe ser una imagen válida (JPG, PNG, GIF, WebP)';
      return result;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      result.valida = false;
      result.mensaje = 'La imagen no puede ser mayor a 5MB';
      return result;
    }

    return result;
  }

  /**
   * Convertir archivo a base64
   * @param {File} file - Archivo de imagen
   * @returns {Promise<string>} Imagen en formato base64
   */
  convertirABase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = (error) => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Obtener información de la imagen
   * @param {string} imagenBase64 - Imagen en base64
   * @returns {Object} Información de la imagen
   */
  obtenerInfoImagen(imagenBase64) {
    if (!imagenBase64) {
      return {
        tamaño: 0,
        formato: 'Sin imagen',
        descripcion: 'No hay imagen de perfil'
      };
    }

    try {
      // Extraer información del prefijo data URI
      const matches = imagenBase64.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
      if (!matches) {
        return {
          tamaño: 0,
          formato: 'Desconocido',
          descripcion: 'Formato de imagen no válido'
        };
      }

      const formato = matches[1].toUpperCase();
      const base64Data = matches[2];
      
      // Calcular tamaño aproximado
      const sizeInBytes = (base64Data.length * 3) / 4;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      const sizeInMB = (sizeInKB / 1024).toFixed(2);

      return {
        tamaño: sizeInBytes,
        formato: formato,
        descripcion: sizeInKB > 1024 
          ? `${sizeInMB} MB (${formato})`
          : `${sizeInKB} KB (${formato})`
      };
    } catch (error) {
      return {
        tamaño: 0,
        formato: 'Error',
        descripcion: 'Error al procesar la imagen'
      };
    }
  }

  /**
   * Validar datos del perfil
   * @param {Object} datos - Datos del perfil
   * @returns {Object} Resultado de la validación
   */
  validarDatosPerfil(datos) {
    const errores = {};

    // Validar nombres
    if (!datos.nombres || datos.nombres.trim().length === 0) {
      errores.nombres = 'Los nombres son obligatorios';
    } else if (datos.nombres.trim().length < 2) {
      errores.nombres = 'Los nombres deben tener al menos 2 caracteres';
    } else if (datos.nombres.trim().length > 50) {
      errores.nombres = 'Los nombres no pueden tener más de 50 caracteres';
    }

    // Validar apellidos
    if (!datos.apellidos || datos.apellidos.trim().length === 0) {
      errores.apellidos = 'Los apellidos son obligatorios';
    } else if (datos.apellidos.trim().length < 2) {
      errores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    } else if (datos.apellidos.trim().length > 50) {
      errores.apellidos = 'Los apellidos no pueden tener más de 50 caracteres';
    }

    // Validar teléfono (opcional)
    if (datos.telefono && datos.telefono.trim().length > 0) {
      const telefonoLimpio = datos.telefono.replace(/\D/g, '');
      if (telefonoLimpio.length < 9) {
        errores.telefono = 'El teléfono debe tener al menos 9 dígitos';
      } else if (telefonoLimpio.length > 15) {
        errores.telefono = 'El teléfono no puede tener más de 15 dígitos';
      }
    }

    // Validar dirección (opcional)
    if (datos.direccion && datos.direccion.trim().length > 200) {
      errores.direccion = 'La dirección no puede tener más de 200 caracteres';
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores
    };
  }

  /**
   * Validar contraseña
   * @param {string} password - Contraseña
   * @param {string} confirmPassword - Confirmación de contraseña
   * @returns {Object} Resultado de la validación
   */
  validarPassword(password, confirmPassword) {
    const errores = {};

    if (!password || password.length === 0) {
      errores.nuevaPassword = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      errores.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
    } else if (password.length > 100) {
      errores.nuevaPassword = 'La contraseña no puede tener más de 100 caracteres';
    }

    if (!confirmPassword || confirmPassword.length === 0) {
      errores.confirmarPassword = 'Debes confirmar la contraseña';
    } else if (password !== confirmPassword) {
      errores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores
    };
  }
}

// Exportar una instancia del servicio
const perfilService = new PerfilService();
export default perfilService;