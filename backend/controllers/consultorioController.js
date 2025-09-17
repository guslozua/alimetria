const { executeQuery } = require('../config/database');

class ConsultorioController {
  // Obtener todos los consultorios
  async obtenerConsultorios(req, res) {
    try {
      const { activo = 'true', search } = req.query;
      
      let query = `
        SELECT c.*, COUNT(u.id) as total_usuarios
        FROM consultorios c
        LEFT JOIN usuarios u ON c.id = u.consultorio_id AND u.activo = TRUE
        WHERE 1=1
      `;
      const params = [];
      
      // Filtro por estado
      if (activo !== 'all') {
        query += ' AND c.activo = ?';
        params.push(activo === 'true' ? 1 : 0);
      }
      
      // Filtro de búsqueda
      if (search) {
        query += ' AND (c.nombre LIKE ? OR c.direccion LIKE ? OR c.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ' GROUP BY c.id ORDER BY c.nombre';
      
      const consultorios = await executeQuery(query, params);
      
      // Parsear configuración JSON si existe
      consultorios.forEach(consultorio => {
        if (consultorio.configuracion) {
          try {
            consultorio.configuracion = JSON.parse(consultorio.configuracion);
          } catch (error) {
            console.warn(`Error parseando configuración del consultorio ${consultorio.nombre}:`, error);
            consultorio.configuracion = {};
          }
        } else {
          consultorio.configuracion = {};
        }
      });
      
      res.json({
        success: true,
        data: consultorios
      });
    } catch (error) {
      console.error('Error obteniendo consultorios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener consultorio por ID
  async obtenerConsultorio(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT c.*, COUNT(u.id) as total_usuarios
        FROM consultorios c
        LEFT JOIN usuarios u ON c.id = u.consultorio_id AND u.activo = TRUE
        WHERE c.id = ?
        GROUP BY c.id
      `;
      
      const consultorios = await executeQuery(query, [id]);
      
      if (consultorios.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Consultorio no encontrado'
        });
      }
      
      const consultorio = consultorios[0];
      
      // Parsear configuración JSON
      if (consultorio.configuracion) {
        try {
          consultorio.configuracion = JSON.parse(consultorio.configuracion);
        } catch (error) {
          console.warn(`Error parseando configuración del consultorio ${consultorio.nombre}:`, error);
          consultorio.configuracion = {};
        }
      } else {
        consultorio.configuracion = {};
      }
      
      res.json({
        success: true,
        data: consultorio
      });
    } catch (error) {
      console.error('Error obteniendo consultorio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nuevo consultorio
  async crearConsultorio(req, res) {
    try {
      const { nombre, direccion, telefono, email, configuracion } = req.body;
      
      // Verificar permisos de admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear consultorios'
        });
      }
      
      // Validaciones
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del consultorio es obligatorio'
        });
      }
      
      // Validar email si se proporciona
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'El formato del email no es válido'
          });
        }
      }
      
      // Verificar que el nombre no existe
      const existeQuery = 'SELECT id FROM consultorios WHERE nombre = ?';
      const existe = await executeQuery(existeQuery, [nombre]);
      if (existe.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un consultorio con este nombre'
        });
      }
      
      // Preparar configuración JSON
      let configuracionJSON = null;
      if (configuracion) {
        try {
          configuracionJSON = JSON.stringify(configuracion);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'El formato de configuración no es válido'
          });
        }
      }
      
      // Crear consultorio
      const query = `
        INSERT INTO consultorios (nombre, direccion, telefono, email, configuracion)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        nombre,
        direccion || null,
        telefono || null,
        email || null,
        configuracionJSON
      ]);
      
      // Obtener el consultorio creado
      const consultorioCreado = await executeQuery('SELECT * FROM consultorios WHERE id = ?', [result.insertId]);
      const consultorio = consultorioCreado[0];
      
      // Parsear configuración para la respuesta
      if (consultorio.configuracion) {
        consultorio.configuracion = JSON.parse(consultorio.configuracion);
      }
      
      res.status(201).json({
        success: true,
        message: 'Consultorio creado exitosamente',
        data: consultorio
      });
    } catch (error) {
      console.error('Error creando consultorio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar consultorio
  async actualizarConsultorio(req, res) {
    try {
      const { id } = req.params;
      const { nombre, direccion, telefono, email, configuracion, activo } = req.body;
      
      // Verificar permisos de admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar consultorios'
        });
      }
      
      // Verificar que el consultorio existe
      const existeQuery = 'SELECT * FROM consultorios WHERE id = ?';
      const existe = await executeQuery(existeQuery, [id]);
      if (existe.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Consultorio no encontrado'
        });
      }
      
      const consultorioActual = existe[0];
      
      // Preparar campos para actualizar
      const campos = [];
      const valores = [];
      
      if (nombre !== undefined) {
        // Verificar que el nuevo nombre no existe (excepto el actual)
        if (nombre !== consultorioActual.nombre) {
          const nombreExiste = await executeQuery(
            'SELECT id FROM consultorios WHERE nombre = ? AND id != ?',
            [nombre, id]
          );
          if (nombreExiste.length > 0) {
            return res.status(400).json({
              success: false,
              message: 'Ya existe un consultorio con este nombre'
            });
          }
        }
        campos.push('nombre = ?');
        valores.push(nombre);
      }
      
      if (direccion !== undefined) {
        campos.push('direccion = ?');
        valores.push(direccion);
      }
      
      if (telefono !== undefined) {
        campos.push('telefono = ?');
        valores.push(telefono);
      }
      
      if (email !== undefined) {
        // Validar email si se proporciona
        if (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return res.status(400).json({
              success: false,
              message: 'El formato del email no es válido'
            });
          }
        }
        campos.push('email = ?');
        valores.push(email);
      }
      
      if (configuracion !== undefined) {
        let configuracionJSON = null;
        if (configuracion) {
          try {
            configuracionJSON = JSON.stringify(configuracion);
          } catch (error) {
            return res.status(400).json({
              success: false,
              message: 'El formato de configuración no es válido'
            });
          }
        }
        campos.push('configuracion = ?');
        valores.push(configuracionJSON);
      }
      
      if (activo !== undefined) {
        campos.push('activo = ?');
        valores.push(activo);
      }
      
      if (campos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
      }
      
      // Actualizar
      campos.push('fecha_actualizacion = NOW()');
      valores.push(id);
      
      const updateQuery = `UPDATE consultorios SET ${campos.join(', ')} WHERE id = ?`;
      await executeQuery(updateQuery, valores);
      
      // Obtener consultorio actualizado
      const consultorioActualizado = await executeQuery('SELECT * FROM consultorios WHERE id = ?', [id]);
      const consultorio = consultorioActualizado[0];
      
      // Parsear configuración para la respuesta
      if (consultorio.configuracion) {
        consultorio.configuracion = JSON.parse(consultorio.configuracion);
      }
      
      res.json({
        success: true,
        message: 'Consultorio actualizado exitosamente',
        data: consultorio
      });
    } catch (error) {
      console.error('Error actualizando consultorio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Desactivar/activar consultorio
  async toggleConsultorio(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar permisos de admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para activar/desactivar consultorios'
        });
      }
      
      // Verificar que el consultorio existe
      const existeQuery = 'SELECT * FROM consultorios WHERE id = ?';
      const existe = await executeQuery(existeQuery, [id]);
      if (existe.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Consultorio no encontrado'
        });
      }
      
      const consultorio = existe[0];
      
      // Si se va a desactivar, verificar que no sea el único activo
      if (consultorio.activo) {
        const consultoriosActivos = await executeQuery(
          'SELECT COUNT(*) as count FROM consultorios WHERE activo = TRUE'
        );
        
        if (consultoriosActivos[0].count <= 1) {
          return res.status(400).json({
            success: false,
            message: 'No se puede desactivar el único consultorio activo'
          });
        }
        
        // Verificar si hay usuarios asignados
        const usuariosAsignados = await executeQuery(
          'SELECT COUNT(*) as count FROM usuarios WHERE consultorio_id = ? AND activo = TRUE',
          [id]
        );
        
        if (usuariosAsignados[0].count > 0) {
          return res.status(400).json({
            success: false,
            message: `No se puede desactivar el consultorio porque tiene ${usuariosAsignados[0].count} usuario(s) asignado(s)`
          });
        }
      }
      
      // Cambiar estado
      const nuevoEstado = !consultorio.activo;
      const updateQuery = 'UPDATE consultorios SET activo = ?, fecha_actualizacion = NOW() WHERE id = ?';
      await executeQuery(updateQuery, [nuevoEstado, id]);
      
      res.json({
        success: true,
        message: `Consultorio ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
        data: { activo: nuevoEstado }
      });
    } catch (error) {
      console.error('Error cambiando estado del consultorio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener usuarios del consultorio
  async obtenerUsuarios(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que el consultorio existe
      const existeQuery = 'SELECT id FROM consultorios WHERE id = ?';
      const existe = await executeQuery(existeQuery, [id]);
      if (existe.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Consultorio no encontrado'
        });
      }
      
      const query = `
        SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.activo,
               u.ultimo_acceso, u.fecha_creacion,
               r.nombre as rol_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.consultorio_id = ?
        ORDER BY u.nombre, u.apellido
      `;
      
      const usuarios = await executeQuery(query, [id]);
      
      res.json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      console.error('Error obteniendo usuarios del consultorio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de consultorios
  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = {
        totalConsultorios: await executeQuery('SELECT COUNT(*) as count FROM consultorios WHERE activo = TRUE'),
        consultoriosInactivos: await executeQuery('SELECT COUNT(*) as count FROM consultorios WHERE activo = FALSE'),
        usuariosPorConsultorio: await executeQuery(`
          SELECT c.nombre, COUNT(u.id) as usuarios
          FROM consultorios c
          LEFT JOIN usuarios u ON c.id = u.consultorio_id AND u.activo = TRUE
          WHERE c.activo = TRUE
          GROUP BY c.id, c.nombre
          ORDER BY usuarios DESC
        `),
        pacientesPorConsultorio: await executeQuery(`
          SELECT c.nombre, COUNT(p.id) as pacientes
          FROM consultorios c
          LEFT JOIN pacientes p ON c.id = p.consultorio_id AND p.activo = TRUE
          WHERE c.activo = TRUE
          GROUP BY c.id, c.nombre
          ORDER BY pacientes DESC
        `)
      };
      
      res.json({
        success: true,
        data: {
          total: estadisticas.totalConsultorios[0].count,
          inactivos: estadisticas.consultoriosInactivos[0].count,
          distribucionUsuarios: estadisticas.usuariosPorConsultorio,
          distribucionPacientes: estadisticas.pacientesPorConsultorio
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de consultorios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new ConsultorioController();
