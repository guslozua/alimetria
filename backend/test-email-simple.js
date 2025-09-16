const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmailSimple = async () => {
  console.log('🧪 Test simple de email...');
  console.log('📧 Configuración:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Puerto:', process.env.SMTP_PORT);
  console.log('Usuario:', process.env.SMTP_USER);
  console.log('Password configurado:', process.env.SMTP_PASS ? 'SÍ' : 'NO');
  
  try {
    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Ignorar certificados autofirmados
      }
    });

    // Verificar configuración
    console.log('🔍 Verificando configuración...');
    await transporter.verify();
    console.log('✅ Configuración SMTP válida');

    // Enviar email de prueba
    console.log('📧 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: {
        name: 'Alimetria - Sistema de Nutrición',
        address: process.env.SMTP_USER
      },
      to: process.env.SMTP_USER,
      subject: '🧪 Test de Email - Alimetria',
      html: `
        <h2>¡Email de Prueba Exitoso!</h2>
        <p>Este email confirma que la configuración de Alimetria está funcionando correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p><strong>Sistema:</strong> Alimetria - Consultorio de Nutrición</p>
        <hr>
        <p><em>Este es un email automático generado por el sistema de notificaciones.</em></p>
      `
    });

    console.log('✅ ¡Email enviado exitosamente!');
    console.log('📧 ID del mensaje:', info.messageId);
    console.log('📬 Revisa tu bandeja de entrada en:', process.env.SMTP_USER);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('🔑 Error de autenticación - Verificar App Password');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 Error de conexión - Verificar host y puerto');
    } else if (error.code === 'ECONNECTION') {
      console.log('🔌 Error de conexión - Verificar firewall/proxy');
    }
    
    return false;
  }
};

// Ejecutar
testEmailSimple()
  .then((exito) => {
    if (exito) {
      console.log('\n🎉 ¡Test completado exitosamente!');
      console.log('El sistema de email está listo para usar.');
    } else {
      console.log('\n❌ Test falló. Revisar configuración.');
    }
    process.exit(exito ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
