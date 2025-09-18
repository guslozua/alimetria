const { executeQuery } = require('../config/database');

class ObraSocial {
  constructor(data = {}) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.codigo = data.codigo;
    this.descripcion = data.descripcion;
    this.telefono = data.telefono;           // Campo real de la BD
    this.email = data.email;                 // Campo real de la BD
    this.contacto_telefono = data.telefono;  // Alias para compatibilidad
    this.contacto_email = data.email;        // Alias para compatibilidad
    this.sitio_web = data.sitio_web;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_actualizacion = data.fecha_actualizacion;
    // Agregar contador de pacientes si viene del backend
    this.pacientes_count = data.pacientes_count || 0;
  }

  // Obtener todas las obras sociales activas
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT os.*, 
               COUNT(p.id) as pacientes_count
        FROM obras_sociales os
        LEFT JOIN pacientes p ON os.id = p.obra_social_id AND p.activo = TRUE
        WHERE os.activo = TRUE
      `;
      const values = [];

      // Filtro por búsqueda
      if (filters.search) {
        query += ' AND (os.nombre LIKE ? OR os.codigo LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm);
      }

      // Agrupar por obra social
      query += ' GROUP BY os.id';

      // Ordenamiento
      const orderBy = filters.orderBy || 'os.nombre';
      const orderDirection = filters.orderDirection || 'ASC';
      query += ` ORDER BY ${orderBy} ${orderDirection}`;

      // Paginación
      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          values.push(parseInt(filters.offset));
        }
      }

      const results = await executeQuery(query, values);
      return results.map(obraSocial => new ObraSocial(obraSocial));
    } catch (error) {
      console.error('Error obteniendo obras sociales:', error);
      throw error;
    }
  }

  // Buscar obra social por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM obras_sociales WHERE id = ? AND activo = TRUE';
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new ObraSocial(results[0]) : null;
    } catch (error) {
      console.error('Error buscando obra social por ID:', error);
      throw error;
    }
  }

  // Buscar obra social por código
  static async findByCode(codigo) {
    try {
      const query = 'SELECT * FROM obras_sociales WHERE codigo = ? AND activo = TRUE';
      const results = await executeQuery(query, [codigo]);
      return results.length > 0 ? new ObraSocial(results[0]) : null;
    } catch (error) {
      console.error('Error buscando obra social por código:', error);
      throw error;
    }
  }

  // Crear nueva obra social
  static async create(obraSocialData) {
    try {
      // Verificar que el nombre no exista
      const existingByName = await executeQuery(
        'SELECT id FROM obras_sociales WHERE nombre = ? AND activo = TRUE',
        [obraSocialData.nombre]
      );
      
      if (existingByName.length > 0) {
        throw new Error('Ya existe una obra social con ese nombre');
      }

      // Verificar que el código no exista (si se proporciona)
      if (obraSocialData.codigo) {
        const existingByCode = await executeQuery(
          'SELECT id FROM obras_sociales WHERE codigo = ? AND activo = TRUE',
          [obraSocialData.codigo]
        );
        
        if (existingByCode.length > 0) {
          throw new Error('Ya existe una obra social con ese código');
        }
      }

      const query = `
        INSERT INTO obras_sociales (
          nombre, codigo, descripcion, telefono, email, sitio_web
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        obraSocialData.nombre,
        obraSocialData.codigo || null,
        obraSocialData.descripcion || null,
        obraSocialData.contacto_telefono || obraSocialData.telefono || null,
        obraSocialData.contacto_email || obraSocialData.email || null,
        obraSocialData.sitio_web || null
      ];
      
      const result = await executeQuery(query, values);
      return await ObraSocial.findById(result.insertId);
    } catch (error) {
      console.error('Error creando obra social:', error);
      throw error;
    }
  }

  // Actualizar obra social
  async update(updateData) {
    try {
      // Verificar nombre único (excluyendo el actual)
      if (updateData.nombre) {
        const existingByName = await executeQuery(
          'SELECT id FROM obras_sociales WHERE nombre = ? AND id != ? AND activo = TRUE',
          [updateData.nombre, this.id]
        );
        
        if (existingByName.length > 0) {
          throw new Error('Ya existe una obra social con ese nombre');
        }
      }

      // Verificar código único (excluyendo el actual)
      if (updateData.codigo) {
        const existingByCode = await executeQuery(
          'SELECT id FROM obras_sociales WHERE codigo = ? AND id != ? AND activo = TRUE',
          [updateData.codigo, this.id]
        );
        
        if (existingByCode.length > 0) {
          throw new Error('Ya existe una obra social con ese código');
        }
      }

      const fields = [];
      const values = [];

      // Campos que se pueden actualizar
      const allowedFields = ['nombre', 'codigo', 'descripcion', 'telefono', 'email', 'sitio_web'];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      });
      
      // Manejar aliases del frontend
      if (updateData.contacto_telefono !== undefined) {
        fields.push('telefono = ?');
        values.push(updateData.contacto_telefono);
      }
      
      if (updateData.contacto_email !== undefined) {
        fields.push('email = ?');
        values.push(updateData.contacto_email);
      }

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(this.id);
      const query = `UPDATE obras_sociales SET ${fields.join(', ')}, fecha_actualizacion = NOW() WHERE id = ?`;
      
      await executeQuery(query, values);
      return await ObraSocial.findById(this.id);
    } catch (error) {
      console.error('Error actualizando obra social:', error);
      throw error;
    }
  }

  // Desactivar obra social (soft delete)
  async deactivate() {
    try {
      const query = 'UPDATE obras_sociales SET activo = FALSE, fecha_actualizacion = NOW() WHERE id = ?';
      await executeQuery(query, [this.id]);
      this.activo = false;
    } catch (error) {
      console.error('Error desactivando obra social:', error);
      throw error;
    }
  }

  // Obtener pacientes asociados a esta obra social
  async getPacientes(limit = null) {
    try {
      let query = `
        SELECT p.*, 
               TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
        FROM pacientes p
        WHERE p.obra_social_id = ? AND p.activo = TRUE
        ORDER BY p.apellido, p.nombre
      `;
      const values = [this.id];

      if (limit) {
        query += ' LIMIT ?';
        values.push(limit);
      }

      return await executeQuery(query, values);
    } catch (error) {
      console.error('Error obteniendo pacientes de la obra social:', error);
      throw error;
    }
  }

  // Obtener estadísticas de pacientes
  async getEstadisticas() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_pacientes,
          COUNT(CASE WHEN p.sexo = 'M' THEN 1 END) as pacientes_masculinos,
          COUNT(CASE WHEN p.sexo = 'F' THEN 1 END) as pacientes_femeninos,
          AVG(TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE())) as edad_promedio
        FROM pacientes p
        WHERE p.obra_social_id = ? AND p.activo = TRUE
      `;

      const result = await executeQuery(query, [this.id]);
      return result[0] || {};
    } catch (error) {
      console.error('Error obteniendo estadísticas de la obra social:', error);
      throw error;
    }
  }

  // Obtener resumen para listado
  toListSummary() {
    return {
      id: this.id,
      nombre: this.nombre,
      codigo: this.codigo,
      descripcion: this.descripcion,
      telefono: this.telefono,
      email: this.email,
      contacto_telefono: this.telefono,  // Alias para el frontend
      contacto_email: this.email,        // Alias para el frontend
      sitio_web: this.sitio_web,
      activo: this.activo,
      pacientes_count: this.pacientes_count || 0
    };
  }
}

module.exports = ObraSocial;
