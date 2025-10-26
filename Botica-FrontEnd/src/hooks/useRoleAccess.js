import { useAuth } from '../controllers/AuthContext';

/**
 * Hook personalizado para verificar permisos de acceso basados en roles
 */
export const useRoleAccess = () => {
  const { user, isAuthenticated } = useAuth();

  /**
   * Verifica si el usuario tiene uno de los roles especificados
   * @param {string|string[]} allowedRoles - Rol o array de roles permitidos
   * @returns {boolean} - true si el usuario tiene acceso, false en caso contrario
   */
  const hasRole = (allowedRoles) => {
    if (!isAuthenticated() || !user) {
      return false;
    }

    const userRole = user.rol || user.role;
    if (!userRole) {
      return false;
    }

    // Si allowedRoles es un string, convertirlo a array
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return rolesArray.includes(userRole);
  };

  /**
   * Verifica si el usuario es administrador
   * @returns {boolean}
   */
  const isAdmin = () => {
    return hasRole(['ADMIN', 'admin']);
  };

  /**
   * Verifica si el usuario es cliente
   * @returns {boolean}
   */
  const isClient = () => {
    return hasRole(['CLIENT', 'client', 'CLIENTE', 'cliente']);
  };

  /**
   * Obtiene el rol actual del usuario
   * @returns {string|null}
   */
  const getCurrentRole = () => {
    if (!isAuthenticated() || !user) {
      return null;
    }
    return user.rol || user.role || null;
  };

  /**
   * Verifica si el usuario puede acceder a rutas de administrador
   * @returns {boolean}
   */
  const canAccessAdmin = () => {
    return isAdmin();
  };

  return {
    hasRole,
    isAdmin,
    isClient,
    getCurrentRole,
    canAccessAdmin,
    user,
    isAuthenticated: isAuthenticated()
  };
};