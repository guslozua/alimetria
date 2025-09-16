const Notificacion = require('../models/Notificacion');
const emailService = require('./emailService');
const cron = require('node-cron');

class NotificacionService {
  constructor() {
    this.iniciado = false;
    this.intervalos = {};
  }

  iniciar() {
    if (this.iniciado) {
      console.log('⚠️ Servicio de notificaciones ya está iniciado');
      return;
    }

    console.log('🔔 Iniciando servicio de notificaciones...');

    // Procesar notificaciones pendientes cada 5 minutos
    this.intervalos.procesarPendientes = cron.schedule('*/5 * * * *', () => {
      this.procesarNotificacionesPendientes();
    }, {
      scheduled: true,
      timezone: "America/Argentina/Tucuman"
    });

    // Generar recordatorios de citas automáticamente cada día a las 8:00 AM
    this.intervalos.recordatoriosCitas = cron.schedule('0 8 * * *', () => {
      this.generarRecordatoriosCitasAutomaticos();
    }, {
      scheduled: true,
      timezone: "America/Argentina/Tucuman"
    });

    // Verificar mediciones pendientes cada lunes a las 9:00 AM
    this.intervalos.medicionesPendientes = cron.schedule('0 9 * * 1', () => {
      this.verificarMedicionesPendientes();
    }, {
      scheduled: true,
      timezone: "America/Argentina/Tucuman"
    });

    this.iniciado = true;
    console.log('✅ Servicio de notificaciones iniciado correctamente');
  }

  detener() {
    if (!this.iniciado) {
      console.log('⚠️ Servicio de notificaciones no está iniciado');
      return;
    }

    Object.values(this.intervalos).forEach(intervalo => {
      if (intervalo && intervalo.destroy) {
        intervalo.destroy();
      }
    });

    this.intervalos = {};
    this.iniciado = false;
    console.log('🔔 Servicio de notificaciones detenido');
  }

  async procesarNotificacionesPendientes() {
    try {
      console.log('🔄 Procesando notificaciones pendientes...');
      
      const ahora = new Date();
      const notificacionesPendientes = await Notificacion.obtenerPendientesEnvio(ahora);

      console.log(`📧 ${notificacionesPendientes.length} notificaciones pendientes de envío`);

      for (const notificacion of notificacionesPendientes) {
        await this.enviarNotificacionPorEmail(notificacion);
      }

      if (notificacionesPendientes.length > 0) {
        console.log('✅ Procesamiento de notificaciones completado');
      }
    } catch (error) {
      console.error('❌ Error procesando notificaciones pendientes:', error);
    }
  }

  async enviarNotificacionPorEmail(notificacion) {
    try {
      let emailDestinatario = null;
      let datosPlantilla = {};

      // Determinar email del destinatario y preparar datos
      if (notificacion.tipo === 'cita_recordatorio' && notificacion.paciente_email) {
        emailDestinatario = notificacion.paciente_email;
        datosPlantilla = {
          paciente_nombre: notificacion.paciente_nombre,
          paciente_apellido: notificacion.paciente_apellido,
          fecha_hora: notificacion.cita_fecha_hora,
          nutricionista_nombre: notificacion.destinatario_nombre
        };
      } else if (notificacion.destinatario_email) {
        emailDestinatario = notificacion.destinatario_email;
        datosPlantilla = {
          paciente_nombre: notificacion.paciente_nombre,
          paciente_apellido: notificacion.paciente_apellido
        };
      }

      if (!emailDestinatario) {
        console.warn(`⚠️ No se encontró email para notificación ${notificacion.id}`);
        return false;
      }

      let emailEnviado = false;

      // Enviar según el tipo de notificación
      switch (notificacion.tipo) {
        case 'cita_recordatorio':
          emailEnviado = await emailService.enviarRecordatorioCita(
            emailDestinatario,
            datosPlantilla
          );
          break;

        case 'medicion_pendiente':
          emailEnviado = await emailService.enviarMedicionPendiente(
            emailDestinatario,
            datosPlantilla
          );
          break;

        default:
          // Para otros tipos, enviar email genérico
          emailEnviado = await emailService.enviarEmail(
            emailDestinatario,
            notificacion.titulo,
            `<p>${notificacion.mensaje}</p>`
          );
          break;
      }

      if (emailEnviado) {
        await Notificacion.marcarComoEnviada(notificacion.id);
        console.log(`✅ Email enviado para notificación ${notificacion.id}`);
      } else {
        console.warn(`⚠️ No se pudo enviar email para notificación ${notificacion.id}`);
      }

      return emailEnviado;
    } catch (error) {
      console.error(`❌ Error enviando email para notificación ${notificacion.id}:`, error);
      return false;
    }
  }

  async generarRecordatoriosCitasAutomaticos() {
    try {
      console.log('📅 Generando recordatorios automáticos de citas...');
      
      const db = require('../config/database');
      
      // Obtener citas para mañana que no tengan recordatorio
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      manana.setHours(0, 0, 0, 0);
      
      const finManana = new Date(manana);
      finManana.setHours(23, 59, 59, 999);

      const query = `
        SELECT c.*, p.nombre, p.apellido, p.email,
               u.nombre as nutricionista_nombre
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN usuarios u ON c.nutricionista_id = u.id
        WHERE c.fecha_hora BETWEEN ? AND ?
          AND c.estado IN ('programada', 'confirmada')
          AND NOT EXISTS (
            SELECT 1 FROM notificaciones n 
            WHERE n.cita_relacionada_id = c.id 
              AND n.tipo = 'cita_recordatorio'
              AND n.activo = 1
          )
      `;

      const [citas] = await db.execute(query, [manana, finManana]);

      console.log(`🔔 ${citas.length} citas encontradas para generar recordatorios`);

      for (const cita of citas) {
        if (cita.email) { // Solo crear recordatorio si el paciente tiene email
          await Notificacion.crearRecordatorioCita(cita.id, 1); // 1 día previo
          console.log(`✅ Recordatorio creado para cita ${cita.id}`);
        }
      }

      console.log('✅ Generación de recordatorios completada');
    } catch (error) {
      console.error('❌ Error generando recordatorios automáticos:', error);
    }
  }

  async verificarMedicionesPendientes() {
    try {
      console.log('📊 Verificando mediciones pendientes...');
      
      const db = require('../config/database');
      
      // Obtener pacientes sin mediciones en los últimos 30 días
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const query = `
        SELECT p.*, 
               DATEDIFF(NOW(), COALESCE(m.ultima_medicion, p.fecha_creacion)) as dias_sin_medicion,
               u.id as nutricionista_id, u.email as nutricionista_email
        FROM pacientes p
        LEFT JOIN (
          SELECT paciente_id, MAX(fecha_medicion) as ultima_medicion
          FROM mediciones 
          WHERE activo = 1
          GROUP BY paciente_id
        ) m ON p.id = m.paciente_id
        LEFT JOIN usuarios u ON p.usuario_creador_id = u.id
        WHERE p.activo = 1
          AND (m.ultima_medicion IS NULL OR m.ultima_medicion < ?)
          AND NOT EXISTS (
            SELECT 1 FROM notificaciones n
            WHERE n.paciente_relacionado_id = p.id
              AND n.tipo = 'medicion_pendiente'
              AND n.activo = 1
              AND DATE(n.fecha_creacion) = CURDATE()
          )
      `;

      const [pacientes] = await db.execute(query, [hace30Dias]);

      console.log(`📋 ${pacientes.length} pacientes con mediciones pendientes`);

      for (const paciente of pacientes) {
        if (paciente.nutricionista_id) {
          await Notificacion.crear({
            tipo: 'medicion_pendiente',
            titulo: 'Medición Pendiente',
            mensaje: `El paciente ${paciente.nombre} ${paciente.apellido} no tiene mediciones registradas en los últimos ${paciente.dias_sin_medicion} días.`,
            destinatario_id: paciente.nutricionista_id,
            paciente_relacionado_id: paciente.id
          });
          
          console.log(`📊 Alerta de medición pendiente creada para paciente ${paciente.id}`);
        }
      }

      console.log('✅ Verificación de mediciones pendientes completada');
    } catch (error) {
      console.error('❌ Error verificando mediciones pendientes:', error);
    }
  }

  // Método para crear notificación manual
  async crearNotificacionManual(datos) {
    try {
      const notificacion = await Notificacion.crear(datos);
      
      // Si es para envío inmediato, procesarla
      if (!datos.fecha_programada || new Date(datos.fecha_programada) <= new Date()) {
        setTimeout(() => {
          this.enviarNotificacionPorEmail(notificacion);
        }, 1000); // Delay de 1 segundo para que se guarde en BD
      }

      return notificacion;
    } catch (error) {
      console.error('❌ Error creando notificación manual:', error);
      throw error;
    }
  }
}

// Singleton
const notificacionService = new NotificacionService();

module.exports = notificacionService;
