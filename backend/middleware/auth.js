const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

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
      userId: user.id,
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
    const hasPermission = Rol.hasPermission(req.user.permisos, modulo, accion);
    
    if (!hasPermission) {
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
    if (req.user.userId !== requestedUserId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes acceder a tus propios datos'
      });
    }

    next();
  };
};

// Middleware para verificar acceso a pacientes específicos
const requirePatientAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const pacienteId = parseInt(req.params.pacienteId || req.params.id);

    // Administradores y nutricionistas pueden acceder a todos los pacientes
    if (['administrador', 'nutricionista'].includes(req.user.rol)) {
      return next();
    }

    // Secretarios pueden ver pacientes pero no modificar datos sensibles
    if (req.user.rol === 'secretario') {
      // Solo lectura para secretarios
      if (req.method !== 'GET') {
        return res.status(403).json({
          success: false,
          message: 'Los secretarios solo pueden consultar información'
        });
      }
      return next();
    }

    // Pacientes solo pueden acceder a sus propios datos
    if (req.user.rol === 'paciente') {
      // Verificar que el usuario es el mismo paciente
      const Usuario = require('../models/Usuario');
      const user = await Usuario.findById(req.user.userId);
      
      if (user.id !== pacienteId) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes acceder a tus propios datos'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error verificando acceso a paciente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar que el usuario pertenece al mismo consultorio
const requireSameConsultorio = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Los administradores pueden acceder a todos los consultorios
    if (req.user.rol === 'administrador') {
      return next();
    }

    // Verificar que el recurso pertenece al mismo consultorio del usuario
    const consultoirioId = req.params.consultoirioId || req.body.consultorio_id;
    
    if (consultoirioId && req.user.consultoirioId !== parseInt(consultoirioId)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes acceder a recursos de otros consultorios'
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando consultorio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
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
        userId: user.id,
        email: user.email,
        rol: user.rol_nombre,
        rolId: user.rol_id,
        permisos: typeof user.permisos === 'string' ? JSON.parse(user.permisos) : user.permisos,
        consultoirioId: user.consultorio_id
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
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnData,
  requirePatientAccess,
  requireSameConsultorio,
  optionalAuth
};
