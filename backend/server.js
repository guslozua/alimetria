const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, createDatabase } = require('./config/database');
const notificacionService = require('./utils/notificacionService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Más requests en desarrollo
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  trustProxy: false, // Añadir esta línea para solucionar el warning
  skip: (req) => {
    // Saltear rate limiting en desarrollo local
    return process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1';
  }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001' // Puerto alternativo para desarrollo
  ],
  credentials: true
}));

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads) con headers CORS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static('uploads', {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Rutas base
app.get('/', (req, res) => {
  res.json({ 
    message: 'Alimetria API - Sistema de Consultorio de Nutrición',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'OK',
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware de logging para todas las requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Rutas de la API
console.log('Cargando rutas de autenticación...');
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✓ Rutas de auth cargadas correctamente');
} catch (error) {
  console.error('❌ Error cargando rutas de auth:', error.message);
}
app.use('/api/pacientes', require('./routes/pacientes'));
app.use('/api/mediciones', require('./routes/mediciones'));
app.use('/api/obras-sociales', require('./routes/obrasSociales'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/test-pdf', require('./routes/test-pdf')); // Rutas de test para PDFs
app.use('/api/citas', require('./routes/citas'));
app.use('/api/citas-test', require('./routes/citas-test')); // Rutas de prueba para citas
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/dashboard', require('./routes/dashboard'));
// Rutas de administración
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/configuraciones', require('./routes/configuraciones'));
app.use('/api/consultorios', require('./routes/consultorios'));

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en esta API`
  });
});

// Manejo de errores globales
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Crear base de datos si no existe
    await createDatabase();
    
    // Probar conexión
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️ Servidor iniciando sin conexión a la base de datos');
    } else {
      // Inicializar servicio de notificaciones solo si hay conexión a BD
      notificacionService.iniciar();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Alimetria corriendo en puerto ${PORT}`);
      console.log(`📡 API disponible en: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('🔔 Sistema de notificaciones:', dbConnected ? 'ACTIVO' : 'INACTIVO');
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
