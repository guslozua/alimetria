import api from './api';

export const pacientesService = {
  // Obtener todos los pacientes
  getPacientes: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    return await api.get(`/pacientes?${params}`);
  },

  // Obtener un paciente específico
  getPaciente: async (id) => {
    return await api.get(`/pacientes/${id}`);
  },

  // Crear nuevo paciente
  crearPaciente: async (pacienteData) => {
    return await api.post('/pacientes', pacienteData);
  },

  // Actualizar paciente
  actualizarPaciente: async (id, pacienteData) => {
    return await api.put(`/pacientes/${id}`, pacienteData);
  },

  // Eliminar paciente
  eliminarPaciente: async (id) => {
    return await api.delete(`/pacientes/${id}`);
  },

  // Buscar pacientes
  buscarPacientes: async (termino) => {
    return await api.get(`/pacientes/buscar?q=${encodeURIComponent(termino)}`);
  },

  // Subir foto de perfil
  subirFotoPerfil: async (id, fotoFile) => {
    const formData = new FormData();
    formData.append('foto', fotoFile);
    
    return await api.post(`/pacientes/${id}/foto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Obtener estadísticas del paciente
  getEstadisticas: async (id) => {
    return await api.get(`/pacientes/${id}/estadisticas`);
  }
};
