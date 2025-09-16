const { executeQuery } = require('../config/database');

class Usuario {
  constructor(data = {}) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.email = data.email;
    this.password = data.password;
    this.telefono = data.telefono;
    this.foto_perfil = data.foto_perfil;
    this.rol_id = data.rol_id;
    this.consultorio_id = data.consultorio_id;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.ultimo_acceso = data.ultimo_acceso;
    this.configuraciones = data.configuraciones;
    
    // Agregar campos de JOIN que estaban faltando
    this.rol_nombre = data.rol_nombre;
    this.permisos = data.permisos;
    this.consultorio_nombre = data.consultorio_nombre;
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const query = `
        SELECT u.*, r.nombre as rol_nombre, r.permisos, c.nombre as consultorio_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN consultorios c ON u.consultorio_id = c.id
        WHERE u.email = ? AND u.activo = TRUE
      `;
      const results = await executeQuery(query, [email]);
      if (results.length > 0) {
        const userData = results[0];
        // Asegurar que rol_nombre esté disponible
        if (!userData.rol_nombre && userData.permisos) {
          // Si no hay rol_nombre pero hay permisos, extraer del JSON
          const permisos = typeof userData.permisos === 'string' ? JSON.parse(userData.permisos) : userData.permisos;
          if (permisos.usuarios && permisos.usuarios.includes('eliminar')) {
            userData.rol_nombre = 'administrador';
          }
        }
        return new Usuario(userData);
      }
      return null;
    } catch (error) {
      console.error('Error buscando usuario por email:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      // Validar que el ID no sea undefined o null
      if (!id || id === undefined) {
        console.warn('❌ findById llamado con ID inválido:', id);
        return null;
      }
      
      const query = `
        SELECT u.*, r.nombre as rol_nombre, r.permisos, c.nombre as consultorio_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN consultorios c ON u.consultorio_id = c.id
        WHERE u.id = ? AND u.activo = TRUE
      `;
      const results = await executeQuery(query, [id]);
      if (results.length > 0) {
        const userData = results[0];
        // Asegurar que rol_nombre esté disponible
        if (!userData.rol_nombre && userData.permisos) {
          const permisos = typeof userData.permisos === 'string' ? JSON.parse(userData.permisos) : userData.permisos;
          if (permisos.usuarios && permisos.usuarios.includes('eliminar')) {
            userData.rol_nombre = 'administrador';
          }
        }
        return new Usuario(userData);
      }
      return null;
    } catch (error) {
      console.error('Error buscando usuario por ID:', error);
      throw error;
    }
  }

  // Crear nuevo usuario
  static async create(userData) {
    try {
      const query = `
        INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id, consultorio_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        userData.nombre,
        userData.apellido,
        userData.email,
        userData.password,
        userData.telefono || null,
        userData.rol_id,
        userData.consultorio_id || null
      ];
      
      const result = await executeQuery(query, values);
      return await Usuario.findById(result.insertId);
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  // Actualizar último acceso
  static async updateLastAccess(userId) {
    try {
      const query = 'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?';
      await executeQuery(query, [userId]);
    } catch (error) {
      console.error('Error actualizando último acceso:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT u.*, r.nombre as rol_nombre, c.nombre as consultorio_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN consultorios c ON u.consultorio_id = c.id
        WHERE u.activo = TRUE
      `;
      const values = [];

      if (filters.rol_id) {
        query += ' AND u.rol_id = ?';
        values.push(filters.rol_id);
      }

      if (filters.consultorio_id) {
        query += ' AND u.consultorio_id = ?';
        values.push(filters.consultorio_id);
      }

      query += ' ORDER BY u.nombre, u.apellido';

      const results = await executeQuery(query, values);
      return results.map(user => new Usuario(user));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  // Verificar si email ya existe
  static async emailExists(email, excludeId = null) {
    try {
      let query = 'SELECT id FROM usuarios WHERE email = ? AND activo = TRUE';
      const values = [email];

      if (excludeId) {
        query += ' AND id != ?';
        values.push(excludeId);
      }

      const results = await executeQuery(query, values);
      return results.length > 0;
    } catch (error) {
      console.error('Error verificando email:', error);
      throw error;
    }
  }

  // Actualizar usuario
  async update(updateData) {
    try {
      const fields = [];
      const values = [];

      // Campos que se pueden actualizar
      const allowedFields = ['nombre', 'apellido', 'telefono', 'foto_perfil', 'configuraciones'];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(this.id);
      const query = `UPDATE usuarios SET ${fields.join(', ')}, fecha_actualizacion = NOW() WHERE id = ?`;
      
      await executeQuery(query, values);
      return await Usuario.findById(this.id);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  // Desactivar usuario (soft delete)
  async deactivate() {
    try {
      const query = 'UPDATE usuarios SET activo = FALSE, fecha_actualizacion = NOW() WHERE id = ?';
      await executeQuery(query, [this.id]);
      this.activo = false;
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      throw error;
    }
  }

  // Método para obtener datos sin información sensible
  toSafeObject() {
    const { password, ...safeUser } = this;
    
    // Asegurar que rol_nombre esté disponible
    if (!safeUser.rol_nombre) {
      // Fallback basado en email para admin
      if (safeUser.email === 'admin@alimetria.com') {
        safeUser.rol_nombre = 'administrador';
      } else if (safeUser.permisos) {
        // Intentar determinar rol por permisos
        try {
          const permisos = typeof safeUser.permisos === 'string' ? JSON.parse(safeUser.permisos) : safeUser.permisos;
          if (permisos.usuarios && permisos.usuarios.includes('eliminar')) {
            safeUser.rol_nombre = 'administrador';
          } else if (permisos.mediciones && permisos.mediciones.includes('crear')) {
            safeUser.rol_nombre = 'nutricionista';
          } else if (permisos.pacientes && permisos.pacientes.includes('crear')) {
            safeUser.rol_nombre = 'secretario';
          } else {
            safeUser.rol_nombre = 'paciente';
          }
        } catch (error) {
          console.log('Error parseando permisos en toSafeObject:', error);
          safeUser.rol_nombre = 'paciente'; // Rol por defecto
        }
      } else {
        safeUser.rol_nombre = 'paciente'; // Rol por defecto
      }
    }
    
    return safeUser;
  }
}

module.exports = Usuario;
