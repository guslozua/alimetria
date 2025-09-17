const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/permisos');

// Ruta pública para configuraciones públicas (sin autenticación)
router.get('/publicas', configuracionController.obtenerConfiguracionesPublicas);

// Middleware de autenticación para todas las demás rutas
router.use(auth);

// Obtener categorías disponibles
router.get('/categorias', requireAdmin, configuracionController.obtenerCategorias);

// Obtener todas las configuraciones
router.get('/', requireAdmin, configuracionController.obtenerConfiguraciones);

// Obtener configuración específica
router.get('/:clave', requireAdmin, configuracionController.obtenerConfiguracion);

// Actualizar múltiples configuraciones
router.put('/multiples', requireAdmin, configuracionController.actualizarMultiples);

// Crear nueva configuración
router.post('/', requireAdmin, configuracionController.crearConfiguracion);

// Actualizar configuración específica
router.put('/:clave', requireAdmin, configuracionController.actualizarConfiguracion);

// Eliminar configuración
router.delete('/:clave', requireAdmin, configuracionController.eliminarConfiguracion);

module.exports = router;
