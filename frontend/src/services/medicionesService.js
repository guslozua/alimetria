import api from './api';

export const medicionesService = {
  // Obtener mediciones de un paciente
  getMedicionesPorPaciente: async (pacienteId, limit = null) => {
    const params = limit ? { limit } : {};
    return await api.get(`/mediciones/paciente/${pacienteId}`, { params });
  },

  // Validar imagen InBody antes de subir
  validarImagenInBody: (file) => {
    const errores = [];
    
    // Validar que sea un archivo
    if (!file) {
      errores.push('No se seleccionó ningún archivo');
      return { esValido: false, errores };
    }
    
    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errores.push('El archivo es demasiado grande. Máximo 10MB.');
    }
    
    // Validar tipo de archivo
    const tiposPermitidos = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/bmp',
      'image/tiff',
      'application/pdf'
    ];
    
    if (!tiposPermitidos.includes(file.type)) {
      errores.push('Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, BMP, TIFF, PDF');
    }
    
    // Validar nombre del archivo
    const nombreValido = /^[a-zA-Z0-9._-]+$/.test(file.name);
    if (!nombreValido) {
      errores.push('El nombre del archivo contiene caracteres no válidos');
    }
    
    return {
      esValido: errores.length === 0,
      errores
    };
  },

  // Obtener una medición específica
  getMedicion: async (medicionId) => {
    return await api.get(`/mediciones/${medicionId}`);
  },

  // Crear nueva medición
  crearMedicion: async (medicionData) => {
    return await api.post('/mediciones', medicionData);
  },

  // Actualizar medición
  actualizarMedicion: async (medicionId, medicionData) => {
    return await api.put(`/mediciones/${medicionId}`, medicionData);
  },

  // Eliminar medición
  eliminarMedicion: async (medicionId) => {
    return await api.delete(`/mediciones/${medicionId}`);
  },

  // ===== MÉTODOS OCR INBODY =====

  // Procesar imagen InBody con OCR (MÉTODO ACTUALIZADO)
  procesarImagenInBody: async (file, pacienteId) => {
    const formData = new FormData();
    formData.append('inbody_file', file); // Nombre correcto del campo
    formData.append('paciente_id', pacienteId); // Nombre correcto del campo

    return await api.post('/mediciones/inbody', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Vista previa de OCR sin guardar (NUEVO MÉTODO)
  previsualizarInBody: async (file) => {
    const formData = new FormData();
    formData.append('inbody_file', file);

    return await api.post('/mediciones/inbody/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Crear medición desde datos OCR
  crearMedicionDesdeOCR: async (medicionData) => {
    return await api.post('/mediciones/ocr/crear', { medicionData });
  },

  // Reprocesar imagen existente
  reprocesarImagenOCR: async (filename, pacienteId) => {
    return await api.post('/mediciones/ocr/reprocesar', { filename, pacienteId });
  },

  // Obtener texto OCR sin procesar
  obtenerTextoOCR: async (filename) => {
    return await api.get(`/mediciones/ocr/texto/${filename}`);
  },

  // Validar imagen antes de procesar
  validarImagenInBody: (file) => {
    const errores = [];
    
    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      errores.push('Tipo de archivo no válido. Use JPEG, PNG, BMP o PDF');
    }
    
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errores.push('El archivo es demasiado grande. Máximo 10MB');
    }
    
    // Validar nombre de archivo
    if (!file.name || file.name.length === 0) {
      errores.push('El archivo debe tener un nombre válido');
    }
    
    return {
      esValido: errores.length === 0,
      errores
    };
  },

  // Mapear datos OCR a formato de formulario
  mapearDatosOCR: (responseData) => {
    console.log('🔍 mapearDatosOCR - entrada:', responseData);
    
    // La respuesta del backend tiene esta estructura:
    // { medicion: {...}, confianza: number, archivo_original: string }
    
    const medicion = responseData.medicion || {};
    const confianza = responseData.confianza || 0;
    
    console.log('🔍 mapearDatosOCR - medicion extraida:', medicion);
    console.log('🔍 mapearDatosOCR - confianza:', confianza);
    
    const result = {
      // Campos principales desde la medición creada
      peso: medicion.peso || '',
      altura: medicion.altura || '',
      imc: medicion.imc || '',
      grasa_corporal: medicion.grasa_corporal || '',
      grasa_corporal_kg: medicion.grasa_corporal_kg || '',
      musculo: medicion.musculo || '',
      puntuacion_corporal: medicion.puntuacion_corporal || '',
      
      // Fecha y hora
      fecha_medicion: medicion.fecha_medicion || new Date().toISOString().slice(0, 16),
      
      // Metadatos
      tipo: 'inbody',
      confianza_ocr: Math.round(confianza),
      
      // Observaciones
      observaciones: medicion.observaciones || `Medición automática InBody H30 (Confianza: ${Math.round(confianza)}%)`
    };
    
    console.log('🔍 mapearDatosOCR - resultado final:', result);
    return result;
  },

  // Generar observaciones automáticas desde OCR
  generarObservacionesOCR: (ocrData) => {
    const observaciones = [`Medición automática InBody H30 (Confianza: ${Math.round(ocrData.confianza_ocr || 0)}%)`];
    
    // Agregar cambios detectados
    const cambios = [];
    if (ocrData.cambio_peso) cambios.push(`Peso: ${ocrData.cambio_peso > 0 ? '+' : ''}${ocrData.cambio_peso}kg`);
    if (ocrData.cambio_masa_muscular) cambios.push(`Músculo: ${ocrData.cambio_masa_muscular > 0 ? '+' : ''}${ocrData.cambio_masa_muscular}kg`);
    if (ocrData.cambio_grasa_corporal) cambios.push(`Grasa: ${ocrData.cambio_grasa_corporal > 0 ? '+' : ''}${ocrData.cambio_grasa_corporal}kg`);
    if (ocrData.cambio_imc) cambios.push(`IMC: ${ocrData.cambio_imc > 0 ? '+' : ''}${ocrData.cambio_imc}`);
    
    if (cambios.length > 0) {
      observaciones.push(`Cambios respecto a medición anterior: ${cambios.join(', ')}`);
    }
    
    if (ocrData.percentil) {
      observaciones.push(`Percentil: ${ocrData.percentil}%`);
    }
    
    return observaciones.join('\n');
  },

  // ===== MÉTODOS EXISTENTES =====

  // Obtener estadísticas de evolución
  getEstadisticas: async (pacienteId, fechaInicio = null, fechaFin = null) => {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    
    return await api.get(`/mediciones/paciente/${pacienteId}/estadisticas`, { params });
  },

  // Obtener datos para gráficos de evolución
  getDatosEvolucion: async (pacienteId, campo = 'peso', limite = 10) => {
    const params = { campo, limite };
    return await api.get(`/mediciones/paciente/${pacienteId}/evolucion`, { params });
  },

  // Obtener historial de versiones
  getHistorialVersiones: async (medicionId) => {
    return await api.get(`/mediciones/${medicionId}/historial`);
  },

  // Calcular IMC
  calcularIMC: (peso, altura) => {
    if (!peso || !altura || altura === 0) return null;
    
    // Convertir altura de cm a metros si es necesario
    const alturaMetros = altura > 10 ? altura / 100 : altura;
    return parseFloat((peso / (alturaMetros * alturaMetros)).toFixed(2));
  },

  // Obtener categoría de IMC
  getCategoriaIMC: (imc) => {
    if (!imc) return { categoria: '', color: 'default' };
    
    if (imc < 18.5) return { categoria: 'Bajo peso', color: 'info' };
    if (imc < 25) return { categoria: 'Normal', color: 'success' };
    if (imc < 30) return { categoria: 'Sobrepeso', color: 'warning' };
    return { categoria: 'Obesidad', color: 'error' };
  },

  // Validar datos de medición
  validarMedicion: (datos) => {
    const errores = [];

    if (!datos.paciente_id) {
      errores.push('El paciente es requerido');
    }

    if (!datos.fecha_medicion) {
      errores.push('La fecha de medición es requerida');
    }

    if (datos.peso && (datos.peso <= 0 || datos.peso > 500)) {
      errores.push('El peso debe estar entre 0 y 500 kg');
    }

    if (datos.altura && (datos.altura <= 0 || datos.altura > 300)) {
      errores.push('La altura debe estar entre 0 y 300 cm');
    }

    if (datos.grasa_corporal && (datos.grasa_corporal < 0 || datos.grasa_corporal > 100)) {
      errores.push('El porcentaje de grasa corporal debe estar entre 0 y 100%');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  },

  // Formatear datos para mostrar
  formatearDatosMedicion: (medicion) => {
    const formatNumber = (value, decimales = 1) => {
      if (value === null || value === undefined) return '-';
      return Number(value).toFixed(decimales);
    };

    return {
      ...medicion,
      peso_formateado: formatNumber(medicion.peso),
      altura_formateada: formatNumber(medicion.altura),
      imc_formateado: formatNumber(medicion.imc),
      grasa_corporal_formateada: formatNumber(medicion.grasa_corporal),
      musculo_formateado: formatNumber(medicion.musculo),
      fecha_formateada: medicion.fecha_medicion ? 
        new Date(medicion.fecha_medicion).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '-'
    };
  },

  // Comparar dos mediciones
  compararMediciones: (medicionAnterior, medicionActual) => {
    const cambios = {};

    const campos = [
      'peso', 'imc', 'grasa_corporal', 'musculo', 
      'perimetro_cintura', 'perimetro_cadera'
    ];

    campos.forEach(campo => {
      const valorAnterior = medicionAnterior[campo];
      const valorActual = medicionActual[campo];

      if (valorAnterior && valorActual) {
        const diferencia = valorActual - valorAnterior;
        const porcentaje = ((diferencia / valorAnterior) * 100);

        cambios[campo] = {
          diferencia: parseFloat(diferencia.toFixed(2)),
          porcentaje: parseFloat(porcentaje.toFixed(2)),
          tendencia: diferencia > 0 ? 'aumentó' : diferencia < 0 ? 'disminuyó' : 'sin cambios'
        };
      }
    });

    return cambios;
  },

  // Obtener recomendaciones basadas en mediciones
  getRecomendaciones: (medicion, paciente) => {
    const recomendaciones = [];
    
    if (medicion.imc) {
      if (medicion.imc < 18.5) {
        recomendaciones.push({
          tipo: 'warning',
          mensaje: 'IMC bajo: Se recomienda consultar sobre plan de aumento de peso saludable'
        });
      } else if (medicion.imc >= 25 && medicion.imc < 30) {
        recomendaciones.push({
          tipo: 'warning',
          mensaje: 'Sobrepeso: Se sugiere plan de reducción de peso gradual'
        });
      } else if (medicion.imc >= 30) {
        recomendaciones.push({
          tipo: 'error',
          mensaje: 'Obesidad: Importante consultar plan de reducción de peso supervisado'
        });
      }
    }

    if (medicion.grasa_corporal) {
      const limiteGrasa = paciente.sexo === 'F' ? 32 : 25;
      if (medicion.grasa_corporal > limiteGrasa) {
        recomendaciones.push({
          tipo: 'info',
          mensaje: 'Porcentaje de grasa corporal elevado: Considerar ejercicio cardiovascular'
        });
      }
    }

    if (medicion.agua_corporal_porcentaje && medicion.agua_corporal_porcentaje < 50) {
      recomendaciones.push({
        tipo: 'info',
        mensaje: 'Hidratación baja: Aumentar consumo de agua diario'
      });
    }

    return recomendaciones;
  }
};