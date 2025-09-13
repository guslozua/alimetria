const express = require('express');
const router = express.Router();

// Endpoint de prueba simple para citas (sin autenticación)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '🎉 Sistema de Citas funcionando correctamente!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/citas - Listar todas las citas',
      'GET /api/citas/proximas - Próximas citas',
      'GET /api/citas/calendario - Para calendario',
      'GET /api/citas/estadisticas - Estadísticas',
      'POST /api/citas - Crear nueva cita'
    ]
  });
});

// Health check específico para citas
router.get('/health', (req, res) => {
  res.json({
    module: 'Citas',
    status: 'OK',
    version: '1.0.0',
    features: [
      'CRUD completo de citas',
      'Verificación de disponibilidad',
      'Estados de citas',
      'Integración con calendario',
      'Sistema de permisos'
    ]
  });
});

module.exports = router;
