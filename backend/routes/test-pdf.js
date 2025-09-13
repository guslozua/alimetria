const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

// Endpoint de test para PDF simple
router.get('/test-simple', async (req, res) => {
  try {
    console.log('🧪 Generando PDF de test simple...');
    
    // Crear PDF
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Configurar headers de respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-simple.pdf"');

    // Pipe directo del PDF a la respuesta
    doc.pipe(res);

    // Contenido muy simple
    doc.fontSize(24).text('TEST PDF SIMPLE', 50, 100, { align: 'center' });
    doc.fontSize(16).text('Este es un test básico de generación de PDF', 50, 150);
    doc.fontSize(12).text('Fecha: ' + new Date().toLocaleString(), 50, 200);
    doc.fontSize(10).text('Si puedes leer esto, el PDF se generó correctamente', 50, 250);

    // Finalizar PDF
    doc.end();
    
    console.log('✅ PDF de test simple enviado');

  } catch (error) {
    console.error('❌ Error en test simple:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error al generar PDF de test',
        message: error.message 
      });
    }
  }
});

// Endpoint de test para PDF con tabla (similar al reporte real)
router.get('/test-tabla', async (req, res) => {
  try {
    console.log('🧪 Generando PDF de test con tabla...');
    
    // Crear PDF con configuración exacta del reporte real
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Configurar headers de respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-tabla.pdf"');

    // Pipe directo del PDF a la respuesta  
    doc.pipe(res);

    // Contenido similar al reporte real pero simplificado
    doc.fontSize(20).text('TEST REPORTE ALIMETRIA', 50, 50, { align: 'center' });
    doc.fontSize(12).text('Sistema de Gestión Nutricional', 50, 75, { align: 'center' });
    
    // Línea separadora
    doc.moveTo(50, 100).lineTo(545, 100).stroke();

    let yPosition = 120;

    // Información del paciente
    doc.fontSize(16).text('PACIENTE DE PRUEBA', 50, yPosition);
    yPosition += 25;

    doc.fontSize(11);
    doc.text('Nombre: Test Usuario', 50, yPosition);
    yPosition += 15;
    doc.text('Edad: 30 años', 50, yPosition);
    yPosition += 30;

    // Tabla simple
    doc.fontSize(14).text('MEDICIONES DE PRUEBA', 50, yPosition);
    yPosition += 20;

    // Headers de la tabla
    doc.fontSize(10);
    doc.text('Fecha', 50, yPosition);
    doc.text('Peso', 120, yPosition);
    doc.text('IMC', 180, yPosition);
    yPosition += 15;

    // Línea bajo headers
    doc.moveTo(50, yPosition).lineTo(250, yPosition).stroke();
    yPosition += 10;

    // Datos de prueba
    doc.text('01/08/2025', 50, yPosition);
    doc.text('70.5 kg', 120, yPosition);
    doc.text('22.1', 180, yPosition);
    yPosition += 15;

    doc.text('01/09/2025', 50, yPosition);
    doc.text('69.8 kg', 120, yPosition);
    doc.text('21.9', 180, yPosition);

    // Footer
    doc.fontSize(8).text('Test generado el ' + new Date().toLocaleDateString('es-ES'), 50, 750, { align: 'center' });

    // Finalizar PDF
    doc.end();
    
    console.log('✅ PDF de test con tabla enviado');

  } catch (error) {
    console.error('❌ Error en test tabla:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error al generar PDF de test con tabla',
        message: error.message 
      });
    }
  }
});

module.exports = router;
