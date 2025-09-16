import api from './api';

// Utilidades para manejo de fechas simplificadas - VERSIÓN CORREGIDA
const DateUtils = {
  /**
   * Formatear fecha para envío al servidor
   * Envía la fecha "tal como es" al servidor para que el backend maneje la conversión
   * @param {Date|string} date - Fecha local del frontend
   * @returns {string} Fecha en formato YYYY-MM-DDTHH:mm:ss (SIN timezone)
   */
  formatForServer: (date) => {
    if (!date) return null;
    
    const fecha = new Date(date);
    
    // Verificar que la fecha sea válida
    if (isNaN(fecha.getTime())) {
      console.error('❌ DateUtils.formatForServer - Fecha inválida:', date);
      return null;
    }
    
    // Obtener componentes de la fecha LOCAL (sin conversiones de timezone)
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    
    const resultado = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    console.log('🔍 DateUtils.formatForServer input:', date, '→ output:', resultado);
    
    return resultado;
  },

  /**
   * Formatear fecha recibida del servidor para el frontend
   * El backend ya envía fechas en timezone argentino, solo crear objeto Date
   * @param {string} dateString - Fecha del servidor
   * @returns {Date} Objeto Date para uso en el frontend
   */
  formatFromServer: (dateString) => {
    if (!dateString) return null;
    
    console.log('🔍 DateUtils.formatFromServer input:', dateString);
    
    // El servidor ya maneja el timezone, simplemente crear Date
    const fecha = new Date(dateString);
    
    if (isNaN(fecha.getTime())) {
      console.error('❌ DateUtils.formatFromServer - Fecha inválida del servidor:', dateString);
      return null;
    }
    
    console.log('🔍 DateUtils.formatFromServer output:', fecha);
    return fecha;
  },

  /**
   * Verificar si una fecha es pasada
   * @param {Date|string} date - Fecha a verificar
   * @returns {boolean} True si es fecha pasada
   */
  isPast: (date) => {
    const ahora = new Date();
    const fechaComparar = new Date(date);
    return fechaComparar < ahora;
  }
};

const citasService = {
  // Utilidades de fecha para uso externo
  DateUtils,

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
      
      // Procesar fechas de las citas recibidas
      if (response.data?.data) {
        response.data.data = response.data.data.map(cita => ({
          ...cita,
          fecha_hora: DateUtils.formatFromServer(cita.fecha_hora),
          es_pasada: DateUtils.isPast(cita.fecha_hora)
        }));
      }
      
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
      
      // Procesar fecha de la cita recibida
      if (response.data?.data) {
        response.data.data.fecha_hora = DateUtils.formatFromServer(response.data.data.fecha_hora);
        response.data.data.es_pasada = DateUtils.isPast(response.data.data.fecha_hora);
      }
      
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
      
      // Procesar fechas de las citas recibidas
      if (response.data?.data) {
        response.data.data = response.data.data.map(cita => ({
          ...cita,
          fecha_hora: DateUtils.formatFromServer(cita.fecha_hora)
        }));
      }
      
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
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/citas/calendario?${params.toString()}`);
      
      // Las fechas del calendario ya vienen procesadas por el backend
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas para calendario:', error);
      throw error;
    }
  },

  // Crear nueva cita
  crearCita: async (citaData) => {
    try {
      // Procesar fecha para envío al servidor
      const datosParaEnviar = {
        ...citaData,
        fecha_hora: DateUtils.formatForServer(citaData.fecha_hora)
      };

      console.log('🔍 CitasService.crearCita - datos originales:', citaData);
      console.log('🔍 CitasService.crearCita - datos para servidor:', datosParaEnviar);

      const response = await api.post('/citas', datosParaEnviar);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  },

  // Actualizar cita existente
  actualizarCita: async (id, citaData) => {
    try {
      // Procesar fecha si se está enviando
      const datosParaEnviar = { ...citaData };
      if (datosParaEnviar.fecha_hora) {
        datosParaEnviar.fecha_hora = DateUtils.formatForServer(datosParaEnviar.fecha_hora);
      }

      console.log('🔍 CitasService.actualizarCita - datos originales:', citaData);
      console.log('🔍 CitasService.actualizarCita - datos para servidor:', datosParaEnviar);

      const response = await api.put(`/citas/${id}`, datosParaEnviar);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  },

  // Verificar disponibilidad de horario
  verificarDisponibilidad: async (nutricionistaId, fechaHora, duracionMinutos, citaId = null) => {
    try {
      const params = new URLSearchParams();
      params.append('nutricionista_id', nutricionistaId);
      params.append('fecha_hora', DateUtils.formatForServer(fechaHora));
      params.append('duracion_minutos', duracionMinutos);

      const endpoint = citaId 
        ? `/citas/${citaId}/disponibilidad?${params.toString()}`
        : `/citas/disponibilidad?${params.toString()}`;

      console.log('🔍 CitasService.verificarDisponibilidad - endpoint:', endpoint);
      console.log('🔍 CitasService.verificarDisponibilidad - fecha original:', fechaHora);
      console.log('🔍 CitasService.verificarDisponibilidad - fecha formateada:', DateUtils.formatForServer(fechaHora));

      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  },

  // Confirmar cita (cambiar estado a 'confirmada')
confirmarCita: async (id) => {
  try {
    console.log('🔍 CitasService.confirmarCita - ID:', id);
    
    const response = await api.put(`/citas/${id}`, {
      estado: 'confirmada'
    });
    
    console.log('✅ CitasService.confirmarCita - respuesta:', response);
    return response;
  } catch (error) {
    console.error('❌ CitasService.confirmarCita - error:', error);
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

  // Marcar cita como completada manualmente
  marcarCompletada: async (id, notasPosteriores = '') => {
    try {
      const response = await api.patch(`/citas/${id}/marcar-completada`, { 
        notas_posteriores: notasPosteriores 
      });
      return response.data;
    } catch (error) {
      console.error('Error al marcar cita como completada:', error);
      throw error;
    }
  },

  // Eliminar cita
  eliminarCita: async (id) => {
    try {
      const response = await api.delete(`/citas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar cita:', error);
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

  // Constantes para tipos de consulta
  TIPOS_CONSULTA: [
    { value: 'primera_vez', label: 'Primera vez' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'control', label: 'Control' },
    { value: 'urgencia', label: 'Urgencia' }
  ],

  // Constantes para estados de cita
  ESTADOS_CITA: [
    { value: 'programada', label: 'Programada', color: '#3788d8' },
    { value: 'confirmada', label: 'Confirmada', color: '#28a745' },
    { value: 'en_curso', label: 'En curso', color: '#ffc107' },
    { value: 'completada', label: 'Completada', color: '#6c757d' },
    { value: 'cancelada', label: 'Cancelada', color: '#dc3545' },
    { value: 'no_asistio', label: 'No asistió', color: '#fd7e14' }
  ],

  // Obtener color por estado
  getColorByEstado: (estado) => {
    const estadoObj = citasService.ESTADOS_CITA.find(e => e.value === estado);
    return estadoObj ? estadoObj.color : '#3788d8';
  },

  // Obtener label por estado
  getLabelByEstado: (estado) => {
    const estadoObj = citasService.ESTADOS_CITA.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  },

  // Obtener color por tipo de consulta
  getColorByTipoConsulta: (tipo) => {
    const colores = {
      'primera_vez': '#1976d2',
      'seguimiento': '#388e3c', 
      'control': '#f57c00',
      'urgencia': '#d32f2f'
    };
    return colores[tipo] || '#1976d2';
  },

  // Obtener label por tipo de consulta
  getLabelByTipoConsulta: (tipo) => {
    const tipoObj = citasService.TIPOS_CONSULTA.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  },

  // Verificar si se puede editar una cita (basado en estado y fecha)
  puedeEditar: (cita) => {
    // No se pueden editar citas canceladas o completadas
    if (['cancelada', 'completada'].includes(cita.estado)) {
      return false;
    }
    
    // Las citas pasadas solo se pueden cambiar de estado
    return true;
  },

  // Verificar si se puede cancelar una cita
  puedeCancelar: (cita) => {
    return !['cancelada', 'completada', 'no_asistio'].includes(cita.estado);
  },

  // Verificar si se puede marcar como completada
  puedeCompletar: (cita) => {
    return !['cancelada', 'completada', 'no_asistio'].includes(cita.estado);
  },

  // Formatear duración en texto legible
  formatearDuracion: (minutos) => {
    if (minutos < 60) {
      return `${minutos} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
    }
  },

  // Formatear fecha para mostrar al usuario
  formatearFecha: (fecha) => {
    if (!fecha) return '';
    
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
    
    return fechaObj.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },

  // Formatear solo la fecha (sin hora)
  formatearSoloFecha: (fecha) => {
    if (!fecha) return '';
    
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
    
    return fechaObj.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  // Formatear solo la hora
  formatearSoloHora: (fecha) => {
    if (!fecha) return '';
    
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
    
    return fechaObj.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
};

export default citasService;