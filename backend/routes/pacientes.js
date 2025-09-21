const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/pacienteController');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateCreatePaciente, validateUpdatePaciente } = require('../middleware/pacienteValidators');
const { upload, processProfilePhoto } = require('../middleware/photoUpload');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/pacientes - Obtener todos los pacientes
router.get('/', 
  requirePermission('pacientes', 'leer'),
  PacienteController.getAll
);

// GET /api/pacientes/search - Búsqueda rápida de pacientes
router.get('/search', 
  requirePermission('pacientes', 'leer'),
  PacienteController.search
);

// GET /api/pacientes/:id - Obtener paciente por ID
router.get('/:id', 
  requirePermission('pacientes', 'leer'),
  PacienteController.getById
);

// POST /api/pacientes - Crear nuevo paciente
router.post('/', 
  requirePermission('pacientes', 'crear'),
  validateCreatePaciente,
  PacienteController.create
);

// PUT /api/pacientes/:id - Actualizar paciente
router.put('/:id', 
  requirePermission('pacientes', 'actualizar'),
  validateUpdatePaciente,
  PacienteController.update
);

// DELETE /api/pacientes/:id - Eliminar paciente (soft delete)
router.delete('/:id', 
  requirePermission('pacientes', 'eliminar'),
  PacienteController.delete
);

// GET /api/pacientes/:id/mediciones - Obtener mediciones del paciente
router.get('/:id/mediciones', 
  requirePermission('mediciones', 'leer'),
  PacienteController.getMediciones
);

// GET /api/pacientes/:id/estadisticas - Obtener estadísticas del paciente
router.get('/:id/estadisticas', 
  requirePermission('pacientes', 'leer'),
  PacienteController.getEstadisticas
);

// GET /api/pacientes/:id/fotos - Obtener fotos del paciente
router.get('/:id/fotos', 
  requirePermission('pacientes', 'leer'),
  PacienteController.getFotos
);

// GET /api/pacientes/:id/citas - Obtener citas del paciente
router.get('/:id/citas', 
  requirePermission('citas', 'leer'),
  PacienteController.getCitas
);

// POST /api/pacientes/upload-foto-perfil - Subir foto de perfil
router.post('/upload-foto-perfil',
  requirePermission('pacientes', 'actualizar'),
  upload,
  processProfilePhoto,
  PacienteController.uploadProfilePhoto
);

// DELETE /api/pacientes/:id/delete-foto-perfil - Eliminar foto de perfil
router.delete('/:id/delete-foto-perfil',
  requirePermission('pacientes', 'actualizar'),
  PacienteController.deleteProfilePhoto
);

module.exports = router;
