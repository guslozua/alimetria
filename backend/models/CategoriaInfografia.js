const { executeQuery } = require('../config/database');

class CategoriaInfografia {
  // Obtener todas las categorías activas
  static async getAll(activo = 1) {
    const query = `
      SELECT * FROM categorias_infografias 
      WHERE activo = ? 
      ORDER BY orden_visualizacion ASC
    `;
    
    const categorias = await executeQuery(query, [activo]);
    return categorias;
  }

  // Obtener una categoría por ID
  static async getById(id) {
    const query = 'SELECT * FROM categorias_infografias WHERE id = ? AND activo = 1';
    const categorias = await executeQuery(query, [id]);
    return categorias.length > 0 ? categorias[0] : null;
  }

  // Crear nueva categoría
  static async create(data) {
    const { nombre, descripcion, color, icono, orden_visualizacion } = data;
    
    const query = `
      INSERT INTO categorias_infografias (nombre, descripcion, color, icono, orden_visualizacion)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      nombre, 
      descripcion, 
      color || '#667eea', 
      icono || 'image', 
      orden_visualizacion || 0
    ]);
    
    return result.insertId;
  }

  // Actualizar categoría
  static async update(id, data) {
    const campos = [];
    const valores = [];
    
    if (data.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(data.descripcion);
    }
    if (data.color !== undefined) {
      campos.push('color = ?');
      valores.push(data.color);
    }
    if (data.icono !== undefined) {
      campos.push('icono = ?');
      valores.push(data.icono);
    }
    if (data.orden_visualizacion !== undefined) {
      campos.push('orden_visualizacion = ?');
      valores.push(data.orden_visualizacion);
    }
    
    if (campos.length === 0) return false;
    
    valores.push(id);
    
    const query = `UPDATE categorias_infografias SET ${campos.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, valores);
    
    return result.affectedRows > 0;
  }

  // Eliminar categoría (soft delete)
  static async delete(id) {
    const query = 'UPDATE categorias_infografias SET activo = 0 WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Obtener categoría con conteo de infografías
  static async getAllWithCount() {
    const query = `
      SELECT c.*, COUNT(i.id) as total_infografias
      FROM categorias_infografias c
      LEFT JOIN infografias i ON c.id = i.categoria_id AND i.activo = 1
      WHERE c.activo = 1
      GROUP BY c.id
      ORDER BY c.orden_visualizacion ASC
    `;
    
    const categorias = await executeQuery(query);
    return categorias;
  }
}

module.exports = CategoriaInfografia;
