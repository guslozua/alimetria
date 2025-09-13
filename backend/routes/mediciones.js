const express = require('express');
const router = express.Router();
const MedicionController = require('../controllers/medicionController');
const { authenticateToken } = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/role');
const { uploadInBody, handleMulterError } = require('../middleware/upload');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ===== RUTAS EXISTENTES =====

// Obtener mediciones de un paciente
router.get('/paciente/:pacienteId', 
  roleMiddleware(['administrador', 'nutricionista', 'secretario']),
  MedicionController.getMedicionesPorPaciente
);

// Obtener una medición específica
router.get('/:id', 
  roleMiddleware(['administrador', 'nutricionista', 'secretario']),
  MedicionController.getMedicion
);

// Crear nueva medición
router.post('/', 
  roleMiddleware(['administrador', 'nutricionista']),
  MedicionController.crearMedicion
);

// Actualizar medición
router.put('/:id', 
  roleMiddleware(['administrador', 'nutricionista']),
  MedicionController.actualizarMedicion
);

// Eliminar medición
router.delete('/:id', 
  roleMiddleware(['administrador']),
  MedicionController.eliminarMedicion
);

// Obtener estadísticas de evolución
router.get('/paciente/:pacienteId/estadisticas', 
  roleMiddleware(['administrador', 'nutricionista', 'secretario']),
  MedicionController.getEstadisticas
);

// Obtener datos para gráficos de evolución
router.get('/paciente/:pacienteId/evolucion', 
  roleMiddleware(['administrador', 'nutricionista', 'secretario']),
  MedicionController.getDatosEvolucion
);

// Obtener historial de versiones de una medición
router.get('/:id/historial', 
  roleMiddleware(['administrador', 'nutricionista']),
  MedicionController.getHistorialVersiones
);

// ===== NUEVAS RUTAS OCR =====

/**
 * POST /api/mediciones/ocr/procesar
 * Procesar imagen InBody H30 con OCR
 * Requiere: imagen (file), pacienteId (form data)
 */
router.post('/ocr/procesar', 
  roleMiddleware(['administrador', 'nutricionista']),
  uploadInBody,
  handleMulterError,
  MedicionController.procesarImagenInBody
);

/**
 * POST /api/mediciones/ocr/crear
 * Crear medición desde datos OCR procesados
 * Requiere: medicionData (JSON)
 */
router.post('/ocr/crear', 
  roleMiddleware(['administrador', 'nutricionista']),
  MedicionController.crearMedicionDesdeOCR
);

/**
 * POST /api/mediciones/ocr/reprocesar
 * Reprocesar imagen existente con OCR
 * Requiere: filename, pacienteId
 */
router.post('/ocr/reprocesar', 
  roleMiddleware(['administrador', 'nutricionista']),
  MedicionController.reprocesarImagenOCR
);

/**
 * GET /api/mediciones/ocr/texto/:filename
 * Obtener texto OCR sin procesar de una imagen
 */
router.get('/ocr/texto/:filename', 
  roleMiddleware(['administrador', 'nutricionista']),
  MedicionController.obtenerTextoOCR
);

module.exports = router;