const express = require('express');
const router = express.Router();
const infografiasController = require('../controllers/infografias.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/uploadInfografia');

// ========== RUTAS DE INFOGRAFÍAS ==========

// Rutas públicas (solo lectura) - Las rutas específicas PRIMERO
router.get('/infografias/categorias', infografiasController.listarCategorias);
router.get('/infografias/estadisticas', infografiasController.obtenerEstadisticas);
router.get('/infografias/:id/descargar', infografiasController.descargarInfografia);
router.get('/infografias/:id', infografiasController.obtenerInfografia);
router.get('/infografias', infografiasController.listarInfografias);

// Rutas protegidas (requieren autenticación)
router.post(
  '/infografias',
  authenticateToken,
  requireRole('administrador', 'nutricionista'),
  upload.single('archivo'),
  infografiasController.crearInfografia
);

router.put(
  '/infografias/:id',
  authenticateToken,
  requireRole('administrador', 'nutricionista'),
  infografiasController.actualizarInfografia
);

router.delete(
  '/infografias/:id',
  authenticateToken,
  requireRole('administrador'),
  infografiasController.eliminarInfografia
);

// ========== RUTAS DE CATEGORÍAS ==========

router.post(
  '/infografias/categorias',
  authenticateToken,
  requireRole('administrador'),
  infografiasController.crearCategoria
);

router.put(
  '/infografias/categorias/:id',
  authenticateToken,
  requireRole('administrador'),
  infografiasController.actualizarCategoria
);

module.exports = router;
