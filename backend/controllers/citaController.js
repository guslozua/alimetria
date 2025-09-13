const Cita = require('../models/Cita');
const { validationResult } = require('express-validator');

class CitaController {
  // Obtener todas las citas con filtros
  static async obtenerCitas(req, res) {
    try {
      const filtros = {
        consultorio_id: req.query.consultorio_id,
        nutricionista_id: req.query.nutricionista_id,
        paciente_id: req.query.paciente_id,
        estado: req.query.estado,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        limit: req.query.limit
      };

      // Filtrar solo valores definidos
      Object.keys(filtros).forEach(key => 
        filtros[key] === undefined && delete filtros[key]
      );

      const citas = await Cita.obtenerTodas(filtros);
      
      res.json({
        success: true,
        data: citas,
        total: citas.length
      });
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener cita por ID
  static async obtenerCitaPorId(req, res) {
    try {
      const { id } = req.params;
      const cita = await Cita.obtenerPorId(id);

      if (!cita) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      res.json({
        success: true,
        data: cita
      });
    } catch (error) {
      console.error('Error al obtener cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener próximas citas (para dashboard)
  static async obtenerProximasCitas(req, res) {
    try {
      const nutricionista_id = req.query.nutricionista_id || req.user.id;
      const limit = parseInt(req.query.limit) || 5;

      const citas = await Cita.obtenerProximas(nutricionista_id, limit);
      
      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      console.error('Error al obtener próximas citas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nueva cita
  static async crearCita(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const citaData = {
        ...req.body,
        usuario_creador_id: req.user.id
      };

      // Verificar disponibilidad de horario
      const disponible = await Cita.verificarDisponibilidad(
        citaData.nutricionista_id,
        citaData.fecha_hora,
        citaData.duracion_minutos || 60
      );

      if (!disponible) {
        return res.status(409).json({
          success: false,
          message: 'El horario seleccionado no está disponible'
        });
      }

      const nuevaCita = await Cita.crear(citaData);
      
      res.status(201).json({
        success: true,
        message: 'Cita creada exitosamente',
        data: nuevaCita
      });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar cita existente
  static async actualizarCita(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const citaData = req.body;

      // Si se está cambiando fecha/hora o nutricionista, verificar disponibilidad
      if (citaData.fecha_hora || citaData.nutricionista_id || citaData.duracion_minutos) {
        const citaActual = await Cita.obtenerPorId(id);
        
        if (!citaActual) {
          return res.status(404).json({
            success: false,
            message: 'Cita no encontrada'
          });
        }

        const nutricionista_id = citaData.nutricionista_id || citaActual.nutricionista_id;
        const fecha_hora = citaData.fecha_hora || citaActual.fecha_hora;
        const duracion_minutos = citaData.duracion_minutos || citaActual.duracion_minutos;

        const disponible = await Cita.verificarDisponibilidad(
          nutricionista_id,
          fecha_hora,
          duracion_minutos,
          parseInt(id) // Excluir la cita actual de la verificación
        );

        if (!disponible) {
          return res.status(409).json({
            success: false,
            message: 'El horario seleccionado no está disponible'
          });
        }
      }

      const actualizado = await Cita.actualizar(id, citaData);
      
      if (!actualizado) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      // Obtener la cita actualizada para devolverla
      const citaActualizada = await Cita.obtenerPorId(id);

      res.json({
        success: true,
        message: 'Cita actualizada exitosamente',
        data: citaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Cancelar cita
  static async cancelarCita(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const cancelado = await Cita.cancelar(id, motivo);
      
      if (!cancelado) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cita cancelada exitosamente'
      });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Completar cita
  static async completarCita(req, res) {
    try {
      const { id } = req.params;
      const { notas_posteriores } = req.body;

      const completado = await Cita.completar(id, notas_posteriores);
      
      if (!completado) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cita marcada como completada exitosamente'
      });
    } catch (error) {
      console.error('Error al completar cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Verificar disponibilidad de horario
  static async verificarDisponibilidad(req, res) {
    try {
      const { nutricionista_id, fecha_hora, duracion_minutos } = req.query;
      const { id } = req.params; // ID de cita para excluir (en caso de edición)

      if (!nutricionista_id || !fecha_hora) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere nutricionista_id y fecha_hora'
        });
      }

      const disponible = await Cita.verificarDisponibilidad(
        nutricionista_id,
        fecha_hora,
        duracion_minutos || 60,
        id || null
      );

      res.json({
        success: true,
        disponible: disponible
      });
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de citas
  static async obtenerEstadisticas(req, res) {
    try {
      const filtros = {
        consultorio_id: req.query.consultorio_id,
        nutricionista_id: req.query.nutricionista_id,
        fecha_desde: req.query.fecha_desde
      };

      // Filtrar solo valores definidos
      Object.keys(filtros).forEach(key => 
        filtros[key] === undefined && delete filtros[key]
      );

      const estadisticas = await Cita.obtenerEstadisticas(filtros);
      
      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener citas para calendario (formato específico para FullCalendar)
  static async obtenerParaCalendario(req, res) {
    try {
      const filtros = {
        consultorio_id: req.query.consultorio_id,
        nutricionista_id: req.query.nutricionista_id,
        fecha_desde: req.query.start, // FullCalendar envía 'start' y 'end'
        fecha_hasta: req.query.end
      };

      // Filtrar solo valores definidos
      Object.keys(filtros).forEach(key => 
        filtros[key] === undefined && delete filtros[key]
      );

      const citas = await Cita.obtenerTodas(filtros);
      
      // Formatear para FullCalendar
      const eventosCalendario = citas.map(cita => ({
        id: cita.id,
        title: `${cita.paciente_nombre} - ${cita.tipo_consulta}`,
        start: cita.fecha_hora,
        end: new Date(new Date(cita.fecha_hora).getTime() + (cita.duracion_minutos * 60000)).toISOString(),
        backgroundColor: getColorByEstado(cita.estado),
        borderColor: getColorByEstado(cita.estado),
        extendedProps: {
          paciente_id: cita.paciente_id,
          paciente_nombre: cita.paciente_nombre,
          nutricionista_id: cita.nutricionista_id,
          nutricionista_nombre: cita.nutricionista_nombre,
          estado: cita.estado,
          tipo_consulta: cita.tipo_consulta,
          motivo: cita.motivo,
          telefono: cita.paciente_telefono
        }
      }));
      
      res.json(eventosCalendario);
    } catch (error) {
      console.error('Error al obtener citas para calendario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar cita
  static async eliminarCita(req, res) {
    try {
      const { id } = req.params;

      const eliminado = await Cita.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cita eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

// Función helper para obtener colores según el estado
function getColorByEstado(estado) {
  const colores = {
    'programada': '#3788d8', // Azul
    'confirmada': '#28a745', // Verde
    'en_curso': '#ffc107',   // Amarillo
    'completada': '#6c757d', // Gris
    'cancelada': '#dc3545',  // Rojo
    'no_asistio': '#fd7e14'  // Naranja
  };
  return colores[estado] || '#3788d8';
}

module.exports = CitaController;
