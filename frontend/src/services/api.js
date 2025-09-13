import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    console.log('🔍 API Request:', config.method.toUpperCase(), config.url, config.baseURL + config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✓ API Response:', response.status, response.config.url);
    console.log('🔍 Response details:', {
      responseType: response.config.responseType,
      hasData: !!response.data,
      dataType: typeof response.data,
      dataContent: response.config.responseType !== 'blob' ? response.data : '[BLOB]'
    });
    
    // Para respuestas blob (PDFs), devolver el objeto response completo
    if (response.config.responseType === 'blob') {
      console.log('🔍 Blob response detected, returning full response object');
      return response;
    }
    
    // Para otras respuestas, devolver solo los datos
    console.log('🔍 JSON response detected, returning response.data:', response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', error.message, error.response?.status, error.response?.data);
    
    // Si el token ha expirado o es inválido, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Para otros errores, propagar el error con información útil
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    const errorData = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    };
    
    return Promise.reject(errorData);
  }
);

export default api;
