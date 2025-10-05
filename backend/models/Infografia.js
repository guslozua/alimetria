const { executeQuery } = require('../config/database');

class Infografia {
  // Obtener todas las infografías con filtros
  static async getAll(filtros = {}) {
    const { categoria_id, busqueda, activo, limite = 50, offset = 0 } = filtros;
    
    let query = `
      SELECT i.*, c.nombre as categoria_nombre, c.color as categoria_color, c.icono as categoria_icono
      FROM infografias i
      LEFT JOIN categorias_infografias c ON i.categoria_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtro de activo (opcional - si no se especifica, trae todas)
    if (activo !== undefined) {
      query += ' AND i.activo = ?';
      params.push(activo);
    }
    
    // Filtro por categoría
    if (categoria_id) {
      query += ' AND i.categoria_id = ?';
      params.push(categoria_id);
    }
    
    // Búsqueda por título o descripción
    if (busqueda) {
      query += ' AND (i.titulo LIKE ? OR i.descripcion LIKE ? OR i.autor LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY i.fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(limite, offset);
    
    const infografias = await executeQuery(query, params);
    
    // Parsear tags JSON
    return infografias.map(inf => ({
      ...inf,
      tags: inf.tags ? JSON.parse(inf.tags) : []
    }));
  }

  // Obtener una infografía por ID (incluye inactivas para admin)
  static async getById(id, incluirInactivas = false) {
    let query = `
      SELECT i.*, c.nombre as categoria_nombre, c.color as categoria_color, c.icono as categoria_icono
      FROM infografias i
      LEFT JOIN categorias_infografias c ON i.categoria_id = c.id
      WHERE i.id = ?
    `;
    
    // Solo filtrar por activo si no se solicitan las inactivas
    if (!incluirInactivas) {
      query += ' AND i.activo = 1';
    }
    
    const infografias = await executeQuery(query, [id]);
    
    if (infografias.length === 0) return null;
    
    const infografia = infografias[0];
    infografia.tags = infografia.tags ? JSON.parse(infografia.tags) : [];
    
    return infografia;
  }

  // Crear nueva infografía
  static async create(data) {
    const {
      titulo,
      descripcion,
      categoria_id,
      tags = [],
      ruta_archivo,
      nombre_archivo,
      tipo_archivo,
      tamaño,
      autor,
      usuario_id
    } = data;
    
    const query = `
      INSERT INTO infografias (
        titulo, descripcion, categoria_id, tags, ruta_archivo, 
        nombre_archivo, tipo_archivo, tamaño, autor, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const tagsJSON = JSON.stringify(tags);
    
    const result = await executeQuery(query, [
      titulo, descripcion, categoria_id, tagsJSON, ruta_archivo,
      nombre_archivo, tipo_archivo, tamaño, autor, usuario_id
    ]);
    
    return result.insertId;
  }

  // Actualizar infografía
  static async update(id, data) {
    const campos = [];
    const valores = [];
    
    if (data.titulo !== undefined) {
      campos.push('titulo = ?');
      valores.push(data.titulo);
    }
    if (data.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(data.descripcion);
    }
    if (data.categoria_id !== undefined) {
      campos.push('categoria_id = ?');
      valores.push(data.categoria_id);
    }
    if (data.tags !== undefined) {
      campos.push('tags = ?');
      valores.push(JSON.stringify(data.tags));
    }
    if (data.autor !== undefined) {
      campos.push('autor = ?');
      valores.push(data.autor);
    }
    if (data.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(data.activo);
      // Si se desactiva, actualizar fecha_eliminacion
      if (data.activo === 0) {
        campos.push('fecha_eliminacion = NOW()');
      } else {
        campos.push('fecha_eliminacion = NULL');
      }
    }
    
    if (campos.length === 0) return false;
    
    valores.push(id);
    
    const query = `UPDATE infografias SET ${campos.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, valores);
    
    return result.affectedRows > 0;
  }

  // Eliminar infografía (soft delete)
  static async delete(id) {
    const query = 'UPDATE infografias SET activo = 0, fecha_eliminacion = NOW() WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Incrementar contador de descargas
  static async incrementarDescargas(id) {
    const query = 'UPDATE infografias SET descargas = descargas + 1 WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Obtener estadísticas
  static async getEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(descargas) as total_descargas,
        c.nombre as categoria,
        COUNT(i.id) as count_categoria
      FROM infografias i
      LEFT JOIN categorias_infografias c ON i.categoria_id = c.id
      WHERE i.activo = 1
      GROUP BY c.id, c.nombre
    `;
    
    const stats = await executeQuery(query);
    return stats;
  }

  // Buscar por tags
  static async searchByTags(tags) {
    const query = `
      SELECT i.*, c.nombre as categoria_nombre, c.color as categoria_color
      FROM infografias i
      LEFT JOIN categorias_infografias c ON i.categoria_id = c.id
      WHERE i.activo = 1
    `;
    
    const infografias = await executeQuery(query);
    
    // Filtrar por tags en memoria (JSON)
    const resultados = infografias.filter(inf => {
      const infTags = inf.tags ? JSON.parse(inf.tags) : [];
      return tags.some(tag => infTags.includes(tag));
    });
    
    return resultados.map(inf => ({
      ...inf,
      tags: inf.tags ? JSON.parse(inf.tags) : []
    }));
  }
}

module.exports = Infografia;
