/**
 * Middleware para verificar permisos específicos de usuarios
 */

const verificarPermisos = (permisosRequeridos) => {
  return (req, res, next) => {
    try {
      // El usuario viene del middleware de auth
      const { user } = req;
      
      if (!user) {
        return res.status(401).json({ 
          mensaje: 'Token de autenticación requerido' 
        });
      }

      // Los administradores tienen acceso a todo
      if (user.rol === 'administrador' || user.rol_nombre === 'administrador') {
        return next();
      }

      // Verificar permisos específicos según rol
      const tienePermiso = verificarPermisosPorRol(user.rol || user.rol_nombre, permisosRequeridos);
      
      if (!tienePermiso) {
        return res.status(403).json({ 
          mensaje: 'No tiene permisos suficientes para realizar esta acción',
          permisosRequeridos,
          rolUsuario: user.rol || user.rol_nombre
        });
      }

      next();
    } catch (error) {
      console.error('Error en verificación de permisos:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor' 
      });
    }
  };
};

/**
 * Verificar si un rol tiene los permisos requeridos
 */
const verificarPermisosPorRol = (rol, permisosRequeridos) => {
  // Definición de permisos por rol
  const permisosPorRol = {
    administrador: ['*'], // Todos los permisos
    nutricionista: [
      'pacientes', 'mediciones', 'reportes', 'citas', 'obras_sociales',
      'ver_pacientes', 'crear_pacientes', 'editar_pacientes',
      'ver_mediciones', 'crear_mediciones', 'editar_mediciones',
      'ver_reportes', 'generar_reportes',
      'ver_citas', 'crear_citas', 'editar_citas',
      'ver_obras_sociales'
    ],
    secretario: [
      'pacientes', 'citas', 'obras_sociales',
      'ver_pacientes', 'crear_pacientes', 'editar_pacientes',
      'ver_citas', 'crear_citas', 'editar_citas',
      'ver_obras_sociales'
    ],
    paciente: [
      'ver_perfil_propio', 'ver_mediciones_propias', 'ver_citas_propias'
    ]
  };

  const permisosDelRol = permisosPorRol[rol] || [];
  
  // Si tiene permiso universal (*)
  if (permisosDelRol.includes('*')) {
    return true;
  }

  // Verificar si tiene todos los permisos requeridos
  return permisosRequeridos.every(permiso => 
    permisosDelRol.includes(permiso)
  );
};

/**
 * Middleware específico para requerir permisos de administrador
 */
const requireAdmin = (req, res, next) => {
  const { user } = req;
  
  if (!user) {
    return res.status(401).json({ 
      mensaje: 'Autenticación requerida' 
    });
  }

  // Solo administradores pueden acceder
  if (user.rol !== 'administrador' && user.rol_nombre !== 'administrador') {
    return res.status(403).json({ 
      mensaje: 'Solo administradores pueden realizar esta acción' 
    });
  }

  next();
};

/**
 * Middleware específico para verificar si puede acceder a reportes
 */
const verificarAccesoReportes = (req, res, next) => {
  const { user } = req;
  
  if (!user) {
    return res.status(401).json({ 
      mensaje: 'Autenticación requerida' 
    });
  }

  // Solo administradores y nutricionistas pueden acceder a reportes
  const rol = user.rol || user.rol_nombre;
  if (!['administrador', 'nutricionista'].includes(rol)) {
    return res.status(403).json({ 
      mensaje: 'Solo administradores y nutricionistas pueden acceder a reportes' 
    });
  }

  next();
};

/**
 * Middleware para verificar si puede acceder a datos de un paciente específico
 */
const verificarAccesoPaciente = (req, res, next) => {
  const { user } = req;
  const { pacienteId } = req.params;
  
  if (!user) {
    return res.status(401).json({ 
      mensaje: 'Autenticación requerida' 
    });
  }

  const rol = user.rol || user.rol_nombre;

  // Administradores y nutricionistas pueden acceder a cualquier paciente
  if (['administrador', 'nutricionista'].includes(rol)) {
    return next();
  }

  // Secretarios pueden ver pacientes pero no generar reportes
  if (rol === 'secretario') {
    // Verificar si la ruta es solo de visualización
    if (req.method === 'GET' && !req.path.includes('reportes')) {
      return next();
    }
    return res.status(403).json({ 
      mensaje: 'Los secretarios no pueden generar reportes' 
    });
  }

  // Los pacientes solo pueden acceder a sus propios datos
  if (rol === 'paciente') {
    if (user.paciente_id && user.paciente_id.toString() === pacienteId) {
      return next();
    }
    return res.status(403).json({ 
      mensaje: 'Solo puede acceder a sus propios datos' 
    });
  }

  res.status(403).json({ 
    mensaje: 'No tiene permisos para acceder a estos datos' 
  });
};

// Función auxiliar para validar permisos
const validarPermisos = verificarPermisos;

/**
 * Middleware para verificar roles específicos (más simple para uso directo)
 */
const verificarRoles = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      const { user } = req;
      
      if (!user) {
        return res.status(401).json({ 
          mensaje: 'Token de autenticación requerido' 
        });
      }

      const rolUsuario = user.rol || user.rol_nombre;
      
      // Los administradores tienen acceso a todo
      if (rolUsuario === 'administrador') {
        return next();
      }

      // Verificar si el rol del usuario está en los roles permitidos
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({ 
          mensaje: 'No tiene permisos suficientes para realizar esta acción',
          rolesPermitidos,
          rolUsuario
        });
      }

      next();
    } catch (error) {
      console.error('Error en verificación de roles:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor' 
      });
    }
  };
};

// Alias para compatibilidad (para casos donde se espera verificar roles)
const permisosMiddleware = verificarRoles;

module.exports = {
  verificarPermisos,
  verificarRoles,
  permisosMiddleware,  // Alias para compatibilidad
  validarPermisos,  // Alias por compatibilidad
  requireAdmin,
  verificarAccesoReportes,
  verificarAccesoPaciente,
  verificarPermisosPorRol
};
