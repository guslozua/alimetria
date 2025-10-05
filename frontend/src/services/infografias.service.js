import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Obtener todas las infografías con filtros
export const obtenerInfografias = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.limite) params.append('limite', filtros.limite);
    if (filtros.offset) params.append('offset', filtros.offset);
    if (filtros.incluir_inactivas) params.append('incluir_inactivas', 'true');
    
    const response = await axios.get(`${API_URL}/infografias?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener infografías:', error);
    throw error;
  }
};

// Obtener una infografía por ID
export const obtenerInfografiaPorId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/infografias/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener infografía:', error);
    throw error;
  }
};

// Crear nueva infografía
export const crearInfografia = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/infografias`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear infografía:', error);
    throw error;
  }
};

// Actualizar infografía
export const actualizarInfografia = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Actualizando infografía:', id, data);
    console.log('Token:', token ? 'Presente' : 'Ausente');
    
    const response = await axios.put(`${API_URL}/infografias/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar infografía:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Eliminar infografía
export const eliminarInfografia = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/infografias/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar infografía:', error);
    throw error;
  }
};

// Descargar infografía
export const descargarInfografia = async (id, nombreArchivo) => {
  try {
    const response = await axios.get(`${API_URL}/infografias/${id}/descargar`, {
      responseType: 'blob'
    });
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    console.error('Error al descargar infografía:', error);
    throw error;
  }
};

// Obtener categorías
export const obtenerCategorias = async () => {
  try {
    const response = await axios.get(`${API_URL}/infografias/categorias`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

// Obtener estadísticas
export const obtenerEstadisticas = async () => {
  try {
    const response = await axios.get(`${API_URL}/infografias/estadisticas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};
