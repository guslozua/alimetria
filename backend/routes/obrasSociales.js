const express = require('express');
const { body } = require('express-validator');
const ObraSocialController = require('../controllers/obraSocialController');
const { authenticateToken } = require('../middleware/auth');
const permisosMiddleware = require('../middleware/permisos');

const router = express.Router();

// Validaciones para obra social
const obraSocialValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('codigo')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('El código debe tener máximo 20 caracteres'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción debe tener máximo 500 caracteres'),
  body('telefono')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El teléfono debe tener máximo 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .isLength({ max: 100 })
    .withMessage('El email debe tener máximo 100 caracteres'),
  body('sitio_web')
    .optional()
    .isURL()
    .withMessage('Debe ser una URL válida')
    .isLength({ max: 255 })
    .withMessage('El sitio web debe tener máximo 255 caracteres')
];

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/obras-sociales - Obtener todas las obras sociales
router.get('/', ObraSocialController.getAll);

// GET /api/obras-sociales/estadisticas-globales - Obtener estadísticas globales
router.get('/estadisticas-globales', ObraSocialController.getEstadisticasGlobales);

// GET /api/obras-sociales/search - Búsqueda rápida
router.get('/search', ObraSocialController.search);

// GET /api/obras-sociales/:id - Obtener obra social por ID
router.get('/:id', ObraSocialController.getById);

// GET /api/obras-sociales/:id/pacientes - Obtener pacientes de una obra social
router.get('/:id/pacientes', ObraSocialController.getPacientes);

// GET /api/obras-sociales/:id/estadisticas - Obtener estadísticas de una obra social
router.get('/:id/estadisticas', ObraSocialController.getEstadisticas);

// POST /api/obras-sociales - Crear nueva obra social (solo admin)
router.post('/', 
  permisosMiddleware.requireAdmin,
  obraSocialValidation, 
  ObraSocialController.create
);

// PUT /api/obras-sociales/:id - Actualizar obra social (solo admin)
router.put('/:id', 
  permisosMiddleware.requireAdmin,
  obraSocialValidation, 
  ObraSocialController.update
);

// DELETE /api/obras-sociales/:id - Eliminar obra social (solo admin)
router.delete('/:id', 
  permisosMiddleware.requireAdmin,
  ObraSocialController.delete
);

module.exports = router;
