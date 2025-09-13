import api from './api';

const API_BASE_URL = '/pacientes';

// Servicio para gestión de pacientes
class PacienteService {
  // Obtener todos los pacientes con filtros y paginación
  static async getAll(params = {}) {
    try {
      const response = await api.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener paciente por ID
  static async getById(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Crear nuevo paciente
  static async create(pacienteData) {
    try {
      const response = await api.post(API_BASE_URL, pacienteData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar paciente
  static async update(id, pacienteData) {
    try {
      const response = await api.put(`${API_BASE_URL}/${id}`, pacienteData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Eliminar paciente
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

  // Obtener mediciones del paciente
  static async getMediciones(id, limit = null) {
    try {
      const params = limit ? { limit } : {};
      const response = await api.get(`${API_BASE_URL}/${id}/mediciones`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener estadísticas del paciente
  static async getEstadisticas(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/${id}/estadisticas`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener fotos del paciente
  static async getFotos(id, limit = null) {
    try {
      const params = limit ? { limit } : {};
      const response = await api.get(`${API_BASE_URL}/${id}/fotos`, { params });
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

export default PacienteService;
