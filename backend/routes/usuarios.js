const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { auth } = require('../middleware/auth');
const { verificarPermisos, requireAdmin } = require('../middleware/permisos');

// Middleware de autenticación para todas las rutas
router.use(auth);

// Obtener estadísticas de usuarios (solo admin)
router.get('/estadisticas', requireAdmin, usuarioController.obtenerEstadisticas);

// Obtener todos los usuarios
router.get('/', verificarPermisos(['pacientes', 'usuarios']), usuarioController.obtenerUsuarios);

// Obtener usuario por ID
router.get('/:id', verificarPermisos(['pacientes', 'usuarios']), usuarioController.obtenerUsuario);

// Crear nuevo usuario
router.post('/', requireAdmin, usuarioController.crearUsuario);

// Actualizar usuario
router.put('/:id', requireAdmin, usuarioController.actualizarUsuario);

// Cambiar contraseña de usuario
router.put('/:id/password', usuarioController.cambiarPassword);

// Resetear contraseña (solo admin)
router.put('/:id/reset-password', requireAdmin, usuarioController.resetearPassword);

// Activar/desactivar usuario
router.patch('/:id/toggle', requireAdmin, usuarioController.toggleUsuario);

// Eliminar usuario
router.delete('/:id', requireAdmin, usuarioController.eliminarUsuario);

module.exports = router;
