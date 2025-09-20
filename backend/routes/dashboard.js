const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Obtener estadísticas del dashboard
// @access  Private
router.get('/stats', authenticateToken, getDashboardStats);

// @route   GET /api/dashboard/activity
// @desc    Obtener actividad reciente
// @access  Private
router.get('/activity', authenticateToken, getRecentActivity);

module.exports = router;
