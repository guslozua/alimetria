const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

console.log('🧪 INICIANDO TEST DE GENERACIÓN DE PDF...');

// Test 1: PDF Simple directo a archivo
async function testPDFSimple() {
  return new Promise((resolve, reject) => {
    try {
      console.log('📄 Test 1: Generando PDF simple...');
      
      const doc = new PDFDocument();
      const outputPath = path.join(__dirname, 'test-simple.pdf');
      
      // Escribir a archivo
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Contenido simple
      doc.fontSize(20).text('TEST DE PDF SIMPLE', 50, 50);
      doc.fontSize(12).text('Este es un test para verificar que pdfkit funciona correctamente', 50, 100);
      doc.fontSize(10).text('Fecha de generación: ' + new Date().toLocaleString(), 50, 130);
      
      doc.end();
      
      stream.on('finish', () => {
        console.log('✅ PDF simple generado exitosamente:', outputPath);
        resolve(outputPath);
      });
      
      stream.on('error', (error) => {
        console.error('❌ Error al generar PDF simple:', error);
        reject(error);
      });
      
    } catch (error) {
      console.error('❌ Error en testPDFSimple:', error);
      reject(error);
    }
  });
}

// Test 2: PDF con datos similar al reporte real
async function testPDFCompleto() {
  return new Promise((resolve, reject) => {
    try {
      console.log('📊 Test 2: Generando PDF con datos de reporte...');
      
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const outputPath = path.join(__dirname, 'test-completo.pdf');
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Header similar al reporte real
      doc.fontSize(20).text('REPORTE DE EVOLUCIÓN NUTRICIONAL', 50, 50, { align: 'center' });
      doc.fontSize(12).text('Alimetria - Sistema de Gestión Nutricional', 50, 75, { align: 'center' });
      
      // Línea separadora
      doc.moveTo(50, 100).lineTo(545, 100).stroke();

      let yPosition = 120;

      // Información del paciente
      doc.fontSize(16).text('INFORMACIÓN DEL PACIENTE', 50, yPosition);
      yPosition += 25;

      doc.fontSize(11);
      doc.text('Nombre: Juan Pérez', 50, yPosition);
      yPosition += 15;
      doc.text('Sexo: Masculino', 50, yPosition);
      yPosition += 15;
      doc.text('Edad: 35 años', 50, yPosition);
      yPosition += 15;

      yPosition += 20;

      // Historial de mediciones
      doc.fontSize(16).text('HISTORIAL DE MEDICIONES', 50, yPosition);
      yPosition += 25;

      // Headers de la tabla
      doc.fontSize(10);
      const headers = ['Fecha', 'Peso (kg)', 'IMC', 'Grasa (%)', 'Músculo (kg)', 'Observaciones'];
      const columnWidths = [60, 50, 40, 50, 60, 150];
      let xPosition = 50;

      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 15;

      // Línea bajo headers
      doc.moveTo(50, yPosition).lineTo(470, yPosition).stroke();
      yPosition += 5;

      // Datos de prueba
      const testMediciones = [
        { fecha: '01/08/2025', peso: '82.3', imc: '26.7', grasa: '18.5', musculo: '35.2', obs: 'Evaluación inicial' },
        { fecha: '01/09/2025', peso: '80.1', imc: '26.0', grasa: '17.8', musculo: '35.8', obs: 'Control mensual' }
      ];

      testMediciones.forEach((medicion, index) => {
        xPosition = 50;
        const valores = [medicion.fecha, medicion.peso, medicion.imc, medicion.grasa, medicion.musculo, medicion.obs];

        valores.forEach((valor, index) => {
          doc.text(String(valor), xPosition, yPosition);
          xPosition += columnWidths[index];
        });

        yPosition += 12;
      });

      // Footer
      doc.fontSize(8).text('Reporte generado el ' + new Date().toLocaleDateString('es-ES') + ' - Alimetria', 50, 780, { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => {
        console.log('✅ PDF completo generado exitosamente:', outputPath);
        resolve(outputPath);
      });
      
      stream.on('error', (error) => {
        console.error('❌ Error al generar PDF completo:', error);
        reject(error);
      });
      
    } catch (error) {
      console.error('❌ Error en testPDFCompleto:', error);
      reject(error);
    }
  });
}

// Ejecutar tests
async function runTests() {
  try {
    console.log('🚀 Ejecutando tests de PDF...\n');
    
    // Test 1
    const simplePath = await testPDFSimple();
    console.log('📁 Archivo generado:', simplePath);
    
    console.log('\n');
    
    // Test 2
    const completoPath = await testPDFCompleto();
    console.log('📁 Archivo generado:', completoPath);
    
    console.log('\n🎉 TODOS LOS TESTS COMPLETADOS');
    console.log('📋 INSTRUCCIONES:');
    console.log('1. Ve a la carpeta:', __dirname);
    console.log('2. Abre los archivos test-simple.pdf y test-completo.pdf');
    console.log('3. Si se abren correctamente → el problema está en el stream HTTP');
    console.log('4. Si NO se abren → el problema está en pdfkit o sus dependencias');
    
  } catch (error) {
    console.error('💥 ERROR EN TESTS:', error);
  }
}

runTests();
