const emailService = require('./utils/emailService');
require('dotenv').config();

const testearEmail = async () => {
  console.log('🧪 Probando configuración de email...');
  
  // Datos de prueba
  const datosPrueba = {
    paciente_nombre: 'Juan',
    paciente_apellido: 'Pérez',
    fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
    nutricionista_nombre: 'Dr. Gustavo Lozano',
    consultorio_nombre: 'Alimetria'
  };
  
  try {
    console.log('📧 Intentando enviar email de prueba...');
    console.log('📮 Destinatario:', process.env.SMTP_USER);
    
    const resultado = await emailService.enviarRecordatorioCita(
      process.env.SMTP_USER, // Enviarse a sí mismo
      datosPrueba
    );
    
    if (resultado) {
      console.log('✅ ¡Email enviado exitosamente!');
      console.log('📬 Revisa tu bandeja de entrada en guslozua@gmail.com');
      console.log('📧 Asunto: "Recordatorio de Cita"');
    } else {
      console.log('❌ Error enviando email');
      console.log('🔍 Revisa la configuración SMTP en el archivo .env');
    }
  } catch (error) {
    console.error('❌ Error en test de email:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que tengas 2FA habilitado en Gmail');
    console.log('2. Verificar que hayas generado una App Password');
    console.log('3. Verificar que la App Password esté correcta en .env');
    console.log('4. Verificar que el email en SMTP_USER sea correcto');
  }
  
  console.log('\n📋 Configuración actual:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Puerto:', process.env.SMTP_PORT);
  console.log('Usuario:', process.env.SMTP_USER);
  console.log('Password configurado:', process.env.SMTP_PASS ? 'SÍ' : 'NO');
};

// Ejecutar test
testearEmail()
  .then(() => {
    console.log('\n✅ Test completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en test:', error);
    process.exit(1);
  });
