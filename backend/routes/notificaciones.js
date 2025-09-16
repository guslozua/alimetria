const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { authenticateToken } = require('../middleware/auth');
const { verificarPermisos } = require('../middleware/permisos');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones para crear notificación
const validarCrearNotificacion = [
  body('tipo')
    .isIn(['cita_recordatorio', 'medicion_pendiente', 'cumpleanos', 'sistema', 'alerta'])
    .withMessage('Tipo de notificación inválido'),
  body('titulo')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('El título es requerido y debe tener máximo 255 caracteres'),
  body('mensaje')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El mensaje es requerido'),
  body('destinatario_id')
    .isInt({ min: 1 })
    .withMessage('ID del destinatario debe ser un entero válido'),
  body('paciente_relacionado_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID del paciente debe ser un entero válido'),
  body('cita_relacionada_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de la cita debe ser un entero válido'),
  body('fecha_programada')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('La fecha programada debe ser una fecha válida')
];

// === RUTAS PÚBLICAS (para todos los usuarios autenticados) ===

// GET /api/notificaciones - Obtener mis notificaciones
router.get('/', notificacionController.obtenerMisNotificaciones);

// GET /api/notificaciones/no-leidas/count - Contar notificaciones no leídas
router.get('/no-leidas/count', notificacionController.contarNoLeidas);

// GET /api/notificaciones/:id - Obtener notificación específica
router.get('/:id', notificacionController.obtenerNotificacion);

// PUT /api/notificaciones/:id/leer - Marcar como leída
router.put('/:id/leer', notificacionController.marcarComoLeida);

// PUT /api/notificaciones/todas/leer - Marcar todas como leídas
router.put('/todas/leer', notificacionController.marcarTodasComoLeidas);

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id', notificacionController.eliminarNotificacion);

// === RUTAS RESTRINGIDAS (solo nutricionistas y admins) ===

// POST /api/notificaciones - Crear nueva notificación
router.post('/', 
  verificarPermisos('notificaciones', 'crear'),
  validarCrearNotificacion,
  notificacionController.crearNotificacion
);

// POST /api/notificaciones/recordatorio-cita - Crear recordatorio de cita
router.post('/recordatorio-cita',
  verificarPermisos('citas', 'leer'), // Necesita poder ver citas
  notificacionController.crearRecordatorioCita
);

// === RUTAS ADMINISTRATIVAS (solo admins) ===

// GET /api/notificaciones/admin/pendientes-envio - Notificaciones pendientes de envío
router.get('/admin/pendientes-envio',
  verificarPermisos('notificaciones', 'administrar'),
  notificacionController.obtenerPendientesEnvio
);

module.exports = router;
