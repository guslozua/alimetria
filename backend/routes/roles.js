const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Middleware para verificar autenticación en todas las rutas
router.use(authenticateToken);

// GET /api/roles - Obtener todos los roles
router.get('/', 
  requireRole('administrador'), 
  rolController.obtenerRoles
);

// GET /api/roles/estadisticas - Obtener estadísticas
router.get('/estadisticas', 
  requireRole('administrador'), 
  rolController.obtenerEstadisticas
);

// GET /api/roles/:id - Obtener rol por ID
router.get('/:id', 
  requireRole('administrador'), 
  rolController.obtenerRol
);

// POST /api/roles - Crear nuevo rol
router.post('/', 
  requireRole('administrador'), 
  rolController.crearRol
);

// PUT /api/roles/:id - Actualizar rol
router.put('/:id', 
  requireRole('administrador'), 
  rolController.actualizarRol
);

// PATCH /api/roles/:id/toggle - Activar/desactivar rol
router.patch('/:id/toggle', 
  requireRole('administrador'), 
  rolController.toggleRol
);

module.exports = router;