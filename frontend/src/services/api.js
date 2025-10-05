import axios from 'axios';

// Configuración de la URL base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Extraer la URL del servidor sin /api para archivos estáticos
export const getServerBaseUrl = () => {
  return API_URL.replace('/api', '');
};

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log detallado de cada petición
    console.log('🔍 API Request:', config.method.toUpperCase(), config.url, config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('✓ API Response:', response.status, response.config.url);
    console.log('🔍 Response details:', {
      responseType: response.headers['content-type'],
      hasData: !!response.data,
      dataType: typeof response.data,
      dataContent: response.data
    });
    
    // Si la respuesta es JSON y tiene la estructura {success, data}
    if (response.data && typeof response.data === 'object') {
      console.log('🔍 JSON response detected, returning response.data:', response.data);
      return response.data;
    }
    
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error);
    
    if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      console.error(`HTTP ${status}:`, message);
      
      // Manejar errores específicos
      if (status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject({
        status,
        message,
        data: error.response.data
      });
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('No response from server:', error.request);
      return Promise.reject({
        status: 0,
        message: 'No se pudo conectar con el servidor',
        data: null
      });
    } else {
      // Error al configurar la petición
      console.error('Request setup error:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message,
        data: null
      });
    }
  }
);

export default api;
export { API_URL };
