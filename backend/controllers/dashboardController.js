const { pool } = require('../config/database');

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
  try {
    console.log('📈 Petición recibida en /api/dashboard/stats');
    console.log('👤 Usuario:', req.user ? req.user.id : 'No autenticado');
    
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    // Obtener la fecha actual y la del mes anterior
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // Formatear fechas para MySQL
    const formatDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');
    
    const currentMonthStart = formatDate(startOfCurrentMonth);
    const lastMonthStart = formatDate(startOfLastMonth);
    const lastMonthEnd = formatDate(endOfLastMonth);
    const today = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    const tomorrow = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

    // 1. Total de pacientes activos
    const [totalPacientesResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM pacientes WHERE activo = 1'
    );
    const totalPacientes = totalPacientesResult[0].total;

    // Total de pacientes del mes anterior
    const [totalPacientesLastMonthResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM pacientes WHERE activo = 1 AND fecha_creacion < ?',
      [currentMonthStart]
    );
    const totalPacientesLastMonth = totalPacientesLastMonthResult[0].total;

    // 2. Citas de hoy
    const [citasHoyResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE DATE(fecha_hora) = DATE(?) AND estado NOT IN ('cancelada')`,
      [today]
    );
    const citasHoy = citasHoyResult[0].total;

    // Citas del mismo día del mes anterior
    const dayOfMonth = now.getDate();
    const lastMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, dayOfMonth);
    const lastMonthSameDayStr = formatDate(lastMonthSameDay);
    
    const [citasLastMonthSameDayResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE DATE(fecha_hora) = DATE(?) AND estado NOT IN ('cancelada')`,
      [lastMonthSameDayStr]
    );
    const citasLastMonthSameDay = citasLastMonthSameDayResult[0].total;

    // 3. Citas pendientes (programadas o confirmadas)
    const [citasPendientesResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE fecha_hora >= ? AND estado IN ('programada', 'confirmada')`,
      [formatDate(now)]
    );
    const citasPendientes = citasPendientesResult[0].total;

    // Citas pendientes del mes anterior
    const [citasPendientesLastMonthResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE fecha_hora >= ? AND fecha_hora < ? AND estado IN ('programada', 'confirmada')`,
      [lastMonthStart, currentMonthStart]
    );
    const citasPendientesLastMonth = citasPendientesLastMonthResult[0].total;

    // 4. Citas completadas este mes
    const [citasCompletadasResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE fecha_hora >= ? AND estado = 'completada'`,
      [currentMonthStart]
    );
    const citasCompletadas = citasCompletadasResult[0].total;

    // Citas completadas el mes anterior
    const [citasCompletadasLastMonthResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE fecha_hora >= ? AND fecha_hora <= ? AND estado = 'completada'`,
      [lastMonthStart, lastMonthEnd]
    );
    const citasCompletadasLastMonth = citasCompletadasLastMonthResult[0].total;

    // Calcular porcentajes de cambio
    const calcularCambio = (actual, anterior) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return ((actual - anterior) / anterior * 100);
    };

    const formatearCambio = (cambio) => {
      const signo = cambio >= 0 ? '+' : '';
      return `${signo}${cambio.toFixed(1)}%`;
    };

    const statsCards = [
      {
        title: 'Total Pacientes',
        value: totalPacientes.toString(),
        change: formatearCambio(calcularCambio(totalPacientes, totalPacientesLastMonth)),
        trend: totalPacientes >= totalPacientesLastMonth ? 'up' : 'down',
        color: '#3b82f6'
      },
      {
        title: 'Citas Hoy',
        value: citasHoy.toString(),
        change: formatearCambio(calcularCambio(citasHoy, citasLastMonthSameDay)),
        trend: citasHoy >= citasLastMonthSameDay ? 'up' : 'down',
        color: '#10b981'
      },
      {
        title: 'Pendientes',
        value: citasPendientes.toString(),
        change: formatearCambio(calcularCambio(citasPendientes, citasPendientesLastMonth)),
        trend: citasPendientes >= citasPendientesLastMonth ? 'up' : 'down',
        color: '#f59e0b'
      },
      {
        title: 'Completadas',
        value: citasCompletadas.toString(),
        change: formatearCambio(calcularCambio(citasCompletadas, citasCompletadasLastMonth)),
        trend: citasCompletadas >= citasCompletadasLastMonth ? 'up' : 'down',
        color: '#8b5cf6'
      }
    ];

    console.log('✅ Estadísticas calculadas:', {
      totalPacientes,
      citasHoy,
      citasPendientes,
      citasCompletadas
    });

    res.json({
      success: true,
      data: {
        statsCards
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

// Obtener actividad reciente
const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Obtener actividad reciente combinando citas y mediciones
    const [recentActivity] = await pool.execute(`
      (
        SELECT 
          'cita' as tipo,
          c.id,
          CONCAT(p.nombre, ' ', p.apellido) as nombre,
          CASE 
            WHEN c.estado = 'completada' THEN 'Cita completada'
            WHEN c.estado = 'cancelada' THEN 'Cita cancelada'
            WHEN c.estado = 'no_asistio' THEN 'No asistió a cita'
            ELSE CONCAT('Cita ', c.estado)
          END as accion,
          c.fecha_actualizacion as fecha,
          c.fecha_actualizacion
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.id
        WHERE p.activo = 1
      )
      UNION ALL
      (
        SELECT 
          'medicion' as tipo,
          m.id,
          CONCAT(p.nombre, ' ', p.apellido) as nombre,
          CASE 
            WHEN m.tipo = 'inbody' THEN 'Nueva medición InBody registrada'
            ELSE 'Nueva medición registrada'
          END as accion,
          m.fecha_actualizacion as fecha,
          m.fecha_actualizacion
        FROM mediciones m
        JOIN pacientes p ON m.paciente_id = p.id
        WHERE m.activo = 1 AND p.activo = 1
      )
      ORDER BY fecha_actualizacion DESC
      LIMIT ?
    `, [limit]);

    // Formatear las actividades con tiempo relativo
    const formatearTiempoRelativo = (fecha) => {
      const ahora = new Date();
      const fechaActividad = new Date(fecha);
      const diferencia = Math.floor((ahora - fechaActividad) / 1000);

      if (diferencia < 60) return `${diferencia} seg`;
      if (diferencia < 3600) return `${Math.floor(diferencia / 60)} min`;
      if (diferencia < 86400) return `${Math.floor(diferencia / 3600)} h`;
      return `${Math.floor(diferencia / 86400)} d`;
    };

    const actividadesProcesadas = recentActivity.map(actividad => ({
      type: actividad.tipo,
      name: actividad.nombre,
      action: actividad.accion,
      time: formatearTiempoRelativo(actividad.fecha),
      fecha: actividad.fecha
    }));

    res.json({
      success: true,
      data: actividadesProcesadas
    });

  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener actividad reciente'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity
};
