const { executeQuery } = require('../config/database');

class Medicion {
  // Obtener todas las mediciones de un paciente
  static async getByPacienteId(pacienteId, limit = null) {
    let query = `
      SELECT m.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido
      FROM mediciones m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.paciente_id = ? AND m.activo = 1
      ORDER BY m.fecha_medicion DESC
    `;
    
    const params = [pacienteId];
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    
    try {
      const rows = await executeQuery(query, params);
      return rows;
    } catch (error) {
      console.error('Error al obtener mediciones:', error);
      throw error;
    }
  }

  // Obtener una medición específica
  static async getById(id) {
    try {
      const rows = await executeQuery(`
        SELECT m.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido,
               p.nombre as paciente_nombre, p.apellido as paciente_apellido,
               p.sexo as paciente_sexo, p.fecha_nacimiento as paciente_fecha_nacimiento
        FROM mediciones m
        LEFT JOIN usuarios u ON m.usuario_id = u.id
        LEFT JOIN pacientes p ON m.paciente_id = p.id
        WHERE m.id = ? AND m.activo = 1
      `, [id]);
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error al obtener medicion:', error);
      throw error;
    }
  }

  // Crear nueva medición - TOTALMENTE CORREGIDO
  static async create(medicionData) {
    // Función para asegurar que NUNCA pase undefined
    const safeValue = (value) => {
      if (value === undefined || value === '' || value === null) {
        return null;
      }
      // Si es string numérico, convertir a número
      if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
        return parseFloat(value);
      }
      return value;
    };

    console.log('📝 Datos recibidos en modelo Medicion.create:', JSON.stringify(medicionData, null, 2));

    // TODOS los campos con conversión segura
    const processedData = {
      paciente_id: safeValue(medicionData.paciente_id),
      fecha_medicion: medicionData.fecha_medicion,
      tipo: medicionData.tipo || 'manual',
      peso: safeValue(medicionData.peso),
      altura: safeValue(medicionData.altura),
      imc: safeValue(medicionData.imc),
      grasa_corporal: safeValue(medicionData.grasa_corporal),
      grasa_corporal_kg: safeValue(medicionData.grasa_corporal_kg),
      musculo: safeValue(medicionData.musculo),
      musculo_porcentaje: safeValue(medicionData.musculo_porcentaje),
      agua_corporal: safeValue(medicionData.agua_corporal),
      agua_corporal_porcentaje: safeValue(medicionData.agua_corporal_porcentaje),
      masa_osea: safeValue(medicionData.masa_osea),
      perimetro_cintura: safeValue(medicionData.perimetro_cintura),
      perimetro_cadera: safeValue(medicionData.perimetro_cadera),
      perimetro_brazo_derecho: safeValue(medicionData.perimetro_brazo_derecho),
      perimetro_brazo_izquierdo: safeValue(medicionData.perimetro_brazo_izquierdo),
      perimetro_muslo_derecho: safeValue(medicionData.perimetro_muslo_derecho),
      perimetro_muslo_izquierdo: safeValue(medicionData.perimetro_muslo_izquierdo),
      perimetro_cuello: safeValue(medicionData.perimetro_cuello),
      pliegue_bicipital: safeValue(medicionData.pliegue_bicipital),
      pliegue_tricipital: safeValue(medicionData.pliegue_tricipital),
      pliegue_subescapular: safeValue(medicionData.pliegue_subescapular),
      pliegue_suprailiaco: safeValue(medicionData.pliegue_suprailiaco),
      pliegue_abdominal: safeValue(medicionData.pliegue_abdominal),
      pliegue_muslo: safeValue(medicionData.pliegue_muslo),
      grasa_visceral: safeValue(medicionData.grasa_visceral),
      metabolismo_basal: safeValue(medicionData.metabolismo_basal),
      edad_metabolica: safeValue(medicionData.edad_metabolica),
      puntuacion_corporal: safeValue(medicionData.puntuacion_corporal),
      otros_valores: safeValue(medicionData.otros_valores),
      observaciones: safeValue(medicionData.observaciones),
      archivo_original: safeValue(medicionData.archivo_original),
      datos_ocr: safeValue(medicionData.datos_ocr),
      usuario_id: medicionData.usuario_id || null
    };

    console.log('✅ Datos procesados para SQL:', JSON.stringify(processedData, null, 2));

    // Validación final - ASEGURAR que no hay undefined
    const paramValues = [
      processedData.paciente_id,
      processedData.fecha_medicion,
      processedData.tipo,
      processedData.peso,
      processedData.altura,
      processedData.imc,
      processedData.grasa_corporal,
      processedData.grasa_corporal_kg,
      processedData.musculo,
      processedData.musculo_porcentaje,
      processedData.agua_corporal,
      processedData.agua_corporal_porcentaje,
      processedData.masa_osea,
      processedData.perimetro_cintura,
      processedData.perimetro_cadera,
      processedData.perimetro_brazo_derecho,
      processedData.perimetro_brazo_izquierdo,
      processedData.perimetro_muslo_derecho,
      processedData.perimetro_muslo_izquierdo,
      processedData.perimetro_cuello,
      processedData.pliegue_bicipital,
      processedData.pliegue_tricipital,
      processedData.pliegue_subescapular,
      processedData.pliegue_suprailiaco,
      processedData.pliegue_abdominal,
      processedData.pliegue_muslo,
      processedData.grasa_visceral,
      processedData.metabolismo_basal,
      processedData.edad_metabolica,
      processedData.puntuacion_corporal,
      processedData.otros_valores,
      processedData.observaciones,
      processedData.archivo_original,
      processedData.datos_ocr,
      processedData.usuario_id
    ];

    // DEBUG: Verificar que no hay undefined en los parámetros
    const undefinedParams = paramValues.map((val, index) => val === undefined ? index : null).filter(val => val !== null);
    if (undefinedParams.length > 0) {
      console.error('❌ PARÁMETROS UNDEFINED encontrados en posiciones:', undefinedParams);
      console.error('❌ Valores undefined:', undefinedParams.map(index => `Param ${index}: ${paramValues[index]}`));
      throw new Error(`Parámetros undefined detectados en posiciones: ${undefinedParams.join(', ')}`);
    }

    console.log('🔧 Parámetros SQL validados:', paramValues.length, 'parámetros sin undefined');

    try {
      const result = await executeQuery(`
        INSERT INTO mediciones (
          paciente_id, fecha_medicion, tipo, peso, altura, imc,
          grasa_corporal, grasa_corporal_kg, musculo, musculo_porcentaje,
          agua_corporal, agua_corporal_porcentaje, masa_osea,
          perimetro_cintura, perimetro_cadera, perimetro_brazo_derecho,
          perimetro_brazo_izquierdo, perimetro_muslo_derecho,
          perimetro_muslo_izquierdo, perimetro_cuello,
          pliegue_bicipital, pliegue_tricipital, pliegue_subescapular,
          pliegue_suprailiaco, pliegue_abdominal, pliegue_muslo,
          grasa_visceral, metabolismo_basal, edad_metabolica,
          puntuacion_corporal, otros_valores, observaciones,
          archivo_original, datos_ocr, usuario_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, paramValues);

      console.log('✅ Medición creada exitosamente con ID:', result.insertId);
      return result.insertId;
      
    } catch (error) {
      console.error('Error ejecutando query:', error);
      throw error;
    }
  }

  // Actualizar medición existente
  static async update(id, medicionData) {
    // Usar la misma función de limpieza
    const safeValue = (value) => {
      if (value === undefined || value === '' || value === null) {
        return null;
      }
      if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
        return parseFloat(value);
      }
      return value;
    };

    const processedData = {
      fecha_medicion: medicionData.fecha_medicion,
      tipo: medicionData.tipo || 'manual',
      peso: safeValue(medicionData.peso),
      altura: safeValue(medicionData.altura),
      imc: safeValue(medicionData.imc),
      grasa_corporal: safeValue(medicionData.grasa_corporal),
      grasa_corporal_kg: safeValue(medicionData.grasa_corporal_kg),
      musculo: safeValue(medicionData.musculo),
      musculo_porcentaje: safeValue(medicionData.musculo_porcentaje),
      agua_corporal: safeValue(medicionData.agua_corporal),
      agua_corporal_porcentaje: safeValue(medicionData.agua_corporal_porcentaje),
      masa_osea: safeValue(medicionData.masa_osea),
      perimetro_cintura: safeValue(medicionData.perimetro_cintura),
      perimetro_cadera: safeValue(medicionData.perimetro_cadera),
      perimetro_brazo_derecho: safeValue(medicionData.perimetro_brazo_derecho),
      perimetro_brazo_izquierdo: safeValue(medicionData.perimetro_brazo_izquierdo),
      perimetro_muslo_derecho: safeValue(medicionData.perimetro_muslo_derecho),
      perimetro_muslo_izquierdo: safeValue(medicionData.perimetro_muslo_izquierdo),
      perimetro_cuello: safeValue(medicionData.perimetro_cuello),
      pliegue_bicipital: safeValue(medicionData.pliegue_bicipital),
      pliegue_tricipital: safeValue(medicionData.pliegue_tricipital),
      pliegue_subescapular: safeValue(medicionData.pliegue_subescapular),
      pliegue_suprailiaco: safeValue(medicionData.pliegue_suprailiaco),
      pliegue_abdominal: safeValue(medicionData.pliegue_abdominal),
      pliegue_muslo: safeValue(medicionData.pliegue_muslo),
      grasa_visceral: safeValue(medicionData.grasa_visceral),
      metabolismo_basal: safeValue(medicionData.metabolismo_basal),
      edad_metabolica: safeValue(medicionData.edad_metabolica),
      puntuacion_corporal: safeValue(medicionData.puntuacion_corporal),
      otros_valores: safeValue(medicionData.otros_valores),
      observaciones: safeValue(medicionData.observaciones),
      archivo_original: safeValue(medicionData.archivo_original),
      datos_ocr: safeValue(medicionData.datos_ocr),
      usuario_id: medicionData.usuario_id || null
    };

    try {
      const result = await executeQuery(`
        UPDATE mediciones SET
          fecha_medicion = ?, tipo = ?, peso = ?, altura = ?, imc = ?,
          grasa_corporal = ?, grasa_corporal_kg = ?, musculo = ?, musculo_porcentaje = ?,
          agua_corporal = ?, agua_corporal_porcentaje = ?, masa_osea = ?,
          perimetro_cintura = ?, perimetro_cadera = ?, perimetro_brazo_derecho = ?,
          perimetro_brazo_izquierdo = ?, perimetro_muslo_derecho = ?,
          perimetro_muslo_izquierdo = ?, perimetro_cuello = ?,
          pliegue_bicipital = ?, pliegue_tricipital = ?, pliegue_subescapular = ?,
          pliegue_suprailiaco = ?, pliegue_abdominal = ?, pliegue_muslo = ?,
          grasa_visceral = ?, metabolismo_basal = ?, edad_metabolica = ?,
          puntuacion_corporal = ?, otros_valores = ?, observaciones = ?,
          archivo_original = ?, datos_ocr = ?, usuario_id = ?
        WHERE id = ? AND activo = 1
      `, [
        processedData.fecha_medicion, processedData.tipo, processedData.peso,
        processedData.altura, processedData.imc, processedData.grasa_corporal,
        processedData.grasa_corporal_kg, processedData.musculo, processedData.musculo_porcentaje,
        processedData.agua_corporal, processedData.agua_corporal_porcentaje, processedData.masa_osea,
        processedData.perimetro_cintura, processedData.perimetro_cadera, processedData.perimetro_brazo_derecho,
        processedData.perimetro_brazo_izquierdo, processedData.perimetro_muslo_derecho,
        processedData.perimetro_muslo_izquierdo, processedData.perimetro_cuello,
        processedData.pliegue_bicipital, processedData.pliegue_tricipital, processedData.pliegue_subescapular,
        processedData.pliegue_suprailiaco, processedData.pliegue_abdominal, processedData.pliegue_muslo,
        processedData.grasa_visceral, processedData.metabolismo_basal, processedData.edad_metabolica,
        processedData.puntuacion_corporal, processedData.otros_valores, processedData.observaciones,
        processedData.archivo_original, processedData.datos_ocr, processedData.usuario_id,
        id
      ]);

      return result.affectedRows > 0;
      
    } catch (error) {
      console.error('Error al actualizar medición:', error);
      throw error;
    }
  }

  // Eliminar medición (soft delete)
  static async delete(id) {
    try {
      const result = await executeQuery(
        'UPDATE mediciones SET activo = 0 WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar medición:', error);
      throw error;
    }
  }

  // Obtener mediciones por rango de fechas
  static async getByDateRange(pacienteId, fechaDesde, fechaHasta) {
    try {
      const rows = await executeQuery(`
        SELECT m.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido
        FROM mediciones m
        LEFT JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.paciente_id = ? 
          AND m.fecha_medicion BETWEEN ? AND ?
          AND m.activo = 1
        ORDER BY m.fecha_medicion ASC
      `, [pacienteId, fechaDesde, fechaHasta]);
      
      return rows;
    } catch (error) {
      console.error('Error al obtener mediciones por rango de fechas:', error);
      throw error;
    }
  }

  // Obtener la última medición de un paciente
  static async getLastByPaciente(pacienteId) {
    try {
      const rows = await executeQuery(`
        SELECT m.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido
        FROM mediciones m
        LEFT JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.paciente_id = ? AND m.activo = 1
        ORDER BY m.fecha_medicion DESC
        LIMIT 1
      `, [pacienteId]);
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error al obtener última medición:', error);
      throw error;
    }
  }

  // Calcular IMC
  static calcularIMC(peso, altura) {
    try {
      // Validar que peso y altura sean números válidos
      const pesoNum = parseFloat(peso);
      const alturaNum = parseFloat(altura);
      
      if (isNaN(pesoNum) || isNaN(alturaNum) || pesoNum <= 0 || alturaNum <= 0) {
        console.warn('Valores inválidos para calcular IMC:', { peso, altura });
        return null;
      }
      
      // Convertir altura de cm a metros si es necesario
      const alturaMetros = alturaNum > 3 ? alturaNum / 100 : alturaNum;
      
      // Calcular IMC = peso / (altura en metros)²
      const imc = pesoNum / (alturaMetros * alturaMetros);
      
      // Retornar con 2 decimales
      return Math.round(imc * 100) / 100;
      
    } catch (error) {
      console.error('Error al calcular IMC:', error);
      return null;
    }
  }

  // Obtener estadísticas de evolución
  static async getEstadisticasEvolucion(pacienteId, fechaInicio = null, fechaFin = null) {
    try {
      let whereClause = 'WHERE m.paciente_id = ? AND m.activo = 1';
      let params = [pacienteId];
      
      if (fechaInicio) {
        whereClause += ' AND m.fecha_medicion >= ?';
        params.push(fechaInicio);
      }
      
      if (fechaFin) {
        whereClause += ' AND m.fecha_medicion <= ?';
        params.push(fechaFin);
      }
      
      const rows = await executeQuery(`
        SELECT 
          COUNT(*) as total_mediciones,
          MIN(m.fecha_medicion) as primera_medicion,
          MAX(m.fecha_medicion) as ultima_medicion,
          AVG(m.peso) as peso_promedio,
          MIN(m.peso) as peso_minimo,
          MAX(m.peso) as peso_maximo,
          AVG(m.imc) as imc_promedio,
          MIN(m.imc) as imc_minimo,
          MAX(m.imc) as imc_maximo,
          AVG(m.grasa_corporal) as grasa_promedio,
          AVG(m.musculo) as musculo_promedio
        FROM mediciones m
        ${whereClause}
      `, params);
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error al obtener estadísticas de evolución:', error);
      throw error;
    }
  }

  // Obtener historial de versiones (placeholder para futuro desarrollo)
  static async getHistorialVersiones(medicionId) {
    try {
      const rows = await executeQuery(`
        SELECT mv.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido
        FROM mediciones_versiones mv
        LEFT JOIN usuarios u ON mv.usuario_modificacion_id = u.id
        WHERE mv.medicion_id = ?
        ORDER BY mv.fecha_modificacion DESC
      `, [medicionId]);
      
      return rows;
    } catch (error) {
      console.error('Error al obtener historial de versiones:', error);
      throw error;
    }
  }
}

module.exports = Medicion;