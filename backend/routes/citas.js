const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CitaController = require('../controllers/citaController');
const { authenticateToken } = require('../middleware/auth');
const { verificarPermisos } = require('../middleware/permisos');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones para crear/actualizar citas
const validacionesCita = [
  body('paciente_id')
    .isInt({ min: 1 })
    .withMessage('ID de paciente inválido'),
  
  body('nutricionista_id')
    .isInt({ min: 1 })
    .withMessage('ID de nutricionista inválido'),
  
  body('fecha_hora')
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value) => {
      const fecha = new Date(value);
      const ahora = new Date();
      if (fecha <= ahora) {
        throw new Error('La fecha debe ser futura');
      }
      return true;
    }),
  
  body('duracion_minutos')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duración debe estar entre 15 y 480 minutos'),
  
  body('tipo_consulta')
    .optional()
    .isIn(['primera_vez', 'seguimiento', 'control', 'urgencia'])
    .withMessage('Tipo de consulta inválido'),
  
  body('estado')
    .optional()
    .isIn(['programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio'])
    .withMessage('Estado inválido'),
  
  body('motivo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El motivo no puede exceder 500 caracteres'),
  
  body('notas_previas')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas previas no pueden exceder 1000 caracteres'),
  
  body('consultorio_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de consultorio inválido')
];

// Validaciones específicas para actualizar
const validacionesActualizacion = [
  body('paciente_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de paciente inválido'),
  
  body('nutricionista_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de nutricionista inválido'),
  
  body('fecha_hora')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido'),
  
  body('duracion_minutos')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duración debe estar entre 15 y 480 minutos'),
  
  body('tipo_consulta')
    .optional()
    .isIn(['primera_vez', 'seguimiento', 'control', 'urgencia'])
    .withMessage('Tipo de consulta inválido'),
  
  body('estado')
    .optional()
    .isIn(['programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio'])
    .withMessage('Estado inválido'),
  
  body('motivo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El motivo no puede exceder 500 caracteres'),
  
  body('notas_previas')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas previas no pueden exceder 1000 caracteres'),
  
  body('notas_posteriores')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas posteriores no pueden exceder 1000 caracteres')
];

// ==============================
// RUTAS PRINCIPALES
// ==============================

// GET /api/citas - Obtener todas las citas con filtros
router.get('/', 
  verificarPermisos(['citas']),
  CitaController.obtenerCitas
);

// GET /api/citas/proximas - Obtener próximas citas (dashboard)
router.get('/proximas',
  verificarPermisos(['citas']),
  CitaController.obtenerProximasCitas
);

// GET /api/citas/calendario - Obtener citas para calendario
router.get('/calendario',
  verificarPermisos(['citas']),
  CitaController.obtenerParaCalendario
);

// GET /api/citas/estadisticas - Obtener estadísticas de citas
router.get('/estadisticas',
  verificarPermisos(['reportes']),
  CitaController.obtenerEstadisticas
);

// GET /api/citas/disponibilidad - Verificar disponibilidad de horario
router.get('/disponibilidad',
  verificarPermisos(['citas']),
  CitaController.verificarDisponibilidad
);

// GET /api/citas/:id/disponibilidad - Verificar disponibilidad para edición
router.get('/:id/disponibilidad',
  verificarPermisos(['citas']),
  CitaController.verificarDisponibilidad
);

// GET /api/citas/:id - Obtener cita específica por ID
router.get('/:id',
  verificarPermisos(['citas']),
  CitaController.obtenerCitaPorId
);

// POST /api/citas - Crear nueva cita
router.post('/',
  verificarPermisos(['crear_citas']),
  validacionesCita,
  CitaController.crearCita
);

// PUT /api/citas/:id - Actualizar cita existente
router.put('/:id',
  verificarPermisos(['editar_citas']),
  validacionesActualizacion,
  CitaController.actualizarCita
);

// PATCH /api/citas/:id/cancelar - Cancelar cita
router.patch('/:id/cancelar',
  verificarPermisos(['editar_citas']),
  [
    body('motivo')
      .optional()
      .isLength({ max: 500 })
      .withMessage('El motivo no puede exceder 500 caracteres')
  ],
  CitaController.cancelarCita
);

// PATCH /api/citas/:id/completar - Completar cita
router.patch('/:id/completar',
  verificarPermisos(['editar_citas']),
  [
    body('notas_posteriores')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Las notas posteriores no pueden exceder 1000 caracteres')
  ],
  CitaController.completarCita
);

// DELETE /api/citas/:id - Eliminar cita (soft delete)
router.delete('/:id',
  verificarPermisos(['*']), // Solo administradores
  CitaController.eliminarCita
);

module.exports = router;
