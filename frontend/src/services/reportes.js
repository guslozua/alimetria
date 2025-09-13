import api from './api';

class ReportesService {
  
  // Obtener datos de reporte de paciente
  static async obtenerDatosPaciente(pacienteId, filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta);
      }

      console.log('📊 Obteniendo datos de paciente:', pacienteId, filtros);
      const response = await api.get(`/reportes/paciente/${pacienteId}/datos?${params}`);
      console.log('📋 Datos recibidos en servicio:', response);
      return response; // El interceptor ya devuelve response.data
    } catch (error) {
      console.error('Error al obtener datos del paciente para reporte:', error);
      throw this.handleError(error);
    }
  }

  // Generar y descargar reporte PDF de paciente
  static async descargarReportePaciente(pacienteId, filtros = {}) {
    try {
      console.log('🔄 Iniciando descarga de reporte PDF para paciente:', pacienteId, filtros);
      
      const params = new URLSearchParams();
      
      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.incluirGraficos !== undefined) {
        params.append('incluirGraficos', filtros.incluirGraficos);
      }

      console.log('📡 Realizando petición a:', `/reportes/paciente/${pacienteId}/pdf?${params}`);

      const response = await api.get(`/reportes/paciente/${pacienteId}/pdf?${params}`, {
        responseType: 'blob',
        timeout: 30000  // 30 segundos timeout
      });

      console.log('✅ Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        dataSize: response.data ? response.data.size : 'undefined',
        headers: response.headers
      });

      // Verificar que la respuesta sea un PDF válido
      if (!response.data) {
        throw new Error('No se recibieron datos del servidor');
      }

      // Para blobs, verificamos el size de manera diferente
      const blobSize = response.data.size || 0;
      if (blobSize === 0) {
        throw new Error('El archivo PDF recibido está vacío');
      }

      const blobType = response.data.type || 'unknown';
      if (blobType && !blobType.includes('pdf') && !blobType.includes('octet-stream') && !blobType.includes('application')) {
        console.warn('⚠️ Tipo de archivo inesperado:', blobType);
      }

      // Crear y descargar archivo
      console.log('📄 Creando blob para descarga...');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      console.log('🔗 URL del blob creada:', url);
      
      const link = document.createElement('a');
      link.href = url;
      
      // Extraer nombre del archivo de los headers si está disponible
      let filename = `reporte_paciente_${pacienteId}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      try {
        const contentDisposition = response.headers && response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
          if (filenameMatch) {
            filename = filenameMatch[1];
            console.log('📝 Nombre de archivo extraído de headers:', filename);
          }
        }
      } catch (headerError) {
        console.log('⚠️ No se pudo obtener nombre del archivo de headers, usando nombre por defecto');
      }
      
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      
      console.log('🖱️ Iniciando descarga automática...');
      link.click();
      
      // Limpiar después de un pequeño delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('🧹 Recursos de descarga limpiados');
      }, 100);

      console.log('✅ Descarga de reporte completada exitosamente');
      return { success: true, mensaje: 'Reporte descargado exitosamente' };
      
    } catch (error) {
      console.error('❌ Error al descargar reporte PDF:', error);
      
      // Log más detallado del error
      if (error.response) {
        console.error('📊 Detalles del error de respuesta:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw this.handleError(error);
    }
  }

  // Obtener datos consolidados
  static async obtenerDatosConsolidado(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.consultorioId) {
        params.append('consultorioId', filtros.consultorioId);
      }

      console.log('📊 Obteniendo datos consolidados:', filtros);
      const response = await api.get(`/reportes/consolidado/datos?${params}`);
      console.log('📋 Datos consolidados recibidos en servicio:', response);
      return response; // El interceptor ya devuelve response.data
    } catch (error) {
      console.error('Error al obtener datos consolidados:', error);
      throw this.handleError(error);
    }
  }

  // Obtener estadísticas generales
  static async obtenerEstadisticasGenerales() {
    try {
      const response = await api.get('/reportes/estadisticas/generales');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw this.handleError(error);
    }
  }

  // Descargar reporte consolidado PDF
  static async descargarReporteConsolidado(filtros = {}) {
    try {
      console.log('🔄 Iniciando descarga de reporte consolidado PDF:', filtros);
      
      const params = new URLSearchParams();
      
      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.consultorioId) {
        params.append('consultorioId', filtros.consultorioId);
      }

      console.log('📡 Realizando petición a:', `/reportes/consolidado/pdf?${params}`);

      const response = await api.get(`/reportes/consolidado/pdf?${params}`, {
        responseType: 'blob',
        timeout: 30000  // 30 segundos timeout
      });

      console.log('✅ Respuesta consolidado recibida:', {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        dataSize: response.data ? response.data.size : 'undefined',
        headers: response.headers
      });

      // Verificar que la respuesta sea un PDF válido
      if (!response.data) {
        throw new Error('No se recibieron datos del servidor para reporte consolidado');
      }

      // Para blobs, verificamos el size de manera diferente
      const blobSize = response.data.size || 0;
      if (blobSize === 0) {
        throw new Error('El archivo PDF consolidado recibido está vacío');
      }

      const blobType = response.data.type || 'unknown';
      if (blobType && !blobType.includes('pdf') && !blobType.includes('octet-stream') && !blobType.includes('application')) {
        console.warn('⚠️ Tipo de archivo inesperado en consolidado:', blobType);
      }

      // Crear y descargar archivo
      console.log('📄 Creando blob para descarga consolidado...');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      console.log('🔗 URL del blob consolidado creada:', url);
      
      const link = document.createElement('a');
      link.href = url;
      
      // Extraer nombre del archivo de los headers si está disponible
      let filename = `reporte_consolidado_${new Date().toISOString().split('T')[0]}.pdf`;
      
      try {
        const contentDisposition = response.headers && response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
          if (filenameMatch) {
            filename = filenameMatch[1];
            console.log('📝 Nombre de archivo consolidado extraído de headers:', filename);
          }
        }
      } catch (headerError) {
        console.log('⚠️ No se pudo obtener nombre del archivo consolidado de headers, usando nombre por defecto');
      }
      
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      
      console.log('🖱️ Iniciando descarga automática consolidado...');
      link.click();
      
      // Limpiar después de un pequeño delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('🧹 Recursos de descarga consolidado limpiados');
      }, 100);

      console.log('✅ Descarga de reporte consolidado completada exitosamente');
      return { success: true, mensaje: 'Reporte consolidado descargado exitosamente' };
      
    } catch (error) {
      console.error('❌ Error al descargar reporte consolidado PDF:', error);
      
      // Log más detallado del error
      if (error.response) {
        console.error('📊 Detalles del error de respuesta consolidado:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw this.handleError(error);
    }
  }

  // Validar filtros de fecha
  static validarFiltrosFecha(filtros) {
    const errores = [];

    if (filtros.fechaDesde && filtros.fechaHasta) {
      const desde = new Date(filtros.fechaDesde);
      const hasta = new Date(filtros.fechaHasta);

      if (desde > hasta) {
        errores.push('La fecha de inicio no puede ser mayor a la fecha de fin');
      }

      if (hasta > new Date()) {
        errores.push('La fecha de fin no puede ser mayor a la fecha actual');
      }
    }

    return errores;
  }

  // Formatear datos para gráficos
  static formatearParaGraficos(mediciones, campo) {
    if (!mediciones || mediciones.length === 0) return [];

    return mediciones
      .filter(m => m[campo] !== null && m[campo] !== undefined)
      .map(m => ({
        fecha: new Date(m.fecha_medicion).toLocaleDateString('es-ES'),
        valor: parseFloat(m[campo]),
        fechaOriginal: m.fecha_medicion
      }))
      .sort((a, b) => new Date(a.fechaOriginal) - new Date(b.fechaOriginal));
  }

  // Calcular progreso entre dos valores
  static calcularProgreso(valorInicial, valorFinal) {
    if (!valorInicial || !valorFinal) return null;

    const cambio = valorFinal - valorInicial;
    const porcentaje = (cambio / valorInicial) * 100;

    return {
      cambio: parseFloat(cambio.toFixed(2)),
      porcentaje: parseFloat(porcentaje.toFixed(1)),
      tipo: cambio >= 0 ? 'aumento' : 'disminucion'
    };
  }

  // Obtener interpretación de IMC
  static interpretarIMC(imc) {
    if (!imc) return { categoria: 'No disponible', color: '#grey' };

    if (imc < 18.5) {
      return { categoria: 'Bajo peso', color: '#2196f3', descripcion: 'Por debajo del peso normal' };
    } else if (imc < 25) {
      return { categoria: 'Normal', color: '#4caf50', descripcion: 'Peso saludable' };
    } else if (imc < 30) {
      return { categoria: 'Sobrepeso', color: '#ff9800', descripcion: 'Por encima del peso normal' };
    } else {
      return { categoria: 'Obesidad', color: '#f44336', descripción: 'Peso significativamente elevado' };
    }
  }

  // Manejo de errores
  static handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      return {
        mensaje: error.response.data?.mensaje || 'Error en el servidor',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Error de red
      return {
        mensaje: 'Error de conexión. Verifique su conexión a internet.',
        status: 0,
        data: null
      };
    } else {
      // Error de configuración
      return {
        mensaje: error.message || 'Error desconocido',
        status: -1,
        data: null
      };
    }
  }
}

export default ReportesService;