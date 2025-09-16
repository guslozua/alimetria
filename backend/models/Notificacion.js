const { pool, executeQuery } = require('../config/database');

class Notificacion {
  constructor(data) {
    this.id = data.id;
    this.tipo = data.tipo;
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
    this.destinatario_id = data.destinatario_id;
    this.paciente_relacionado_id = data.paciente_relacionado_id;
    this.cita_relacionada_id = data.cita_relacionada_id;
    this.leida = data.leida || false;
    this.enviado_email = data.enviado_email || false;
    this.fecha_programada = data.fecha_programada;
    this.fecha_enviada = data.fecha_enviada;
    this.fecha_leida = data.fecha_leida;
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  // Crear nueva notificación
  static async crear(datosNotificacion) {
    const query = `
      INSERT INTO notificaciones (
        tipo, titulo, mensaje, destinatario_id, 
        paciente_relacionado_id, cita_relacionada_id, 
        fecha_programada, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await executeQuery(query, [
        datosNotificacion.tipo,
        datosNotificacion.titulo,
        datosNotificacion.mensaje,
        datosNotificacion.destinatario_id,
        datosNotificacion.paciente_relacionado_id || null,
        datosNotificacion.cita_relacionada_id || null,
        datosNotificacion.fecha_programada || null,
        true
      ]);

      return await this.obtenerPorId(result.insertId);
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  // Obtener notificación por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        n.*,
        u.nombre as destinatario_nombre,
        p.nombre as paciente_nombre,
        p.apellido as paciente_apellido,
        c.fecha_hora as cita_fecha_hora
      FROM notificaciones n
      LEFT JOIN usuarios u ON n.destinatario_id = u.id
      LEFT JOIN pacientes p ON n.paciente_relacionado_id = p.id
      LEFT JOIN citas c ON n.cita_relacionada_id = c.id
      WHERE n.id = ? AND n.activo = 1
    `;

    try {
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Notificacion(results[0]) : null;
    } catch (error) {
      console.error('Error al obtener notificación:', error);
      throw error;
    }
  }

  // Obtener notificaciones de un usuario
  static async obtenerPorUsuario(usuarioId, opciones = {}) {
    let query = `
      SELECT 
        n.*,
        u.nombre as destinatario_nombre,
        p.nombre as paciente_nombre,
        p.apellido as paciente_apellido,
        c.fecha_hora as cita_fecha_hora
      FROM notificaciones n
      LEFT JOIN usuarios u ON n.destinatario_id = u.id
      LEFT JOIN pacientes p ON n.paciente_relacionado_id = p.id
      LEFT JOIN citas c ON n.cita_relacionada_id = c.id
      WHERE n.destinatario_id = ? AND n.activo = 1
    `;

    const params = [usuarioId];
    
    console.log('🔍 DEBUG obtenerPorUsuario - usuarioId recibido:', usuarioId);
    console.log('🔍 DEBUG obtenerPorUsuario - opciones:', opciones);

    // Filtrar por tipo
    if (opciones.tipo) {
      query += ` AND n.tipo = ?`;
      params.push(opciones.tipo);
    }

    // Filtrar por estado de lectura
    if (opciones.leidas !== undefined && opciones.leidas !== null) {
      query += ` AND n.leida = ?`;
      params.push(opciones.leidas);
    }

    // Filtrar por fecha
    if (opciones.fechaDesde) {
      query += ` AND DATE(n.fecha_programada) >= ?`;
      params.push(opciones.fechaDesde);
    }

    if (opciones.fechaHasta) {
      query += ` AND DATE(n.fecha_programada) <= ?`;
      params.push(opciones.fechaHasta);
    }

    // Ordenar
    query += ` ORDER BY n.fecha_programada DESC, n.id DESC`;

    // Paginación
    if (opciones.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(opciones.limit));
      
      if (opciones.offset) {
        query += ` OFFSET ?`;
        params.push(parseInt(opciones.offset));
      }
    }
    
    console.log('🔍 DEBUG obtenerPorUsuario - query final:', query);
    console.log('🔍 DEBUG obtenerPorUsuario - params:', params);

    try {
      const results = await executeQuery(query, params);
      console.log('🔍 DEBUG obtenerPorUsuario - resultados SQL:', results.length);
      console.log('🔍 DEBUG obtenerPorUsuario - resultados completos:', results);
      
      return results.map(row => new Notificacion(row));
    } catch (error) {
      console.error('Error al obtener notificaciones por usuario:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  static async marcarComoLeida(id, usuarioId = null) {
    let query, params;
    
    if (usuarioId) {
      // Usuario normal: solo puede marcar sus propias notificaciones
      query = `
        UPDATE notificaciones 
        SET leida = 1, fecha_leida = CURRENT_TIMESTAMP 
        WHERE id = ? AND destinatario_id = ? AND activo = 1
      `;
      params = [id, usuarioId];
    } else {
      // Administrador: puede marcar cualquier notificación
      query = `
        UPDATE notificaciones 
        SET leida = 1, fecha_leida = CURRENT_TIMESTAMP 
        WHERE id = ? AND activo = 1
      `;
      params = [id];
    }

    try {
      const result = await executeQuery(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  static async marcarTodasComoLeidas(usuarioId) {
    const query = `
      UPDATE notificaciones 
      SET leida = 1, fecha_leida = CURRENT_TIMESTAMP 
      WHERE destinatario_id = ? AND leida = 0 AND activo = 1
    `;

    try {
      const result = await executeQuery(query, [usuarioId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  // Eliminar notificación (soft delete)
  static async eliminar(id, usuarioId = null) {
    let query, params;
    
    if (usuarioId) {
      // Usuario normal: solo puede eliminar sus propias notificaciones
      query = `
        UPDATE notificaciones 
        SET activo = 0 
        WHERE id = ? AND destinatario_id = ? AND activo = 1
      `;
      params = [id, usuarioId];
    } else {
      // Administrador: puede eliminar cualquier notificación
      query = `
        UPDATE notificaciones 
        SET activo = 0 
        WHERE id = ? AND activo = 1
      `;
      params = [id];
    }

    try {
      const result = await executeQuery(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

  // Obtener notificaciones pendientes de envío por email
  static async obtenerPendientesEnvio() {
    const query = `
      SELECT 
        n.*,
        u.nombre as destinatario_nombre,
        u.email as destinatario_email,
        p.nombre as paciente_nombre,
        p.apellido as paciente_apellido,
        c.fecha_hora as cita_fecha_hora
      FROM notificaciones n
      LEFT JOIN usuarios u ON n.destinatario_id = u.id
      LEFT JOIN pacientes p ON n.paciente_relacionado_id = p.id
      LEFT JOIN citas c ON n.cita_relacionada_id = c.id
      WHERE n.activo = 1 
        AND n.enviado_email = 0
        AND n.fecha_programada IS NOT NULL
        AND n.fecha_programada <= CURRENT_TIMESTAMP
        AND u.email IS NOT NULL
      ORDER BY n.fecha_programada ASC
      LIMIT 50
    `;

    try {
      const results = await executeQuery(query);
      return results;
    } catch (error) {
      console.error('Error al obtener notificaciones pendientes:', error);
      throw error;
    }
  }

  // Marcar notificación como enviada por email
  static async marcarComoEnviada(id) {
    const query = `
      UPDATE notificaciones 
      SET enviado_email = 1, fecha_enviada = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    try {
      const result = await executeQuery(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al marcar notificación como enviada:', error);
      throw error;
    }
  }

  // Contar notificaciones no leídas de un usuario
  static async contarNoLeidas(usuarioId) {
    const query = `
      SELECT COUNT(*) as total
      FROM notificaciones 
      WHERE destinatario_id = ? AND leida = 0 AND activo = 1
    `;

    try {
      const results = await executeQuery(query, [usuarioId]);
      return results[0].total;
    } catch (error) {
      console.error('Error al contar notificaciones no leídas:', error);
      throw error;
    }
  }

  // Crear recordatorio de cita
  static async crearRecordatorioCita(citaId, diasPrevios = 1) {
    // Primero obtener los datos completos de la cita
    const Cita = require('./Cita');
    const cita = await Cita.obtenerPorId(citaId);
    
    if (!cita) {
      throw new Error('Cita no encontrada');
    }
    
    console.log('🔍 DEBUG crearRecordatorioCita - cita obtenida:', cita);
    
    const fechaCita = new Date(cita.fecha_hora);
    const fechaRecordatorio = new Date(fechaCita.getTime() - (diasPrevios * 24 * 60 * 60 * 1000));
    
    console.log('🔍 DEBUG crearRecordatorioCita - fecha_hora:', cita.fecha_hora);
    console.log('🔍 DEBUG crearRecordatorioCita - fechaRecordatorio (calculada correctamente):', fechaRecordatorio);

    const notificacion = {
      tipo: 'cita_recordatorio',
      titulo: 'Recordatorio de Cita',
      mensaje: `Tienes una cita programada para el ${fechaCita.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
      })}.`,
      destinatario_id: cita.nutricionista_id,
      paciente_relacionado_id: cita.paciente_id,
      cita_relacionada_id: cita.id,
      fecha_programada: fechaRecordatorio
    };
    
    console.log('🔍 DEBUG crearRecordatorioCita - notificacion a crear:', notificacion);

    return await this.crear(notificacion);
  }

  // Obtener estadísticas de notificaciones
  static async obtenerEstadisticas(usuarioId) {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN leida = 0 THEN 1 ELSE 0 END) as no_leidas,
        SUM(CASE WHEN leida = 1 THEN 1 ELSE 0 END) as leidas,
        SUM(CASE WHEN tipo = 'cita_recordatorio' THEN 1 ELSE 0 END) as recordatorios,
        SUM(CASE WHEN tipo = 'medicion_pendiente' THEN 1 ELSE 0 END) as mediciones,
        SUM(CASE WHEN tipo = 'sistema' THEN 1 ELSE 0 END) as sistema,
        SUM(CASE WHEN tipo = 'alerta' THEN 1 ELSE 0 END) as alertas
      FROM notificaciones 
      WHERE destinatario_id = ? AND activo = 1
    `;

    try {
      const results = await executeQuery(query, [usuarioId]);
      return results[0];
    } catch (error) {
      console.error('Error al obtener estadísticas de notificaciones:', error);
      throw error;
    }
  }
}

module.exports = Notificacion;
