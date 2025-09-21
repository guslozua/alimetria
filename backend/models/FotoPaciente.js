const { pool: db } = require('../config/database');

class FotoPaciente {
  constructor(data = {}) {
    this.id = data.id;
    this.paciente_id = data.paciente_id;
    this.ruta_imagen = data.ruta_imagen;
    this.tipo_foto = data.tipo_foto || 'frontal';
    this.descripcion = data.descripcion;
    this.peso_momento = data.peso_momento;
    this.medicion_relacionada_id = data.medicion_relacionada_id;
    this.fecha = data.fecha;
    this.usuario_id = data.usuario_id;
    this.activo = data.activo !== undefined ? data.activo : true;
    
    // Campos relacionados (desde JOINs)
    this.paciente_nombre = data.paciente_nombre;
    this.usuario_nombre = data.usuario_nombre;
  }

  // Crear nueva foto
  static async crear(fotoData) {
    const query = `
      INSERT INTO fotos_pacientes (
        paciente_id, ruta_imagen, tipo_foto, descripcion, 
        peso_momento, medicion_relacionada_id, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      fotoData.paciente_id,
      fotoData.ruta_imagen,
      fotoData.tipo_foto || 'frontal',
      fotoData.descripcion,
      fotoData.peso_momento,
      fotoData.medicion_relacionada_id,
      fotoData.usuario_id
    ];

    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...fotoData };
    } catch (error) {
      throw error;
    }
  }

  // Obtener fotos por paciente
  static async obtenerPorPaciente(pacienteId, opciones = {}) {
    let query = `
      SELECT 
        fp.*,
        CONCAT(p.nombre, ' ', p.apellido) as paciente_nombre,
        u.nombre as usuario_nombre
      FROM fotos_pacientes fp
      INNER JOIN pacientes p ON fp.paciente_id = p.id
      LEFT JOIN usuarios u ON fp.usuario_id = u.id
      WHERE fp.paciente_id = ? AND fp.activo = 1
    `;

    const values = [pacienteId];

    // Filtrar por tipo de foto si se especifica
    if (opciones.tipo_foto) {
      query += ` AND fp.tipo_foto = ?`;
      values.push(opciones.tipo_foto);
    }

    // Ordenar por fecha (más recientes primero)
    query += ` ORDER BY fp.fecha DESC`;

    // Limitar resultados si se especifica
    if (opciones.limit) {
      query += ` LIMIT ?`;
      values.push(parseInt(opciones.limit));
    }

    try {
      const [rows] = await db.execute(query, values);
      return rows.map(row => new FotoPaciente(row));
    } catch (error) {
      throw error;
    }
  }

  // Obtener foto por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        fp.*,
        CONCAT(p.nombre, ' ', p.apellido) as paciente_nombre,
        u.nombre as usuario_nombre
      FROM fotos_pacientes fp
      INNER JOIN pacientes p ON fp.paciente_id = p.id
      LEFT JOIN usuarios u ON fp.usuario_id = u.id
      WHERE fp.id = ? AND fp.activo = 1
    `;

    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new FotoPaciente(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar foto
  static async actualizar(id, datosActualizacion) {
    const camposPermitidos = ['descripcion', 'peso_momento', 'medicion_relacionada_id', 'tipo_foto'];
    const campos = [];
    const valores = [];

    Object.keys(datosActualizacion).forEach(campo => {
      if (camposPermitidos.includes(campo) && datosActualizacion[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        valores.push(datosActualizacion[campo]);
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    valores.push(id);
    const query = `UPDATE fotos_pacientes SET ${campos.join(', ')} WHERE id = ?`;

    try {
      const [result] = await db.execute(query, valores);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar foto (soft delete)
  static async eliminar(id) {
    const query = `UPDATE fotos_pacientes SET activo = 0 WHERE id = ?`;

    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de fotos por paciente
  static async obtenerEstadisticas(pacienteId) {
    const query = `
      SELECT 
        COUNT(*) as total_fotos,
        COUNT(CASE WHEN tipo_foto = 'frontal' THEN 1 END) as frontales,
        COUNT(CASE WHEN tipo_foto = 'lateral' THEN 1 END) as laterales,
        COUNT(CASE WHEN tipo_foto = 'posterior' THEN 1 END) as posteriores,
        COUNT(CASE WHEN tipo_foto = 'detalle' THEN 1 END) as detalles,
        MIN(fecha) as primera_foto,
        MAX(fecha) as ultima_foto
      FROM fotos_pacientes 
      WHERE paciente_id = ? AND activo = 1
    `;

    try {
      const [rows] = await db.execute(query, [pacienteId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Convertir a objeto para respuesta
  toJSON() {
    return {
      id: this.id,
      paciente_id: this.paciente_id,
      ruta_imagen: this.ruta_imagen,
      tipo_foto: this.tipo_foto,
      descripcion: this.descripcion,
      peso_momento: this.peso_momento,
      medicion_relacionada_id: this.medicion_relacionada_id,
      fecha: this.fecha,
      usuario_id: this.usuario_id,
      activo: this.activo,
      paciente_nombre: this.paciente_nombre,
      usuario_nombre: this.usuario_nombre
    };
  }
}

module.exports = FotoPaciente;