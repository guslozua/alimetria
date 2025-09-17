const express = require('express');
const router = express.Router();
const consultorioController = require('../controllers/consultorioController');
const { auth } = require('../middleware/auth');
const { requireAdmin, verificarPermisos } = require('../middleware/permisos');

// Middleware de autenticación para todas las rutas
router.use(auth);

// Obtener estadísticas de consultorios
router.get('/estadisticas', requireAdmin, consultorioController.obtenerEstadisticas);

// Obtener todos los consultorios
router.get('/', verificarPermisos(['pacientes']), consultorioController.obtenerConsultorios);

// Obtener consultorio por ID
router.get('/:id', verificarPermisos(['pacientes']), consultorioController.obtenerConsultorio);

// Obtener usuarios del consultorio
router.get('/:id/usuarios', requireAdmin, consultorioController.obtenerUsuarios);

// Crear nuevo consultorio
router.post('/', requireAdmin, consultorioController.crearConsultorio);

// Actualizar consultorio
router.put('/:id', requireAdmin, consultorioController.actualizarConsultorio);

// Activar/desactivar consultorio
router.patch('/:id/toggle', requireAdmin, consultorioController.toggleConsultorio);

module.exports = router;
