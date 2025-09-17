const { executeQuery } = require('../config/database');

class RolController {
  // Obtener todos los roles
  async obtenerRoles(req, res) {
    try {
      const { incluir_permisos = 'true', activo = 'all' } = req.query;
      
      let query = `
        SELECT r.*, 
               COUNT(u.id) as usuarios_count
        FROM roles r
        LEFT JOIN usuarios u ON r.id = u.rol_id AND u.activo = TRUE
      `;
      
      const params = [];
      
      // Filtro por estado activo
      if (activo === 'true' || activo === '1') {
        query += ' WHERE r.activo = TRUE';
      } else if (activo === 'false' || activo === '0') {
        query += ' WHERE r.activo = FALSE';
      }
      // Si activo === 'all', no agregamos filtro
      
      query += ' GROUP BY r.id ORDER BY r.nombre';
      
      const roles = await executeQuery(query, params);
      
      // Procesar permisos si se solicita
      const rolesConPermisos = roles.map(rol => {
        let rolProcesado = { ...rol };
        
        if (incluir_permisos === 'true' && rol.permisos) {
          try {
            rolProcesado.permisos = typeof rol.permisos === 'string' 
              ? JSON.parse(rol.permisos) 
              : rol.permisos;
          } catch (error) {
            console.error('Error parseando permisos del rol:', rol.id, error);
            rolProcesado.permisos = {};
          }
        }
        
        return rolProcesado;
      });
      
      res.json({
        success: true,
        data: rolesConPermisos
      });
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener rol por ID
  async obtenerRol(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT r.*, 
               COUNT(u.id) as usuarios_count
        FROM roles r
        LEFT JOIN usuarios u ON r.id = u.rol_id AND u.activo = TRUE
        WHERE r.id = ?
        GROUP BY r.id
      `;
      
      const roles = await executeQuery(query, [id]);
      
      if (roles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }
      
      let rol = roles[0];
      
      // Procesar permisos
      if (rol.permisos) {
        try {
          rol.permisos = typeof rol.permisos === 'string' 
            ? JSON.parse(rol.permisos) 
            : rol.permisos;
        } catch (error) {
          console.error('Error parseando permisos:', error);
          rol.permisos = {};
        }
      }
      
      res.json({
        success: true,
        data: rol
      });
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nuevo rol
  async crearRol(req, res) {
    try {
      const { nombre, descripcion, permisos, activo = true } = req.body;
      
      // Validaciones
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del rol es obligatorio'
        });
      }
      
      if (!descripcion || !descripcion.trim()) {
        return res.status(400).json({
          success: false,
          message: 'La descripción del rol es obligatoria'
        });
      }
      
      // Verificar que el nombre del rol no exista
      const existeQuery = 'SELECT id FROM roles WHERE nombre = ?';
      const existe = await executeQuery(existeQuery, [nombre.toLowerCase().trim()]);
      
      if (existe.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un rol con ese nombre'
        });
      }
      
      // Preparar permisos como JSON
      const permisosJson = JSON.stringify(permisos || {});
      
      // Crear rol
      const insertQuery = `
        INSERT INTO roles (nombre, descripcion, permisos, activo)
        VALUES (?, ?, ?, ?)
      `;
      
      const resultado = await executeQuery(insertQuery, [
        nombre.toLowerCase().trim(),
        descripcion.trim(),
        permisosJson,
        activo
      ]);
      
      // Obtener rol creado
      const rolCreado = await executeQuery(
        'SELECT * FROM roles WHERE id = ?',
        [resultado.insertId]
      );
      
      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: rolCreado[0]
      });
    } catch (error) {
      console.error('Error creando rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar rol
  async actualizarRol(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, permisos, activo } = req.body;
      
      // Verificar que el rol existe
      const rolExiste = await executeQuery('SELECT * FROM roles WHERE id = ?', [id]);
      
      if (rolExiste.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }
      
      const rolActual = rolExiste[0];
      
      // No permitir modificar el rol administrador excepto permisos
      if (rolActual.nombre === 'administrador' && nombre && nombre !== 'administrador') {
        return res.status(400).json({
          success: false,
          message: 'No se puede cambiar el nombre del rol administrador'
        });
      }
      
      // Preparar campos a actualizar
      const updateData = {};
      if (nombre !== undefined && nombre.trim() !== '') {
        // Verificar nombre único (excepto el actual)
        const nombreExiste = await executeQuery(
          'SELECT id FROM roles WHERE nombre = ? AND id != ?',
          [nombre.toLowerCase().trim(), id]
        );
        
        if (nombreExiste.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un rol con ese nombre'
          });
        }
        
        updateData.nombre = nombre.toLowerCase().trim();
      }
      
      if (descripcion !== undefined) updateData.descripcion = descripcion.trim();
      if (activo !== undefined) updateData.activo = activo;
      if (permisos !== undefined) updateData.permisos = JSON.stringify(permisos);
      
      // Construir query de actualización
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
      const updateQuery = `UPDATE roles SET ${fields.join(', ')}, fecha_actualizacion = NOW() WHERE id = ?`;
      await executeQuery(updateQuery, values);
      
      // Obtener rol actualizado
      const rolActualizado = await executeQuery('SELECT * FROM roles WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: rolActualizado[0]
      });
    } catch (error) {
      console.error('Error actualizando rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Toggle activo/inactivo
  async toggleRol(req, res) {
    try {
      const { id } = req.params;
      
      // Buscar rol sin filtrar por estado activo
      const query = 'SELECT * FROM roles WHERE id = ?';
      const roles = await executeQuery(query, [id]);
      
      if (roles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }
      
      const rol = roles[0];
      
      // No permitir desactivar rol administrador
      if (rol.nombre === 'administrador' && rol.activo === 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede desactivar el rol administrador'
        });
      }
      
      // Verificar si hay usuarios asignados antes de desactivar
      if (rol.activo === 1) {
        const usuariosQuery = 'SELECT COUNT(*) as count FROM usuarios WHERE rol_id = ? AND activo = TRUE';
        const usuariosResult = await executeQuery(usuariosQuery, [id]);
        const usuariosCount = usuariosResult[0].count;
        
        if (usuariosCount > 0) {
          return res.status(400).json({
            success: false,
            message: `No se puede desactivar el rol porque tiene ${usuariosCount} usuario(s) asignado(s)`
          });
        }
      }
      
      // Alternar estado
      const estadoActual = rol.activo === 1;
      const nuevoEstado = !estadoActual;
      
      const updateQuery = 'UPDATE roles SET activo = ?, fecha_actualizacion = NOW() WHERE id = ?';
      await executeQuery(updateQuery, [nuevoEstado, id]);
      
      res.json({
        success: true,
        message: `Rol ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
        data: { activo: nuevoEstado }
      });
    } catch (error) {
      console.error('Error cambiando estado del rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de roles
  async obtenerEstadisticas(req, res) {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM roles',
        activos: 'SELECT COUNT(*) as count FROM roles WHERE activo = TRUE',
        inactivos: 'SELECT COUNT(*) as count FROM roles WHERE activo = FALSE',
        conUsuarios: `
          SELECT COUNT(DISTINCT r.id) as count 
          FROM roles r 
          JOIN usuarios u ON r.id = u.rol_id 
          WHERE r.activo = TRUE AND u.activo = TRUE
        `,
        totalUsuarios: `
          SELECT COUNT(*) as count 
          FROM usuarios u 
          JOIN roles r ON u.rol_id = r.id 
          WHERE u.activo = TRUE AND r.activo = TRUE
        `
      };
      
      const resultados = {};
      
      for (const [key, query] of Object.entries(queries)) {
        const result = await executeQuery(query);
        resultados[key] = result[0].count;
      }
      
      res.json({
        success: true,
        data: resultados
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new RolController();