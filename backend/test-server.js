// Servidor de prueba mínimo
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor de prueba funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', server: 'test' });
});

// Test PDF simple sin pdfkit para verificar
app.get('/api/test-pdf/simple-text', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="test.txt"');
  res.send('Este es un test simple para verificar que el servidor responde correctamente.');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🧪 SERVIDOR DE PRUEBA corriendo en puerto ${PORT}`);
  console.log(`📡 Test disponible en: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📄 Test descarga: http://localhost:${PORT}/api/test-pdf/simple-text`);
}).on('error', (error) => {
  console.error('❌ ERROR AL INICIAR SERVIDOR:', error);
  if (error.code === 'EADDRINUSE') {
    console.error('🔧 SOLUCIÓN: El puerto 5000 está ocupado. Ejecuta:');
    console.error('   taskkill /IM node.exe /F');
    console.error('   Luego vuelve a intentar.');
  }
});
