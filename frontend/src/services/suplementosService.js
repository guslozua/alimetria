import api from './api';

const suplementosService = {
  // Listar suplementos con filtros
  async listar(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros solo si tienen valor
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
          params.append(key, filtros[key]);
        }
      });

      console.log('🔍 Listando suplementos con filtros:', filtros);
      const response = await api.get(`/suplementos?${params.toString()}`);
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Error al obtener suplementos');
      }
    } catch (error) {
      console.error('❌ Error al listar suplementos:', error);
      throw error;
    }
  },

  // Obtener detalle completo de un suplemento
  async obtenerDetalle(id) {
    try {
      console.log('🔍 Obteniendo detalle del suplemento:', id);
      const response = await api.get(`/suplementos/${id}`);
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Error al obtener detalle del suplemento');
      }
    } catch (error) {
      console.error('❌ Error al obtener detalle del suplemento:', error);
      throw error;
    }
  },

  // Listar categorías de suplementos
  async listarCategorias() {
    try {
      console.log('🔍 Obteniendo categorías de suplementos');
      const response = await api.get('/suplementos/categorias');
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Error al obtener categorías');
      }
    } catch (error) {
      console.error('❌ Error al listar categorías:', error);
      throw error;
    }
  },

  // Búsqueda inteligente
  async busquedaInteligente(query) {
    try {
      if (!query || query.length < 3) {
        return { success: true, data: [] };
      }

      console.log('🔍 Búsqueda inteligente:', query);
      const response = await api.get(`/suplementos/busqueda-inteligente?q=${encodeURIComponent(query)}`);
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Error en búsqueda');
      }
    } catch (error) {
      console.error('❌ Error en búsqueda inteligente:', error);
      throw error;
    }
  },

  // Dashboard/estadísticas
  async dashboard() {
    try {
      console.log('🔍 Obteniendo dashboard de suplementos');
      const response = await api.get('/suplementos/dashboard');
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Error al obtener dashboard');
      }
    } catch (error) {
      console.error('❌ Error al obtener dashboard:', error);
      throw error;
    }
  },

  // Funciones utilitarias
  obtenerIconoCategoria(categoria) {
    const iconos = {
      'Vitaminas': '🌈',
      'Minerales': '⚡',
      'Proteínas': '🥩',
      'Ácidos Grasos': '🐟',
      'Probióticos': '💚',
      'Articular': '🦴',
      'Deportivos': '💪',
      'Antioxidantes': '🛡️'
    };
    return iconos[categoria] || '💊';
  },

  obtenerColorEvidencia(nivel) {
    const colores = {
      'alta': '#10b981',      // Verde
      'media': '#f59e0b',     // Amarillo
      'baja': '#ef4444',      // Rojo
      'experimental': '#8b5cf6' // Púrpura
    };
    return colores[nivel] || '#6b7280';
  },

  obtenerIconoFormaPresentacion(forma) {
    const iconos = {
      'cápsula': '💊',
      'tableta': '⚪',
      'polvo': '🥄',
      'líquido': '🧪',
      'goma': '🍬',
      'inyectable': '💉',
      'tópico': '🧴'
    };
    return iconos[forma] || '💊';
  },

  formatearPopularidad(popularidad) {
    if (popularidad >= 1000) {
      return `${(popularidad / 1000).toFixed(1)}k`;
    }
    return popularidad.toString();
  }
};

export default suplementosService;
