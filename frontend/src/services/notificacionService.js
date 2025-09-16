import api from './api';

class NotificacionService {
  // Obtener mis notificaciones
  static async getMisNotificaciones(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.tipo) queryParams.append('tipo', params.tipo);
      if (params.leidas !== undefined) queryParams.append('leidas', params.leidas.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.todas) queryParams.append('todas', 'true');

      const url = `/notificaciones${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await api.get(url);
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  // Obtener notificación específica
  static async getNotificacion(id) {
    try {
      return await api.get(`/notificaciones/${id}`);
    } catch (error) {
      console.error('Error obteniendo notificación:', error);
      throw error;
    }
  }

  // Contar notificaciones no leídas
  static async contarNoLeidas() {
    try {
      return await api.get('/notificaciones/no-leidas/count');
    } catch (error) {
      console.error('Error contando notificaciones no leídas:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  static async marcarComoLeida(id) {
    try {
      return await api.put(`/notificaciones/${id}/leer`);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  static async marcarTodasComoLeidas() {
    try {
      return await api.put('/notificaciones/todas/leer');
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  // Crear nueva notificación
  static async crear(datosNotificacion) {
    try {
      return await api.post('/notificaciones', datosNotificacion);
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  // Eliminar notificación
  static async eliminar(id) {
    try {
      return await api.delete(`/notificaciones/${id}`);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw error;
    }
  }

  // Crear recordatorio de cita
  static async crearRecordatorioCita(citaId, diasPrevios = 1) {
    try {
      return await api.post('/notificaciones/recordatorio-cita', {
        cita_id: citaId,
        dias_previos: diasPrevios
      });
    } catch (error) {
      console.error('Error creando recordatorio de cita:', error);
      throw error;
    }
  }

  // Formatear fecha de notificación
  static formatearFecha(fecha) {
    if (!fecha) return '';
    
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora - fechaNotif;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHoras / 24);
    
    if (diffMins < 1) {
      return 'Hace un momento';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} minuto${diffMins === 1 ? '' : 's'}`;
    } else if (diffHoras < 24) {
      return `Hace ${diffHoras} hora${diffHoras === 1 ? '' : 's'}`;
    } else if (diffDias < 7) {
      return `Hace ${diffDias} día${diffDias === 1 ? '' : 's'}`;
    } else {
      return fechaNotif.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  // Obtener icono según tipo de notificación
  static getIconoPorTipo(tipo) {
    const iconos = {
      'cita_recordatorio': '📅',
      'medicion_pendiente': '📊',
      'cumpleanos': '🎂',
      'sistema': '⚙️',
      'alerta': '⚠️'
    };
    
    return iconos[tipo] || '🔔';
  }

  // Obtener color según tipo de notificación
  static getColorPorTipo(tipo) {
    const colores = {
      'cita_recordatorio': '#1976d2',
      'medicion_pendiente': '#ed6c02',
      'cumpleanos': '#9c27b0',
      'sistema': '#2e7d32',
      'alerta': '#d32f2f'
    };
    
    return colores[tipo] || '#666';
  }

  // Obtener prioridad según tipo
  static getPrioridadPorTipo(tipo) {
    const prioridades = {
      'alerta': 1,
      'cita_recordatorio': 2,
      'medicion_pendiente': 3,
      'cumpleanos': 4,
      'sistema': 5
    };
    
    return prioridades[tipo] || 3;
  }
}

export default NotificacionService;
