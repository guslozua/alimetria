const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

class AuthController {
  // Registro de usuario
  static async register(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { nombre, apellido, email, password, telefono, rol_id, consultorio_id } = req.body;

      // Verificar si el email ya existe
      const emailExists = await Usuario.emailExists(email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está registrado'
        });
      }

      // Verificar que el rol existe
      const rol = await Rol.findById(rol_id);
      if (!rol) {
        return res.status(400).json({
          success: false,
          message: 'Rol no válido'
        });
      }

      // Encriptar contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const userData = {
        nombre,
        apellido,
        email: email.toLowerCase(),
        password: hashedPassword,
        telefono,
        rol_id,
        consultorio_id
      };

      const newUser = await Usuario.create(userData);

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          rol: newUser.rol_nombre
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: newUser.toSafeObject(),
          token
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Inicio de sesión
  static async login(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await Usuario.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Actualizar último acceso
      await Usuario.updateLastAccess(user.id);

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          rol: user.rol_nombre,
          permisos: user.permisos
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      console.log('Usuario autenticado:', {
        id: user.id,
        email: user.email,
        rol_nombre: user.rol_nombre,
        permisos: user.permisos
      });

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: user.toSafeObject(),
          token
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener perfil del usuario actual
  static async getProfile(req, res) {
    try {
      const user = await Usuario.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toSafeObject()
        }
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar perfil
  static async updateProfile(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const user = await Usuario.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Campos que se pueden actualizar
      const { nombre, apellido, telefono } = req.body;
      const updateData = { nombre, apellido, telefono };

      const updatedUser = await user.update(updateData);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: updatedUser.toSafeObject()
        }
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Cambiar contraseña
  static async changePassword(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await Usuario.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Encriptar nueva contraseña
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña en la base de datos
      const query = 'UPDATE usuarios SET password = ?, fecha_actualizacion = NOW() WHERE id = ?';
      await require('../config/database').executeQuery(query, [hashedNewPassword, user.id]);

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verificar token (útil para validar sesión activa)
  static async verifyToken(req, res) {
    try {
      console.log('🔍 DEBUG verifyToken - req.user:', req.user);
      
      // El middleware authenticateToken ya verificó el token y pobló req.user
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - información de usuario no disponible'
        });
      }

      // Buscar usuario actualizado en base de datos
      const user = await Usuario.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar que el usuario siga activo
      if (!user.activo) {
        return res.status(401).json({
          success: false,
          message: 'Usuario desactivado'
        });
      }

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: user.toSafeObject()
        }
      });

    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Logout (invalidar token del lado cliente)
  static async logout(req, res) {
    try {
      // En JWT stateless, el logout se maneja del lado cliente
      // Pero podemos registrar la actividad
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener roles disponibles (para formularios)
  static async getRoles(req, res) {
    try {
      const roles = await Rol.findAll();
      
      res.json({
        success: true,
        data: {
          roles: roles.map(rol => ({
            id: rol.id,
            nombre: rol.nombre,
            descripcion: rol.descripcion
          }))
        }
      });

    } catch (error) {
      console.error('Error obteniendo roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;
