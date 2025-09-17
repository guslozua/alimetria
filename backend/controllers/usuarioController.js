const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const Usuario = require('../models/Usuario');

class UsuarioController {
  // Obtener todos los usuarios
  async obtenerUsuarios(req, res) {
    try {
      const { rol_id, consultorio_id, activo = 'true', page = 1, limit = 10, search = '' } = req.query;
      
      let query = `
        SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.foto_perfil,
               u.activo, u.ultimo_acceso, u.fecha_creacion, u.fecha_actualizacion,
               r.nombre as rol_nombre, r.id as rol_id,
               c.nombre as consultorio_nombre, c.id as consultorio_id
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN consultorios c ON u.consultorio_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Filtros
      if (activo !== 'all') {
        query += ` AND u.activo = ?`;
        params.push(activo === 'true' ? 1 : 0);
      }
      
      if (rol_id) {
        query += ` AND u.rol_id = ?`;
        params.push(rol_id);
      }
      
      if (consultorio_id) {
        query += ` AND u.consultorio_id = ?`;
        params.push(consultorio_id);
      }
      
      if (search) {
        query += ` AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Contar total
      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;
      
      // Paginación
      query += ` ORDER BY u.nombre, u.apellido LIMIT ? OFFSET ?`;
      const offset = (page - 1) * limit;
      params.push(parseInt(limit), parseInt(offset));
      
      const usuarios = await executeQuery(query, params);
      
      res.json({
        success: true,
        data: usuarios,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener usuario por ID
  async obtenerUsuario(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT u.*, r.nombre as rol_nombre, c.nombre as consultorio_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN consultorios c ON u.consultorio_id = c.id
        WHERE u.id = ?
      `;
      
      const usuarios = await executeQuery(query, [id]);
      
      if (usuarios.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // No enviar la contraseña
      const { password, ...usuarioSinPassword } = usuarios[0];
      
      res.json({
        success: true,
        data: usuarioSinPassword
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nuevo usuario
  async crearUsuario(req, res) {
    try {
      const { nombre, apellido, email, password, telefono, rol_id, consultorio_id } = req.body;
      
      // Validaciones
      if (!nombre || !apellido || !email || !password || !rol_id) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, apellido, email, contraseña y rol son obligatorios'
        });
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'El formato del email no es válido'
        });
      }
      
      // Validar contraseña (mínimo 6 caracteres)
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }
      
      // Verificar si el email ya existe
      const emailExiste = await Usuario.emailExists(email);
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este email'
        });
      }
      
      // Verificar que el rol existe
      const rolQuery = 'SELECT id FROM roles WHERE id = ? AND activo = TRUE';
      const roles = await executeQuery(rolQuery, [rol_id]);
      if (roles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El rol especificado no existe o no está activo'
        });
      }
      
      // Verificar que el consultorio existe (si se proporciona)
      if (consultorio_id) {
        const consultorioQuery = 'SELECT id FROM consultorios WHERE id = ? AND activo = TRUE';
        const consultorios = await executeQuery(consultorioQuery, [consultorio_id]);
        if (consultorios.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'El consultorio especificado no existe o no está activo'
          });
        }
      }
      
      // Encriptar contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Crear usuario
      const userData = {
        nombre,
        apellido,
        email,
        password: hashedPassword,
        telefono: telefono || null,
        rol_id,
        consultorio_id: consultorio_id || null
      };
      
      const nuevoUsuario = await Usuario.create(userData);
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: nuevoUsuario.toSafeObject()
      });
    } catch (error) {
      console.error('Error creando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar usuario
  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, telefono, rol_id, consultorio_id, activo } = req.body;
      
      // Verificar que el usuario existe
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Preparar datos para actualizar
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (apellido !== undefined) updateData.apellido = apellido;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (activo !== undefined) updateData.activo = activo;
      
      // Actualizar rol si se proporciona
      if (rol_id !== undefined) {
        const rolQuery = 'SELECT id FROM roles WHERE id = ? AND activo = TRUE';
        const roles = await executeQuery(rolQuery, [rol_id]);
        if (roles.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'El rol especificado no existe o no está activo'
          });
        }
        updateData.rol_id = rol_id;
      }
      
      // Actualizar consultorio si se proporciona
      if (consultorio_id !== undefined) {
        if (consultorio_id) {
          const consultorioQuery = 'SELECT id FROM consultorios WHERE id = ? AND activo = TRUE';
          const consultorios = await executeQuery(consultorioQuery, [consultorio_id]);
          if (consultorios.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'El consultorio especificado no existe o no está activo'
            });
          }
        }
        updateData.consultorio_id = consultorio_id;
      }
      
      // Actualizar en la base de datos
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(field => {
        fields.push(`${field} = ?`);
        values.push(updateData[field]);
      });
      
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
      }
      
      values.push(id);
      const updateQuery = `UPDATE usuarios SET ${fields.join(', ')}, fecha_actualizacion = NOW() WHERE id = ?`;
      await executeQuery(updateQuery, values);
      
      // Obtener usuario actualizado
      const usuarioActualizado = await Usuario.findById(id);
      
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado.toSafeObject()
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Cambiar contraseña
  async cambiarPassword(req, res) {
    try {
      const { id } = req.params;
      const { password_actual, password_nuevo } = req.body;
      
      // Validaciones
      if (!password_actual || !password_nuevo) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere la contraseña actual y la nueva contraseña'
        });
      }
      
      if (password_nuevo.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }
      
      // Obtener usuario con contraseña
      const query = 'SELECT * FROM usuarios WHERE id = ? AND activo = TRUE';
      const usuarios = await executeQuery(query, [id]);
      
      if (usuarios.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      const usuario = usuarios[0];
      
      // Verificar contraseña actual
      const passwordValida = await bcrypt.compare(password_actual, usuario.password);
      if (!passwordValida) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña actual no es correcta'
        });
      }
      
      // Encriptar nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password_nuevo, saltRounds);
      
      // Actualizar contraseña
      const updateQuery = 'UPDATE usuarios SET password = ?, fecha_actualizacion = NOW() WHERE id = ?';
      await executeQuery(updateQuery, [hashedPassword, id]);
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Resetear contraseña (solo admin)
  async resetearPassword(req, res) {
    try {
      const { id } = req.params;
      const { password_nueva } = req.body;
      
      // Verificar que quien hace la petición es admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para resetear contraseñas'
        });
      }
      
      // Validaciones
      if (!password_nueva) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere la nueva contraseña'
        });
      }
      
      if (password_nueva.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }
      
      // Verificar que el usuario existe
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Encriptar nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password_nueva, saltRounds);
      
      // Actualizar contraseña
      const updateQuery = 'UPDATE usuarios SET password = ?, fecha_actualizacion = NOW() WHERE id = ?';
      await executeQuery(updateQuery, [hashedPassword, id]);
      
      res.json({
        success: true,
        message: 'Contraseña reseteada exitosamente'
      });
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Desactivar/activar usuario
  async toggleUsuario(req, res) {
    try {
      const { id } = req.params;
      
      // 🚨 CORRECCIÓN: Buscar usuario sin filtrar por estado activo
      // Consulta SQL directa que encuentra activos e inactivos
      const query = `
        SELECT u.*, r.nombre as rol_nombre, c.nombre as consultorio_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN consultorios c ON u.consultorio_id = c.id
        WHERE u.id = ?
      `;
      
      const usuarios = await executeQuery(query, [id]);
      
      if (usuarios.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      const usuario = usuarios[0];
      
      // No permitir desactivar el propio usuario
      if (parseInt(usuario.id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar tu propio usuario'
        });
      }
      
      // Cambiar estado (convertir tinyint a boolean para la comparación)
      const estadoActual = usuario.activo === 1 || usuario.activo === true;
      const nuevoEstado = !estadoActual;
      
      console.log(`🔄 Toggling usuario ID ${id}: ${estadoActual} -> ${nuevoEstado}`);
      
      const updateQuery = 'UPDATE usuarios SET activo = ?, fecha_actualizacion = NOW() WHERE id = ?';
      await executeQuery(updateQuery, [nuevoEstado, id]);
      
      res.json({
        success: true,
        message: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
        data: { activo: nuevoEstado }
      });
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de usuarios
  async obtenerEstadisticas(req, res) {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM usuarios',  // Todos los usuarios sin filtro de activo
        activos: 'SELECT COUNT(*) as count FROM usuarios WHERE activo = TRUE',
        inactivos: 'SELECT COUNT(*) as count FROM usuarios WHERE activo = FALSE',
        porRol: `
          SELECT r.nombre as rol, COUNT(u.id) as count
          FROM roles r
          LEFT JOIN usuarios u ON u.rol_id = r.id AND u.activo = TRUE
          WHERE r.activo = TRUE
          GROUP BY r.id, r.nombre
          ORDER BY count DESC
        `,
        porConsultorio: `
          SELECT c.nombre as consultorio, COUNT(u.id) as count
          FROM consultorios c
          LEFT JOIN usuarios u ON u.consultorio_id = c.id AND u.activo = TRUE
          WHERE c.activo = TRUE
          GROUP BY c.id, c.nombre
          ORDER BY count DESC
        `,
        recientes: `
          SELECT u.nombre, u.apellido, u.email, r.nombre as rol, u.fecha_creacion
          FROM usuarios u
          LEFT JOIN roles r ON u.rol_id = r.id
          WHERE u.activo = TRUE
          ORDER BY u.fecha_creacion DESC
          LIMIT 5
        `
      };
      
      const resultados = {};
      
      // Ejecutar todas las consultas
      for (const [key, query] of Object.entries(queries)) {
        const result = await executeQuery(query);
        if (key === 'total' || key === 'activos' || key === 'inactivos') {
          resultados[key] = result[0].count;
        } else {
          resultados[key] = result;
        }
      }
      
      res.json({
        success: true,
        data: resultados
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar usuario (desactivacion logica)
  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que el usuario existe
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // No permitir eliminar el propio usuario
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu propio usuario'
        });
      }
      
      // Desactivar usuario (eliminacion logica) en lugar de eliminacion fisica
      await executeQuery('UPDATE usuarios SET activo = FALSE, fecha_actualizacion = NOW() WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Usuario eliminado correctamente (desactivado)',
        data: { id, activo: false }
      });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new UsuarioController();
