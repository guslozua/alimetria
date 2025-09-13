/**
 * Middleware para verificar roles de usuario
 */

// Middleware para verificar roles específicos
const roleMiddleware = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que el usuario tenga un rol
      if (!req.user.rol) {
        return res.status(403).json({
          success: false,
          message: 'Usuario sin rol asignado'
        });
      }

      // Convertir a array si es un string
      const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

      // Verificar si el rol del usuario está en los roles permitidos
      if (!roles.includes(req.user.rol)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso',
          required_roles: roles,
          user_role: req.user.rol
        });
      }

      // Si pasa todas las verificaciones, continuar
      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware específicos para roles comunes
const requireAdmin = roleMiddleware(['administrador']);
const requireNutricionista = roleMiddleware(['administrador', 'nutricionista']);
const requireSecretario = roleMiddleware(['administrador', 'nutricionista', 'secretario']);
const requireAnyStaff = roleMiddleware(['administrador', 'nutricionista', 'secretario']);

// Funciones de utilidad para verificar roles
const isAdmin = (user) => {
  return user && user.rol === 'administrador';
};

const isNutricionista = (user) => {
  return user && (user.rol === 'administrador' || user.rol === 'nutricionista');
};

const isSecretario = (user) => {
  return user && ['administrador', 'nutricionista', 'secretario'].includes(user.rol);
};

const isPaciente = (user) => {
  return user && user.rol === 'paciente';
};

// Middleware para verificar que el usuario puede acceder a datos de un paciente específico
const canAccessPaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params;
    const user = req.user;

    // Administradores y nutricionistas pueden acceder a todos los pacientes
    if (isAdmin(user) || isNutricionista(user) || isSecretario(user)) {
      return next();
    }

    // Los pacientes solo pueden acceder a sus propios datos
    if (isPaciente(user)) {
      // Aquí deberías verificar que el pacienteId corresponde al usuario actual
      // Por ahora, denegamos el acceso ya que no tenemos la relación usuario-paciente
      return res.status(403).json({
        success: false,
        message: 'Los pacientes solo pueden acceder a sus propios datos'
      });
    }

    // Si no es ningún rol conocido, denegar acceso
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso'
    });

  } catch (error) {
    console.error('Error en middleware canAccessPaciente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  roleMiddleware,
  requireAdmin,
  requireNutricionista,
  requireSecretario,
  requireAnyStaff,
  canAccessPaciente,
  isAdmin,
  isNutricionista,
  isSecretario,
  isPaciente
};
