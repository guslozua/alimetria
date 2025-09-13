const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateUpdateProfile, 
  validateChangePassword 
} = require('../middleware/validators');

// Rutas públicas (no requieren autenticación)

// POST /api/auth/login - Iniciar sesión
router.post('/login', (req, res, next) => {
  console.log('🔑 Llegó request a /api/auth/login');
  next();
}, validateLogin, AuthController.login);

// POST /api/auth/register - Registrar nuevo usuario (solo admin puede crear usuarios)
router.post('/register', 
  authenticateToken, 
  requireRole('administrador'), 
  validateRegister, 
  AuthController.register
);

// GET /api/auth/roles - Obtener lista de roles (para formularios)
router.get('/roles', AuthController.getRoles);

// Rutas protegidas (requieren autenticación)

// GET /api/auth/profile - Obtener perfil del usuario actual
router.get('/profile', authenticateToken, AuthController.getProfile);

// PUT /api/auth/profile - Actualizar perfil del usuario actual
router.put('/profile', 
  authenticateToken, 
  validateUpdateProfile, 
  AuthController.updateProfile
);

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password', 
  authenticateToken, 
  validateChangePassword, 
  AuthController.changePassword
);

// GET /api/auth/verify - Verificar token
router.get('/verify', authenticateToken, AuthController.verifyToken);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;
