const express = require('express');
const router = express.Router();
const suplementosController = require('../controllers/suplementosController');

// Middleware básico temporal (sin autenticación)
const middlewareBasico = (req, res, next) => {
  console.log(`[SUPLEMENTOS] ${req.method} ${req.path}`);
  next();
};

// Rutas públicas 
router.get('/', middlewareBasico, suplementosController.listar);
router.get('/categorias', middlewareBasico, suplementosController.listarCategorias);
router.get('/busqueda-inteligente', middlewareBasico, suplementosController.busquedaInteligente);
router.get('/dashboard', middlewareBasico, suplementosController.dashboard);
router.get('/:id', middlewareBasico, suplementosController.obtenerDetalle);

module.exports = router;
