const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.configurarTransporter();
  }

  configurarTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // Ignorar certificados autofirmados
        }
      });

      // Verificar configuración
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('❌ Error en configuración de email:', error);
          } else {
            console.log('✅ Servidor de email configurado correctamente');
          }
        });
      } else {
        console.warn('⚠️ Configuración de email no encontrada. Las notificaciones por email no funcionarán.');
      }
    } catch (error) {
      console.error('❌ Error configurando transporter de email:', error);
    }
  }

  async enviarEmail(destinatario, asunto, contenidoHTML, contenidoTexto = null) {
    if (!this.transporter) {
      console.warn('⚠️ Transporter de email no configurado');
      return false;
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Credenciales de email no configuradas');
      return false;
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM_NAME || 'Alimetria - Sistema de Nutrición',
          address: process.env.SMTP_FROM || process.env.SMTP_USER
        },
        to: destinatario,
        subject: asunto,
        html: contenidoHTML,
        text: contenidoTexto || this.htmlToText(contenidoHTML)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  htmlToText(html) {
    // Convertir HTML básico a texto plano
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  // Plantillas de email para diferentes tipos de notificaciones
  generarPlantillaRecordatorioCita(datos) {
    const { paciente_nombre, paciente_apellido, fecha_hora, nutricionista_nombre, consultorio_nombre } = datos;
    
    const fechaCita = new Date(fecha_hora);
    const fechaFormateada = fechaCita.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaFormateada = fechaCita.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const asunto = `Recordatorio de Cita - ${fechaFormateada}`;
    
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #1976d2; font-size: 24px; font-weight: bold; }
          .content { line-height: 1.6; color: #333; }
          .cita-info { background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏥 ${consultorio_nombre || 'Alimetria'}</div>
          </div>
          
          <div class="content">
            <h2>Recordatorio de Cita</h2>
            
            <p>Estimado/a <strong>${paciente_nombre} ${paciente_apellido}</strong>,</p>
            
            <p>Le recordamos que tiene una cita programada con nuestro consultorio:</p>
            
            <div class="cita-info">
              <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
              <p><strong>🕐 Hora:</strong> ${horaFormateada}</p>
              <p><strong>👨‍⚕️ Profesional:</strong> ${nutricionista_nombre}</p>
            </div>
            
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Por favor confirme su asistencia</li>
              <li>Llegue 10 minutos antes de su cita</li>
              <li>En caso de no poder asistir, le pedimos que cancele con al menos 24hs de anticipación</li>
            </ul>
            
            <p>¡Esperamos verle pronto!</p>
          </div>
          
          <div class="footer">
            <p>Este es un mensaje automático del sistema de gestión ${consultorio_nombre || 'Alimetria'}</p>
            <p>Por favor no responda a este email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { asunto, contenidoHTML };
  }

  generarPlantillaMedicionPendiente(datos) {
    const { paciente_nombre, paciente_apellido, dias_desde_ultima } = datos;
    
    const asunto = 'Recordatorio - Control de Seguimiento';
    
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #1976d2; font-size: 24px; font-weight: bold; }
          .content { line-height: 1.6; color: #333; }
          .alert-info { background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📊 Alimetria - Control de Seguimiento</div>
          </div>
          
          <div class="content">
            <h2>Recordatorio de Control</h2>
            
            <p>Estimado/a <strong>${paciente_nombre} ${paciente_apellido}</strong>,</p>
            
            <div class="alert-info">
              <p><strong>⏰ Es hora de su control de seguimiento</strong></p>
              <p>Han pasado ${dias_desde_ultima} días desde su última medición.</p>
            </div>
            
            <p>Le recomendamos programar una nueva cita para continuar con su seguimiento nutricional y evaluar su progreso.</p>
            
            <p>¡Su salud es nuestra prioridad!</p>
          </div>
          
          <div class="footer">
            <p>Este es un mensaje automático del sistema Alimetria</p>
            <p>Por favor no responda a este email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { asunto, contenidoHTML };
  }

  async enviarRecordatorioCita(datosEmail, datosCita) {
    const plantilla = this.generarPlantillaRecordatorioCita(datosCita);
    return await this.enviarEmail(datosEmail, plantilla.asunto, plantilla.contenidoHTML);
  }

  async enviarMedicionPendiente(datosEmail, datosPaciente) {
    const plantilla = this.generarPlantillaMedicionPendiente(datosPaciente);
    return await this.enviarEmail(datosEmail, plantilla.asunto, plantilla.contenidoHTML);
  }
}

// Singleton para reutilizar la instancia
const emailService = new EmailService();

module.exports = emailService;
