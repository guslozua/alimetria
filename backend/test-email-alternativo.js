const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmailAlternativo = async () => {
  console.log('🧪 Test alternativo con SSL...');
  
  try {
    // Configuración alternativa con SSL
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Usar servicio predefinido de Gmail
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('🔍 Verificando configuración...');
    await transporter.verify();
    console.log('✅ Configuración Gmail válida');

    // Enviar email de prueba
    console.log('📧 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: '🧪 Test Alternativo - Alimetria',
      html: `
        <h2>¡Email de Prueba Exitoso!</h2>
        <p>Configuración alternativa funcionando correctamente.</p>
        <p><strong>Método:</strong> Gmail Service</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
      `
    });

    console.log('✅ ¡Email enviado exitosamente!');
    console.log('📧 ID:', info.messageId);
    console.log('📬 Revisa tu bandeja de entrada');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
};

// Ejecutar
testEmailAlternativo()
  .then((exito) => {
    console.log(exito ? '\n🎉 ¡Test exitoso!' : '\n❌ Test falló');
    process.exit(exito ? 0 : 1);
  });
