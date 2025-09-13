const express = require('express');
const router = express.Router();
const ReportesController = require('../controllers/reportes');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/reportes/paciente/:pacienteId/datos
 * @desc    Obtener datos completos de un paciente para reporte
 * @access  Private (requiere permisos de reportes)
 * @params  pacienteId: ID del paciente
 * @query   fechaDesde: Fecha inicio (YYYY-MM-DD)
 * @query   fechaHasta: Fecha fin (YYYY-MM-DD)
 */
router.get(
  '/paciente/:pacienteId/datos',
  requirePermission('reportes', 'leer'),
  ReportesController.obtenerDatosPaciente
);

/**
 * @route   GET /api/reportes/paciente/:pacienteId/pdf
 * @desc    Generar y descargar reporte PDF de un paciente
 * @access  Private (requiere permisos de reportes)
 * @params  pacienteId: ID del paciente
 * @query   fechaDesde: Fecha inicio (YYYY-MM-DD)
 * @query   fechaHasta: Fecha fin (YYYY-MM-DD)
 * @query   incluirGraficos: true/false (default: true)
 */
router.get(
  '/paciente/:pacienteId/pdf',
  requirePermission('reportes', 'crear'),
  ReportesController.generarReportePaciente
);

/**
 * @route   GET /api/reportes/consolidado/datos
 * @desc    Obtener datos consolidados de todos los pacientes
 * @access  Private (requiere permisos de reportes)
 * @query   fechaDesde: Fecha inicio (YYYY-MM-DD)
 * @query   fechaHasta: Fecha fin (YYYY-MM-DD)
 * @query   consultorioId: ID del consultorio (opcional)
 */
router.get(
  '/consolidado/datos',
  requirePermission('reportes', 'leer'),
  ReportesController.obtenerDatosConsolidado
);

/**
 * @route   GET /api/reportes/consolidado/pdf
 * @desc    Generar y descargar reporte PDF consolidado
 * @access  Private (requiere permisos de reportes)
 * @query   fechaDesde: Fecha inicio (YYYY-MM-DD)
 * @query   fechaHasta: Fecha fin (YYYY-MM-DD)
 * @query   consultorioId: ID del consultorio (opcional)
 */
router.get(
  '/consolidado/pdf',
  requirePermission('reportes', 'crear'),
  ReportesController.generarReporteConsolidado
);

/**
 * @route   GET /api/reportes/estadisticas
 * @desc    Obtener estadísticas generales del sistema
 * @access  Private (requiere permisos de reportes)
 */
router.get(
  '/estadisticas',
  requirePermission('reportes', 'leer'),
  async (req, res) => {
    try {
      const { pool } = require('../config/database');
      
      // Estadísticas básicas
      const [stats] = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) FROM pacientes WHERE activo = 1) as total_pacientes,
          (SELECT COUNT(*) FROM mediciones WHERE activo = 1) as total_mediciones,
          (SELECT COUNT(*) FROM citas WHERE fecha_hora >= CURDATE()) as citas_futuras,
          (SELECT COUNT(*) FROM usuarios WHERE activo = 1) as total_usuarios
      `);

      // Mediciones por mes (últimos 12 meses)
      const [medicionesMes] = await pool.execute(`
        SELECT 
          DATE_FORMAT(fecha_medicion, '%Y-%m') as mes,
          COUNT(*) as cantidad
        FROM mediciones 
        WHERE fecha_medicion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          AND activo = 1
        GROUP BY DATE_FORMAT(fecha_medicion, '%Y-%m')
        ORDER BY mes DESC
      `);

      // Distribución por sexo
      const [distribucionSexo] = await pool.execute(`
        SELECT 
          sexo,
          COUNT(*) as cantidad
        FROM pacientes 
        WHERE activo = 1
        GROUP BY sexo
      `);

      res.json({
        estadisticasGenerales: stats[0],
        medicionesPorMes: medicionesMes,
        distribucionPorSexo: distribucionSexo,
        fechaConsulta: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor',
        error: error.message 
      });
    }
  }
);

module.exports = router;
