const Notificacion = require('../models/Notificacion');
const { validationResult } = require('express-validator');

const notificacionController = {
  // Obtener todas las notificaciones del usuario actual
  async obtenerMisNotificaciones(req, res) {
    try {
      // DEBUG: logs para diagnosticar
      console.log('🔍 DEBUG obtenerMisNotificaciones - req.user:', req.user);
      console.log('🔍 DEBUG obtenerMisNotificaciones - req.query:', req.query);
      
      const { tipo, leidas, limit = 50, offset = 0 } = req.query;
      const usuarioId = req.user.id;
      const esAdmin = req.user.rol === 'administrador';

      const opciones = {
        tipo: tipo || null,
        leidas: leidas !== undefined ? leidas === 'true' : null,
        limit: parseInt(limit),
        offset: parseInt(offset),
        incluirTodas: esAdmin && req.query.todas === 'true'
      };
      
      console.log('🔍 DEBUG obtenerMisNotificaciones - opciones:', opciones);
      console.log('🔍 DEBUG obtenerMisNotificaciones - usuarioId:', usuarioId);

      // Obtener notificaciones paginadas
      const notificaciones = await Notificacion.obtenerPorUsuario(usuarioId, opciones);
      
      // Obtener estadísticas completas del usuario
      const estadisticas = await Notificacion.obtenerEstadisticas(usuarioId);
      
      console.log('🔍 DEBUG obtenerMisNotificaciones - notificaciones encontradas:', notificaciones.length);
      console.log('🔍 DEBUG obtenerMisNotificaciones - estadisticas completas:', estadisticas);

      res.json({
        success: true,
        data: {
          notificaciones,
          total: parseInt(estadisticas.total) || 0,
          noLeidas: parseInt(estadisticas.no_leidas) || 0,
          leidas: parseInt(estadisticas.leidas) || 0,
          estadisticas: estadisticas,
          paginaActual: Math.ceil(offset / limit) + 1,
          totalPaginas: Math.ceil(estadisticas.total / limit),
          itemsPorPagina: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener una notificación específica
  async obtenerNotificacion(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;
      const esAdmin = req.user.rol === 'administrador';

      const notificacion = await Notificacion.obtenerPorId(id);

      if (!notificacion) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      // Verificar que el usuario tenga acceso a esta notificación
      if (!esAdmin && notificacion.destinatario_id !== usuarioId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a esta notificación'
        });
      }

      res.json({
        success: true,
        data: notificacion
      });
    } catch (error) {
      console.error('Error al obtener notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Crear una nueva notificación (solo admins y nutricionistas)
  async crearNotificacion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const {
        tipo,
        titulo,
        mensaje,
        destinatario_id,
        paciente_relacionado_id,
        cita_relacionada_id,
        fecha_programada
      } = req.body;

      const notificacion = await Notificacion.crear({
        tipo,
        titulo,
        mensaje,
        destinatario_id,
        paciente_relacionado_id,
        cita_relacionada_id,
        fecha_programada
      });

      res.status(201).json({
        success: true,
        message: 'Notificación creada exitosamente',
        data: notificacion
      });
    } catch (error) {
      console.error('Error al crear notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Marcar notificación como leída
  async marcarComoLeida(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;
      const esAdmin = req.user.rol === 'administrador';

      const resultado = await Notificacion.marcarComoLeida(
        id, 
        esAdmin ? null : usuarioId // Admins pueden marcar cualquier notificación
      );

      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada o sin permisos'
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Marcar todas las notificaciones como leídas
  async marcarTodasComoLeidas(req, res) {
    try {
      const usuarioId = req.user.id;
      
      // Obtener todas las notificaciones no leídas del usuario
      const notificacionesNoLeidas = await Notificacion.obtenerPorUsuario(usuarioId, {
        leidas: false
      });

      // Marcar cada una como leída
      const promesas = notificacionesNoLeidas.map(notif => 
        Notificacion.marcarComoLeida(notif.id, usuarioId)
      );

      await Promise.all(promesas);

      res.json({
        success: true,
        message: `${notificacionesNoLeidas.length} notificaciones marcadas como leídas`
      });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Eliminar notificación
  async eliminarNotificacion(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;
      const esAdmin = req.user.rol === 'administrador';

      const resultado = await Notificacion.eliminar(
        id,
        esAdmin ? null : usuarioId // Admins pueden eliminar cualquier notificación
      );

      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada o sin permisos'
        });
      }

      res.json({
        success: true,
        message: 'Notificación eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Contar notificaciones no leídas
  async contarNoLeidas(req, res) {
    try {
      const usuarioId = req.user.id;
      const total = await Notificacion.contarNoLeidas(usuarioId);

      res.json({
        success: true,
        data: { total }
      });
    } catch (error) {
      console.error('Error al contar notificaciones no leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Crear recordatorio de cita automáticamente
  async crearRecordatorioCita(req, res) {
    try {
      const { cita_id, dias_previos = 1 } = req.body;

      if (!cita_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita es requerido'
        });
      }

      const notificacion = await Notificacion.crearRecordatorioCita(
        cita_id, 
        parseInt(dias_previos)
      );

      res.status(201).json({
        success: true,
        message: 'Recordatorio de cita creado exitosamente',
        data: notificacion
      });
    } catch (error) {
      console.error('Error al crear recordatorio de cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener notificaciones pendientes de envío (para procesos automáticos)
  async obtenerPendientesEnvio(req, res) {
    try {
      const { fecha_limite } = req.query;
      const fechaLimite = fecha_limite ? new Date(fecha_limite) : new Date();

      const notificaciones = await Notificacion.obtenerPendientesEnvio(fechaLimite);

      res.json({
        success: true,
        data: {
          notificaciones,
          total: notificaciones.length
        }
      });
    } catch (error) {
      console.error('Error al obtener notificaciones pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = notificacionController;
