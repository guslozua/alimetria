import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

// Estado inicial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Tipos de acciones
const actionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para hacer login
  const login = async (email, password) => {
    try {
      dispatch({ type: actionTypes.LOGIN_START });

      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { user, token } = response.data;

      // Normalizar datos del usuario
      const normalizedUser = {
        ...user,
        // Asegurar que rol_nombre esté disponible
        rol_nombre: user.rol_nombre || (user.email === 'admin@alimetria.com' ? 'administrador' : 'paciente')
      };

      console.log('Usuario después del login:', normalizedUser);

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      dispatch({
        type: actionTypes.LOGIN_SUCCESS,
        payload: { user: normalizedUser, token }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      dispatch({
        type: actionTypes.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Función para hacer logout
  const logout = async () => {
    try {
      // Intentar logout en el servidor
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Error en logout del servidor:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      dispatch({ type: actionTypes.LOGOUT });
    }
  };

  // Función para verificar token
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify');
      const { user } = response.data;
      
      // Normalizar usuario al verificar token
      const normalizedUser = {
        ...user,
        rol_nombre: user.rol_nombre || (user.email === 'admin@alimetria.com' ? 'administrador' : 'paciente')
      };
      
      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      dispatch({
        type: actionTypes.UPDATE_USER,
        payload: normalizedUser
      });
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const { user } = response.data;
      
      // Normalizar usuario actualizado
      const normalizedUser = {
        ...user,
        rol_nombre: user.rol_nombre || state.user?.rol_nombre || 'paciente'
      };
      
      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      dispatch({
        type: actionTypes.UPDATE_USER,
        payload: normalizedUser
      });
      
      return { success: true, user: normalizedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error actualizando perfil';
      return { success: false, error: errorMessage };
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error cambiando contraseña';
      return { success: false, error: errorMessage };
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  // Verificar si hay token guardado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          const user = JSON.parse(savedUser);
          
          // Normalizar usuario guardado
          const normalizedUser = {
            ...user,
            rol_nombre: user.rol_nombre || (user.email === 'admin@alimetria.com' ? 'administrador' : 'paciente')
          };
          
          dispatch({
            type: actionTypes.LOGIN_SUCCESS,
            payload: { user: normalizedUser, token: savedToken }
          });

          // Verificar que el token siga siendo válido
          await verifyToken();
        } catch (error) {
          console.log('Error verificando token guardado:', error);
          logout();
        }
      } else {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Funciones helper para verificar roles y permisos
  const hasRole = (role) => {
    if (!state.user) {
      return false;
    }

    // Fallback múltiple para detectar admin
    if (role === 'administrador') {
      // Método 1: Verificar rol_nombre directo
      if (state.user?.rol_nombre === 'administrador') {
        return true;
      }
      
      // Método 2: Verificar por email (admin principal)
      if (state.user?.email === 'admin@alimetria.com') {
        return true;
      }
      
      // Método 3: Verificar por permisos si rol_nombre no está disponible
      if (state.user?.permisos) {
        try {
          const permisos = typeof state.user.permisos === 'string' 
            ? JSON.parse(state.user.permisos) 
            : state.user.permisos;
          
          if (permisos?.usuarios?.includes('eliminar')) {
            return true;
          }
        } catch (error) {
          console.log('Error parseando permisos:', error);
        }
      }
      
      // Método 4: Verificar por nombre (fallback)
      if (state.user?.nombre === 'Administrador' && state.user?.apellido === 'Sistema') {
        return true;
      }
    }
    
    // Verificación normal para otros roles
    return state.user?.rol_nombre === role;
  };

  const hasPermission = (module, action) => {
    if (!state.user?.permisos) return false;
    
    try {
      const permisos = typeof state.user.permisos === 'string' 
        ? JSON.parse(state.user.permisos) 
        : state.user.permisos;
      
      return permisos[module]?.includes(action) || false;
    } catch (error) {
      console.log('Error parseando permisos:', error);
      return false;
    }
  };

  const isAdmin = () => {
    return hasRole('administrador');
  };
  
  const isNutricionista = () => hasRole('nutricionista');
  const isSecretario = () => hasRole('secretario');
  const isPaciente = () => hasRole('paciente');

  const value = {
    // Estado
    ...state,
    
    // Acciones
    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
    verifyToken,
    
    // Helpers
    hasRole,
    hasPermission,
    isAdmin,
    isNutricionista,
    isSecretario,
    isPaciente
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
