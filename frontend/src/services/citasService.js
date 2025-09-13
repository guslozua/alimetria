import api from './api';

const citasService = {
  // Obtener todas las citas con filtros
  getCitas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/citas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  },

  // Obtener cita por ID
  getCitaPorId: async (id) => {
    try {
      const response = await api.get(`/citas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cita:', error);
      throw error;
    }
  },

  // Obtener próximas citas (para dashboard)
  getProximasCitas: async (nutricionistaId, limit = 5) => {
    try {
      const params = new URLSearchParams();
      if (nutricionistaId) params.append('nutricionista_id', nutricionistaId);
      if (limit) params.append('limit', limit);

      const response = await api.get(`/citas/proximas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener próximas citas:', error);
      throw error;
    }
  },

  // Obtener citas para calendario (formato FullCalendar)
  getCitasParaCalendario: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      // FullCalendar envía start y end automáticamente
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/citas/calendario?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas para calendario:', error);
      throw error;
    }
  },

  // Verificar disponibilidad de horario
  verificarDisponibilidad: async (nutricionistaId, fechaHora, duracionMinutos = 60, citaId = null) => {
    try {
      const params = new URLSearchParams({
        nutricionista_id: nutricionistaId,
        fecha_hora: fechaHora,
        duracion_minutos: duracionMinutos
      });

      const url = citaId 
        ? `/citas/${citaId}/disponibilidad?${params.toString()}`
        : `/citas/disponibilidad?${params.toString()}`;

      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  },

  // Crear nueva cita
  crearCita: async (citaData) => {
    try {
      const response = await api.post('/citas', citaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  },

  // Actualizar cita existente
  actualizarCita: async (id, citaData) => {
    try {
      const response = await api.put(`/citas/${id}`, citaData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  },

  // Cancelar cita
  cancelarCita: async (id, motivo = '') => {
    try {
      const response = await api.patch(`/citas/${id}/cancelar`, { motivo });
      return response.data;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  },

  // Completar cita
  completarCita: async (id, notasPosteriores = '') => {
    try {
      const response = await api.patch(`/citas/${id}/completar`, { 
        notas_posteriores: notasPosteriores 
      });
      return response.data;
    } catch (error) {
      console.error('Error al completar cita:', error);
      throw error;
    }
  },

  // Confirmar cita
  confirmarCita: async (id) => {
    try {
      const response = await api.put(`/citas/${id}`, { estado: 'confirmada' });
      return response.data;
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      throw error;
    }
  },

  // Obtener estadísticas de citas
  getEstadisticas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/citas/estadisticas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // Eliminar cita (solo administradores)
  eliminarCita: async (id) => {
    try {
      const response = await api.delete(`/citas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      throw error;
    }
  },

  // Constantes para el frontend
  TIPOS_CONSULTA: [
    { value: 'primera_vez', label: 'Primera Vez' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'control', label: 'Control' },
    { value: 'urgencia', label: 'Urgencia' }
  ],

  ESTADOS_CITA: [
    { value: 'programada', label: 'Programada', color: '#3788d8' },
    { value: 'confirmada', label: 'Confirmada', color: '#28a745' },
    { value: 'en_curso', label: 'En Curso', color: '#ffc107' },
    { value: 'completada', label: 'Completada', color: '#6c757d' },
    { value: 'cancelada', label: 'Cancelada', color: '#dc3545' },
    { value: 'no_asistio', label: 'No Asistió', color: '#fd7e14' }
  ],

  // Utilidades
  getColorByEstado: (estado) => {
    const estadoObj = citasService.ESTADOS_CITA.find(e => e.value === estado);
    return estadoObj ? estadoObj.color : '#3788d8';
  },

  getLabelByEstado: (estado) => {
    const estadoObj = citasService.ESTADOS_CITA.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  },

  getLabelByTipoConsulta: (tipo) => {
    const tipoObj = citasService.TIPOS_CONSULTA.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }
};

export default citasService;
