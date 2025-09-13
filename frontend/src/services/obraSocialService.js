import api from './api';

const API_BASE_URL = '/obras-sociales';

// Servicio para gestión de obras sociales
class ObraSocialService {
  // Obtener todas las obras sociales con filtros y paginación
  static async getAll(params = {}) {
    try {
      const response = await api.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener listado simple para selects (sin paginación)
  static async getSimple() {
    try {
      const response = await api.get(API_BASE_URL, { 
        params: { simple: 'true' } 
      });
      return response.data;
    } catch (error) {
      console.error('Error cargando obras sociales:', error);
      throw this.handleError(error);
    }
  }

  // Obtener obra social por ID
  static async getById(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Crear nueva obra social
  static async create(obraSocialData) {
    try {
      const response = await api.post(API_BASE_URL, obraSocialData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar obra social
  static async update(id, obraSocialData) {
    try {
      const response = await api.put(`${API_BASE_URL}/${id}`, obraSocialData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Eliminar obra social
  static async delete(id) {
    try {
      const response = await api.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Búsqueda rápida
  static async search(query) {
    try {
      const response = await api.get(`${API_BASE_URL}/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener pacientes de una obra social
  static async getPacientes(id, limit = null) {
    try {
      const params = limit ? { limit } : {};
      const response = await api.get(`${API_BASE_URL}/${id}/pacientes`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener estadísticas de una obra social
  static async getEstadisticas(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/${id}/estadisticas`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Manejo de errores
  static handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      return {
        message: error.response.data.message || 'Error del servidor',
        status: error.response.status,
        errors: error.response.data.errors || []
      };
    } else if (error.request) {
      // Error de red
      return {
        message: 'Error de conexión con el servidor',
        status: 0
      };
    } else {
      // Error de configuración
      return {
        message: 'Error inesperado',
        status: 0
      };
    }
  }
}

export default ObraSocialService;
