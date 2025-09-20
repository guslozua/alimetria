import api from './api';

export const usuarioService = {
  // Obtener todos los usuarios con filtros
  obtenerUsuarios: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });
    
    const response = await api.get(`/usuarios?${params.toString()}`);
    return response;
  },

  // Obtener usuario por ID
  obtenerUsuario: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response;
  },

  // Crear nuevo usuario
  crearUsuario: async (datosUsuario) => {
    const response = await api.post('/usuarios', datosUsuario);
    return response;
  },

  // Actualizar usuario
  actualizarUsuario: async (id, datosUsuario) => {
    const response = await api.put(`/usuarios/${id}`, datosUsuario);
    return response;
  },

  // Cambiar contraseña
  cambiarPassword: async (id, passwords) => {
    const response = await api.put(`/usuarios/${id}/password`, passwords);
    return response;
  },

  // Resetear contraseña (solo admin)
  resetearPassword: async (id, nuevaPassword) => {
    const response = await api.put(`/usuarios/${id}/reset-password`, { password_nueva: nuevaPassword });
    return response;
  },

  // Activar/desactivar usuario
  toggleUsuario: async (id) => {
    const response = await api.patch(`/usuarios/${id}/toggle`);
    return response;
  },

  // Obtener estadísticas
  obtenerEstadisticas: async () => {
    const response = await api.get('/usuarios/estadisticas');
    return response;
  },

  // Eliminar usuario
  eliminarUsuario: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response;
  }
};

export const rolService = {
  // Obtener todos los roles
  obtenerRoles: async (incluirPermisos = true) => {
    const response = await api.get(`/roles?incluir_permisos=${incluirPermisos}`);
    return response;
  },

  // Obtener rol por ID
  obtenerRol: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response;
  },

  // Crear nuevo rol
  crearRol: async (datosRol) => {
    const response = await api.post('/roles', datosRol);
    return response;
  },

  // Actualizar rol
  actualizarRol: async (id, datosRol) => {
    const response = await api.put(`/roles/${id}`, datosRol);
    return response;
  },

  // Activar/desactivar rol
  toggleRol: async (id) => {
    const response = await api.patch(`/roles/${id}/toggle`);
    return response;
  },

  // Eliminar rol
  eliminarRol: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response;
  },

  // Obtener permisos disponibles
  obtenerPermisosDisponibles: async () => {
    const response = await api.get('/roles/permisos');
    return response;
  },

  // Obtener estadísticas de roles
  obtenerEstadisticas: async () => {
    const response = await api.get('/roles/estadisticas');
    return response;
  }
};

export const configuracionService = {
  // Obtener configuraciones públicas (sin auth)
  obtenerConfiguracionesPublicas: async () => {
    const response = await api.get('/configuraciones/publicas');
    return response;
  },

  // Obtener todas las configuraciones
  obtenerConfiguraciones: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });
    
    const response = await api.get(`/configuraciones?${params.toString()}`);
    return response;
  },

  // Obtener configuración específica
  obtenerConfiguracion: async (clave) => {
    const response = await api.get(`/configuraciones/${clave}`);
    return response;
  },

  // Crear nueva configuración
  crearConfiguracion: async (configuracion) => {
    const response = await api.post('/configuraciones', configuracion);
    return response;
  },

  // Actualizar configuración
  actualizarConfiguracion: async (clave, configuracion) => {
    const response = await api.put(`/configuraciones/${clave}`, configuracion);
    return response;
  },

  // Actualizar múltiples configuraciones
  actualizarMultiples: async (configuraciones) => {
    const response = await api.put('/configuraciones/multiples', { configuraciones });
    return response;
  },

  // Eliminar configuración
  eliminarConfiguracion: async (clave) => {
    const response = await api.delete(`/configuraciones/${clave}`);
    return response;
  },

  // Obtener categorías
  obtenerCategorias: async () => {
    const response = await api.get('/configuraciones/categorias');
    return response;
  },

  // Probar configuración de email
  probarEmail: async (emailDestino) => {
    const response = await api.post('/configuraciones/probar-email', {
      email_destino: emailDestino
    });
    return response;
  }
};

export const consultorioService = {
  // Obtener todos los consultorios
  obtenerConsultorios: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });
    
    const response = await api.get(`/consultorios?${params.toString()}`);
    return response;
  },

  // Obtener consultorio por ID
  obtenerConsultorio: async (id) => {
    const response = await api.get(`/consultorios/${id}`);
    return response;
  },

  // Crear nuevo consultorio
  crearConsultorio: async (datosConsultorio) => {
    const response = await api.post('/consultorios', datosConsultorio);
    return response;
  },

  // Actualizar consultorio
  actualizarConsultorio: async (id, datosConsultorio) => {
    const response = await api.put(`/consultorios/${id}`, datosConsultorio);
    return response;
  },

  // Activar/desactivar consultorio
  toggleConsultorio: async (id) => {
    const response = await api.patch(`/consultorios/${id}/toggle`);
    return response;
  },

  // Obtener usuarios del consultorio
  obtenerUsuarios: async (id) => {
    const response = await api.get(`/consultorios/${id}/usuarios`);
    return response;
  },

  // Obtener estadísticas
  obtenerEstadisticas: async () => {
    const response = await api.get('/consultorios/estadisticas');
    return response;
  }
};
