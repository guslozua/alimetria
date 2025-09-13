const { pool: db } = require('../config/database');

class Cita {
  constructor(data) {
    this.id = data.id;
    this.paciente_id = data.paciente_id;
    this.nutricionista_id = data.nutricionista_id;
    this.fecha_hora = data.fecha_hora;
    this.duracion_minutos = data.duracion_minutos || 60;
    this.tipo_consulta = data.tipo_consulta || 'seguimiento';
    this.estado = data.estado || 'programada';
    this.motivo = data.motivo;
    this.notas_previas = data.notas_previas;
    this.notas_posteriores = data.notas_posteriores;
    this.recordatorio_enviado = data.recordatorio_enviado || false;
    this.fecha_recordatorio = data.fecha_recordatorio;
    this.consultorio_id = data.consultorio_id;
    this.usuario_creador_id = data.usuario_creador_id;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_actualizacion = data.fecha_actualizacion;
    
    // Datos del paciente (desde JOIN)
    this.paciente_nombre = data.paciente_nombre;
    this.paciente_telefono = data.paciente_telefono;
    this.paciente_email = data.paciente_email;
    
    // Datos del nutricionista (desde JOIN)
    this.nutricionista_nombre = data.nutricionista_nombre;
    
    // Datos del consultorio (desde JOIN)
    this.consultorio_nombre = data.consultorio_nombre;
  }

  // Crear nueva cita
  static async crear(citaData) {
    const query = `
      INSERT INTO citas (
        paciente_id, nutricionista_id, fecha_hora, duracion_minutos,
        tipo_consulta, estado, motivo, notas_previas,
        consultorio_id, usuario_creador_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      citaData.paciente_id,
      citaData.nutricionista_id,
      citaData.fecha_hora,
      citaData.duracion_minutos || 60,
      citaData.tipo_consulta || 'seguimiento',
      citaData.estado || 'programada',
      citaData.motivo,
      citaData.notas_previas,
      citaData.consultorio_id,
      citaData.usuario_creador_id
    ];

    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...citaData };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las citas con información de paciente y nutricionista
  static async obtenerTodas(filtros = {}) {
    let query = `
      SELECT 
        c.*,
        CONCAT(p.nombre, ' ', p.apellido) as paciente_nombre,
        p.telefono as paciente_telefono,
        p.email as paciente_email,
        CONCAT(u.nombre, ' ', IFNULL(u.apellido, '')) as nutricionista_nombre,
        cons.nombre as consultorio_nombre
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON c.nutricionista_id = u.id
      LEFT JOIN consultorios cons ON c.consultorio_id = cons.id
      WHERE 1=1
    `;

    const values = [];

    // Filtrar por consultorio si se especifica
    if (filtros.consultorio_id) {
      query += ` AND c.consultorio_id = ?`;
      values.push(filtros.consultorio_id);
    }

    // Filtrar por nutricionista si se especifica
    if (filtros.nutricionista_id) {
      query += ` AND c.nutricionista_id = ?`;
      values.push(filtros.nutricionista_id);
    }

    // Filtrar por estado si se especifica
    if (filtros.estado) {
      query += ` AND c.estado = ?`;
      values.push(filtros.estado);
    }

    // Filtrar por rango de fechas
    if (filtros.fecha_desde) {
      query += ` AND DATE(c.fecha_hora) >= ?`;
      values.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      query += ` AND DATE(c.fecha_hora) <= ?`;
      values.push(filtros.fecha_hasta);
    }

    // Filtrar por paciente específico
    if (filtros.paciente_id) {
      query += ` AND c.paciente_id = ?`;
      values.push(filtros.paciente_id);
    }

    query += ` ORDER BY c.fecha_hora ASC`;

    // Limitar resultados si se especifica
    if (filtros.limit) {
      query += ` LIMIT ?`;
      values.push(parseInt(filtros.limit));
    }

    try {
      const [rows] = await db.execute(query, values);
      return rows.map(row => new Cita(row));
    } catch (error) {
      throw error;
    }
  }

  // Obtener cita por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        c.*,
        CONCAT(p.nombre, ' ', p.apellido) as paciente_nombre,
        p.telefono as paciente_telefono,
        p.email as paciente_email,
        CONCAT(u.nombre, ' ', IFNULL(u.apellido, '')) as nutricionista_nombre,
        cons.nombre as consultorio_nombre
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON c.nutricionista_id = u.id
      LEFT JOIN consultorios cons ON c.consultorio_id = cons.id
      WHERE c.id = ?
    `;

    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new Cita(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener próximas citas (útil para dashboard)
  static async obtenerProximas(nutricionista_id, limit = 5) {
    const query = `
      SELECT 
        c.*,
        CONCAT(p.nombre, ' ', p.apellido) as paciente_nombre,
        p.telefono as paciente_telefono
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.nutricionista_id = ?
        AND c.fecha_hora >= NOW()
        AND c.estado IN ('programada', 'confirmada')
      ORDER BY c.fecha_hora ASC
      LIMIT ?
    `;

    try {
      const [rows] = await db.execute(query, [nutricionista_id, limit]);
      return rows.map(row => new Cita(row));
    } catch (error) {
      throw error;
    }
  }

  // Verificar disponibilidad de horario
  static async verificarDisponibilidad(nutricionista_id, fecha_hora, duracion_minutos = 60, cita_id = null) {
    let query = `
      SELECT COUNT(*) as conflictos
      FROM citas
      WHERE nutricionista_id = ?
        AND estado NOT IN ('cancelada', 'no_asistio')
        AND (
          (fecha_hora <= ? AND DATE_ADD(fecha_hora, INTERVAL duracion_minutos MINUTE) > ?) OR
          (fecha_hora < DATE_ADD(?, INTERVAL ? MINUTE) AND DATE_ADD(fecha_hora, INTERVAL duracion_minutos MINUTE) >= DATE_ADD(?, INTERVAL ? MINUTE))
        )
    `;

    const values = [nutricionista_id, fecha_hora, fecha_hora, fecha_hora, duracion_minutos, fecha_hora, duracion_minutos];

    // Si estamos editando una cita, excluirla de la verificación
    if (cita_id) {
      query += ` AND id != ?`;
      values.push(cita_id);
    }

    try {
      const [rows] = await db.execute(query, values);
      return rows[0].conflictos === 0;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cita
  static async actualizar(id, citaData) {
    const camposActualizables = [
      'paciente_id', 'nutricionista_id', 'fecha_hora', 'duracion_minutos',
      'tipo_consulta', 'estado', 'motivo', 'notas_previas', 'notas_posteriores',
      'recordatorio_enviado', 'fecha_recordatorio'
    ];

    const campos = [];
    const valores = [];

    // Construir query dinámicamente solo con campos proporcionados
    Object.keys(citaData).forEach(key => {
      if (camposActualizables.includes(key) && citaData[key] !== undefined) {
        campos.push(`${key} = ?`);
        valores.push(citaData[key]);
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    valores.push(id);
    const query = `UPDATE citas SET ${campos.join(', ')} WHERE id = ?`;

    try {
      const [result] = await db.execute(query, valores);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cancelar cita
  static async cancelar(id, motivo = null) {
    const query = `
      UPDATE citas 
      SET estado = 'cancelada', 
          notas_posteriores = CONCAT(IFNULL(notas_posteriores, ''), 
                                   CASE WHEN notas_posteriores IS NULL OR notas_posteriores = '' 
                                        THEN ? 
                                        ELSE CONCAT('\n--- CANCELACIÓN ---\n', ?) 
                                   END)
      WHERE id = ?
    `;

    const motivoCancelacion = motivo || `Cita cancelada el ${new Date().toLocaleString('es-AR')}`;

    try {
      const [result] = await db.execute(query, [motivoCancelacion, motivoCancelacion, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Marcar cita como completada
  static async completar(id, notas_posteriores = null) {
    const query = `
      UPDATE citas 
      SET estado = 'completada'${notas_posteriores ? ', notas_posteriores = ?' : ''}
      WHERE id = ?
    `;

    const values = notas_posteriores ? [notas_posteriores, id] : [id];

    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Estadísticas de citas
  static async obtenerEstadisticas(filtros = {}) {
    let query = `
      SELECT 
        estado,
        COUNT(*) as total,
        COUNT(CASE WHEN DATE(fecha_hora) = CURDATE() THEN 1 END) as hoy,
        COUNT(CASE WHEN DATE(fecha_hora) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as proxima_semana
      FROM citas
      WHERE 1=1
    `;

    const values = [];

    if (filtros.consultorio_id) {
      query += ` AND consultorio_id = ?`;
      values.push(filtros.consultorio_id);
    }

    if (filtros.nutricionista_id) {
      query += ` AND nutricionista_id = ?`;
      values.push(filtros.nutricionista_id);
    }

    if (filtros.fecha_desde) {
      query += ` AND DATE(fecha_hora) >= ?`;
      values.push(filtros.fecha_desde);
    }

    query += ` GROUP BY estado`;

    try {
      const [rows] = await db.execute(query, values);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener citas que necesitan recordatorio
  static async obtenerParaRecordatorio() {
    const query = `
      SELECT 
        c.*,
        CONCAT(p.nombre, ' ', p.apellido) as paciente_nombre,
        p.email as paciente_email,
        p.telefono as paciente_telefono
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.estado IN ('programada', 'confirmada')
        AND c.recordatorio_enviado = FALSE
        AND c.fecha_hora BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
    `;

    try {
      const [rows] = await db.execute(query);
      return rows.map(row => new Cita(row));
    } catch (error) {
      throw error;
    }
  }

  // Marcar recordatorio como enviado
  static async marcarRecordatorioEnviado(id) {
    const query = `
      UPDATE citas 
      SET recordatorio_enviado = TRUE, 
          fecha_recordatorio = NOW()
      WHERE id = ?
    `;

    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar cita (soft delete - marcar como cancelada)
  static async eliminar(id) {
    return await this.cancelar(id, 'Cita eliminada del sistema');
  }
}

module.exports = Cita;
