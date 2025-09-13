const { executeQuery } = require('../config/database');

class Rol {
  constructor(data = {}) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.permisos = typeof data.permisos === 'string' ? JSON.parse(data.permisos) : data.permisos;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_actualizacion = data.fecha_actualizacion;
  }

  // Obtener todos los roles activos
  static async findAll() {
    try {
      const query = 'SELECT * FROM roles WHERE activo = TRUE ORDER BY nombre';
      const results = await executeQuery(query);
      return results.map(rol => new Rol(rol));
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      throw error;
    }
  }

  // Buscar rol por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM roles WHERE id = ? AND activo = TRUE';
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Rol(results[0]) : null;
    } catch (error) {
      console.error('Error buscando rol por ID:', error);
      throw error;
    }
  }

  // Buscar rol por nombre
  static async findByName(nombre) {
    try {
      const query = 'SELECT * FROM roles WHERE nombre = ? AND activo = TRUE';
      const results = await executeQuery(query, [nombre]);
      return results.length > 0 ? new Rol(results[0]) : null;
    } catch (error) {
      console.error('Error buscando rol por nombre:', error);
      throw error;
    }
  }

  // Verificar si el usuario tiene un permiso específico
  static hasPermission(userPermisos, modulo, accion) {
    try {
      if (!userPermisos || typeof userPermisos !== 'object') {
        return false;
      }

      // Si es administrador, tiene todos los permisos
      if (userPermisos.usuarios && userPermisos.usuarios.includes('eliminar')) {
        return true;
      }

      // Verificar permiso específico
      if (userPermisos[modulo] && Array.isArray(userPermisos[modulo])) {
        return userPermisos[modulo].includes(accion);
      }

      return false;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }

  // Obtener permisos por módulo
  getPermissionsByModule(modulo) {
    try {
      if (!this.permisos || typeof this.permisos !== 'object') {
        return [];
      }

      return this.permisos[modulo] || [];
    } catch (error) {
      console.error('Error obteniendo permisos por módulo:', error);
      return [];
    }
  }

  // Verificar si tiene permiso específico
  hasPermission(modulo, accion) {
    return Rol.hasPermission(this.permisos, modulo, accion);
  }

  // Crear nuevo rol
  static async create(rolData) {
    try {
      const query = `
        INSERT INTO roles (nombre, descripcion, permisos)
        VALUES (?, ?, ?)
      `;
      const permisosJson = JSON.stringify(rolData.permisos || {});
      const values = [rolData.nombre, rolData.descripcion, permisosJson];
      
      const result = await executeQuery(query, values);
      return await Rol.findById(result.insertId);
    } catch (error) {
      console.error('Error creando rol:', error);
      throw error;
    }
  }

  // Actualizar rol
  async update(updateData) {
    try {
      const fields = [];
      const values = [];

      if (updateData.descripcion !== undefined) {
        fields.push('descripcion = ?');
        values.push(updateData.descripcion);
      }

      if (updateData.permisos !== undefined) {
        fields.push('permisos = ?');
        values.push(JSON.stringify(updateData.permisos));
      }

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(this.id);
      const query = `UPDATE roles SET ${fields.join(', ')}, fecha_actualizacion = NOW() WHERE id = ?`;
      
      await executeQuery(query, values);
      return await Rol.findById(this.id);
    } catch (error) {
      console.error('Error actualizando rol:', error);
      throw error;
    }
  }

  // Obtener usuarios con este rol
  async getUsers() {
    try {
      const query = `
        SELECT u.*, c.nombre as consultorio_nombre
        FROM usuarios u
        LEFT JOIN consultorios c ON u.consultorio_id = c.id
        WHERE u.rol_id = ? AND u.activo = TRUE
        ORDER BY u.nombre, u.apellido
      `;
      const results = await executeQuery(query, [this.id]);
      return results;
    } catch (error) {
      console.error('Error obteniendo usuarios del rol:', error);
      throw error;
    }
  }

  // Validar estructura de permisos
  static validatePermissions(permisos) {
    const validModules = [
      'usuarios', 'pacientes', 'mediciones', 'reportes', 
      'citas', 'configuraciones', 'perfil_propio', 
      'mediciones_propias', 'citas_propias'
    ];
    
    const validActions = ['crear', 'leer', 'actualizar', 'eliminar', 'exportar'];

    try {
      if (!permisos || typeof permisos !== 'object') {
        return { valid: false, error: 'Los permisos deben ser un objeto' };
      }

      for (const [modulo, acciones] of Object.entries(permisos)) {
        if (!validModules.includes(modulo)) {
          return { valid: false, error: `Módulo no válido: ${modulo}` };
        }

        if (!Array.isArray(acciones)) {
          return { valid: false, error: `Las acciones del módulo ${modulo} deben ser un array` };
        }

        for (const accion of acciones) {
          if (!validActions.includes(accion)) {
            return { valid: false, error: `Acción no válida: ${accion} en módulo ${modulo}` };
          }
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Error validando permisos: ' + error.message };
    }
  }

  // Métodos para verificar roles específicos
  isAdmin() {
    return this.nombre === 'administrador';
  }

  isNutricionista() {
    return this.nombre === 'nutricionista';
  }

  isSecretario() {
    return this.nombre === 'secretario';
  }

  isPaciente() {
    return this.nombre === 'paciente';
  }
}

module.exports = Rol;
