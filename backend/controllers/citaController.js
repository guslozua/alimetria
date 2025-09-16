const Cita = require('../models/Cita');
const Notificacion = require('../models/Notificacion');
const TimezoneUtils = require('../utils/timezoneUtils');
const { validationResult } = require('express-validator');

class CitaController {
  /**
   * Auto-actualizar estados de citas vencidas
   * Se ejecuta automáticamente en cada request de obtener citas
   * MEJORA: Incluye período de gracia de 2 horas
   */
  static async actualizarCitasVencidas() {
    try {
      const ahora = new Date();
      
      // *** MEJORA: Período de gracia de 2 horas después de la cita ***
      const horasGracia = 2;
      const fechaLimite = new Date(ahora.getTime() - (horasGracia * 60 * 60 * 1000));
      
      const citasVencidas = await Cita.obtenerCitasVencidas(fechaLimite);
      
      console.log(`🔄 Actualizando ${citasVencidas.length} citas vencidas (con ${horasGracia}h de gracia)...`);
      
      for (const cita of citasVencidas) {
        // Solo actualizar citas que están en estado 'programada' o 'confirmada'
        if (['programada', 'confirmada'].includes(cita.estado)) {
          await Cita.actualizar(cita.id, { 
            estado: 'no_asistio',
            notas_posteriores: `Actualizado automáticamente - paciente no asistió (${horasGracia}h de gracia aplicadas)`
          });
          console.log(`✅ Cita ${cita.id} marcada como 'no_asistio' automáticamente (con gracia)`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error al actualizar citas vencidas:', error.message);
    }
  }

  // Obtener todas las citas con filtros
  static async obtenerCitas(req, res) {
    try {
      // Auto-actualizar citas vencidas primero
      await CitaController.actualizarCitasVencidas();

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
      
      // Convertir fechas para el frontend sin conversiones de zona horaria
      const citasParaFrontend = citas.map(cita => ({
        ...cita,
        fecha_hora: TimezoneUtils.paraFrontend(cita.fecha_hora),
        // Agregar campos calculados útiles
        es_pasada: TimezoneUtils.esPasado(cita.fecha_hora),
        fecha_formateada: TimezoneUtils.formatearFechaArgentina(cita.fecha_hora)
      }));
      
      res.json({
        success: true,
        data: citasParaFrontend,
        total: citasParaFrontend.length
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

      // Convertir fecha para frontend
      const citaParaFrontend = {
        ...cita,
        fecha_hora: TimezoneUtils.paraFrontend(cita.fecha_hora),
        es_pasada: TimezoneUtils.esPasado(cita.fecha_hora),
        fecha_formateada: TimezoneUtils.formatearFechaArgentina(cita.fecha_hora)
      };

      res.json({
        success: true,
        data: citaParaFrontend
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
      // Auto-actualizar citas vencidas primero
      await CitaController.actualizarCitasVencidas();

      const nutricionista_id = req.query.nutricionista_id || req.user.id;
      const limit = parseInt(req.query.limit) || 5;

      const citas = await Cita.obtenerProximas(nutricionista_id, limit);
      
      // Convertir fechas para frontend
      const citasParaFrontend = citas.map(cita => ({
        ...cita,
        fecha_hora: TimezoneUtils.paraFrontend(cita.fecha_hora),
        fecha_formateada: TimezoneUtils.formatearFechaArgentina(cita.fecha_hora)
      }));
      
      res.json({
        success: true,
        data: citasParaFrontend
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
      console.log('🔍 DEBUG crearCita - req.body completo:', req.body);
      
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      // Procesar fecha del frontend
      const fechaHoraProcesada = TimezoneUtils.procesarFechaFrontend(req.body.fecha_hora);
      
      console.log('🔍 DEBUG crearCita - fecha original:', req.body.fecha_hora);
      console.log('🔍 DEBUG crearCita - fecha procesada:', fechaHoraProcesada);

      const citaData = {
        ...req.body,
        fecha_hora: fechaHoraProcesada,
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
      
      console.log('✅ Cita creada con ID:', nuevaCita.id);
      
      // Crear recordatorio automático si la cita es para más de 24 horas en el futuro
      try {
        const fechaCita = new Date(citaData.fecha_hora);
        const ahora = TimezoneUtils.ahora();
        const horasHastaeCita = (fechaCita - ahora) / (1000 * 60 * 60);
        
        if (horasHastaeCita > 24) {
          await Notificacion.crearRecordatorioCita(nuevaCita.id, 1);
          console.log(`✅ Recordatorio creado automáticamente para cita ${nuevaCita.id}`);
        } else {
          console.log('⚠️ No se crea recordatorio - cita es en menos de 24 horas');
        }
      } catch (notifError) {
        console.warn('⚠️ No se pudo crear recordatorio automático:', notifError.message);
      }
      
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
      console.log('🔍 DEBUG actualizarCita - req.body:', req.body);
      
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ DEBUG actualizarCita - Errores de validación:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      let citaData = { ...req.body };

      // Obtener la cita actual
      const citaActual = await Cita.obtenerPorId(id);
      if (!citaActual) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      // Si se está enviando una nueva fecha, procesarla
      if (citaData.fecha_hora) {
        citaData.fecha_hora = TimezoneUtils.procesarFechaFrontend(citaData.fecha_hora);
        console.log('🔍 DEBUG actualizarCita - fecha procesada:', citaData.fecha_hora);
      }

      // *** LÓGICA CORREGIDA PARA CITAS PASADAS ***
      const esPasada = TimezoneUtils.esPasado(citaActual.fecha_hora);
      const esAdmin = req.user.rol === 'administrador';
      
      if (esPasada) {
        console.log('🔍 DEBUG - Cita es pasada, verificando permisos y reglas');
        
        // Si hay cambio de fecha en cita pasada
        if (citaData.fecha_hora) {
          const fechaOriginalUTC = new Date(citaActual.fecha_hora).getTime();
          const fechaNuevaUTC = new Date(citaData.fecha_hora).getTime();
          const fechaCambio = Math.abs(fechaOriginalUTC - fechaNuevaUTC) > 60000; // Margen de 1 minuto
          
          console.log('🔍 DEBUG - Comparación de fechas:');
          console.log('  - Fecha original UTC:', new Date(citaActual.fecha_hora).toISOString());
          console.log('  - Fecha nueva UTC:', new Date(citaData.fecha_hora).toISOString());
          console.log('  - ¿Cambió la fecha?:', fechaCambio);
          console.log('  - Es administrador?:', esAdmin);
          
          if (fechaCambio) {
            // OPCIÓN 1: Solo permitir cambio a fecha futura
            const nuevaFechaEsFutura = !TimezoneUtils.esPasado(citaData.fecha_hora);
            
            if (!nuevaFechaEsFutura && !esAdmin) {
              return res.status(400).json({
                success: false,
                message: 'No se puede cambiar una cita pasada a otra fecha también pasada. Solo administradores pueden hacer esto.'
              });
            }
            
            // OPCIÓN 2: Los administradores pueden cambiar cualquier fecha
            if (!nuevaFechaEsFutura && esAdmin) {
              console.log('✅ Administrador cambiando cita pasada a otra fecha pasada - permitido');
            } else if (nuevaFechaEsFutura) {
              console.log('✅ Reagendando cita pasada a fecha futura - permitido');
            }
          } else {
            console.log('✅ Fecha no cambió significativamente - permitido');
          }
        }
        
        // Para citas pasadas, validar estados apropiados solo si se cambia el estado
        if (citaData.estado && !citaData.fecha_hora) {
          const estadosPermitidosParaPasadas = ['completada', 'no_asistio', 'cancelada'];
          if (!estadosPermitidosParaPasadas.includes(citaData.estado) && !esAdmin) {
            return res.status(400).json({
              success: false,
              message: `Para citas pasadas solo se permiten los estados: ${estadosPermitidosParaPasadas.join(', ')}`
            });
          }
        }
        
      }

      // Verificar disponibilidad solo si se cambia la fecha/hora
      if (citaData.fecha_hora && citaData.nutricionista_id) {
        const disponible = await Cita.verificarDisponibilidad(
          citaData.nutricionista_id,
          citaData.fecha_hora,
          citaData.duracion_minutos || citaActual.duracion_minutos,
          id // Excluir la cita actual de la verificación
        );

        if (!disponible) {
          return res.status(409).json({
            success: false,
            message: 'El horario seleccionado no está disponible'
          });
        }
      }

      console.log('🔍 DEBUG - Datos finales para actualizar:', citaData);

      const actualizado = await Cita.actualizar(id, citaData);
      
      if (!actualizado) {
        return res.status(404).json({
          success: false,
          message: 'Error al actualizar la cita'
        });
      }

      // Obtener la cita actualizada para devolverla
      const citaActualizada = await Cita.obtenerPorId(id);
      
      // Convertir fecha para frontend
      const citaParaFrontend = {
        ...citaActualizada,
        fecha_hora: TimezoneUtils.paraFrontend(citaActualizada.fecha_hora)
      };

      res.json({
        success: true,
        message: 'Cita actualizada exitosamente',
        data: citaParaFrontend
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

      console.log('🔍 DEBUG verificarDisponibilidad - parámetros recibidos:', {
        nutricionista_id,
        fecha_hora,
        duracion_minutos,
        citaId: id
      });

      if (!nutricionista_id || !fecha_hora) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere nutricionista_id y fecha_hora'
        });
      }

      // *** CORRECCIÓN: Usar la fecha directamente sin procesamiento extra ***
      // El frontend ya envía la fecha en el formato correcto
      const fechaParaVerificar = fecha_hora;
      
      console.log('🔍 DEBUG verificarDisponibilidad - fecha para verificar:', fechaParaVerificar);

      const disponible = await Cita.verificarDisponibilidad(
        nutricionista_id,
        fechaParaVerificar,
        duracion_minutos || 60,
        id || null
      );

      console.log('🔍 DEBUG verificarDisponibilidad - resultado:', disponible);

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
      // Auto-actualizar citas vencidas primero
      await CitaController.actualizarCitasVencidas();

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
      // Auto-actualizar citas vencidas primero
      await CitaController.actualizarCitasVencidas();

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
      
      // Formatear para FullCalendar con fechas correctas
      const eventosCalendario = citas.map(cita => {
        const fechaInicio = TimezoneUtils.paraFrontend(cita.fecha_hora);
        const fechaFin = new Date(new Date(fechaInicio).getTime() + (cita.duracion_minutos * 60000)).toISOString();
        
        return {
          id: cita.id,
          title: `${cita.paciente_nombre} - ${cita.tipo_consulta}`,
          start: fechaInicio,
          end: fechaFin,
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
            telefono: cita.paciente_telefono,
            es_pasada: TimezoneUtils.esPasado(cita.fecha_hora)
          }
        };
      });
      
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

  // Marcar citas como completadas manualmente
  static async marcarCompletada(req, res) {
    try {
      const { id } = req.params;
      const { notas_posteriores } = req.body;

      // Obtener la cita
      const cita = await Cita.obtenerPorId(id);
      if (!cita) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      // Permitir marcar como completada sin importar si es pasada o futura
      const actualizado = await Cita.actualizar(id, { 
        estado: 'completada',
        notas_posteriores: notas_posteriores || 'Marcada como completada manualmente'
      });

      if (!actualizado) {
        return res.status(500).json({
          success: false,
          message: 'Error al actualizar la cita'
        });
      }

      res.json({
        success: true,
        message: 'Cita marcada como completada exitosamente'
      });
    } catch (error) {
      console.error('Error al marcar cita como completada:', error);
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