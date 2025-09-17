const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔍 DEBUG auth middleware - decoded token:', decoded);
    
    // Verificar que el usuario aún existe y está activo
    const user = await Usuario.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido - usuario no encontrado'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,  // Cambiado de userId a id
      email: user.email,
      rol: user.rol_nombre,
      rolId: user.rol_id,
      permisos: typeof user.permisos === 'string' ? JSON.parse(user.permisos) : user.permisos,
      consultorioId: user.consultorio_id
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Función auxiliar para verificar permisos
const hasPermission = (userPermisos, modulo, accion) => {
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
};

// Middleware para verificar permisos específicos
const requirePermission = (modulo, accion) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar si es administrador por rol
    if (req.user.rol === 'administrador') {
      return next();
    }

    // Verificar si tiene el permiso específico
    const hasPermissionResult = hasPermission(req.user.permisos, modulo, accion);
    
    if (!hasPermissionResult) {
      return res.status(403).json({
        success: false,
        message: `No tienes permisos para ${accion} en ${modulo}`
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario puede acceder solo a sus propios datos
const requireOwnData = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const requestedUserId = parseInt(req.params[userIdParam]);
    
    // Los administradores pueden acceder a todos los datos
    if (req.user.rol === 'administrador') {
      return next();
    }

    // Los usuarios solo pueden acceder a sus propios datos
    if (req.user.id !== requestedUserId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes acceder a tus propios datos'
      });
    }

    next();
  };
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Usuario.findById(decoded.userId);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        rol: user.rol_nombre,
        rolId: user.rol_id,
        permisos: typeof user.permisos === 'string' ? JSON.parse(user.permisos) : user.permisos,
        consultorioId: user.consultorio_id
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  auth: authenticateToken,  // Agregar alias
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnData,
  optionalAuth,
  hasPermission
};
