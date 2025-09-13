const { pool } = require('../config/database');
const PDFDocument = require('pdfkit');

class ReportesController {
  
  // Obtener datos para reporte individual de paciente
  static async obtenerDatosPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const { fechaDesde, fechaHasta } = req.query;

      const [pacienteData] = await pool.execute(`
        SELECT p.*, c.nombre as consultorio_nombre,
               TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
        FROM pacientes p 
        LEFT JOIN consultorios c ON p.consultorio_id = c.id 
        WHERE p.id = ? AND p.activo = 1
      `, [pacienteId]);

      if (pacienteData.length === 0) {
        return res.status(404).json({ mensaje: 'Paciente no encontrado' });
      }

      const paciente = pacienteData[0];

      let queryMediciones = `
        SELECT m.*, u.nombre as usuario_nombre
        FROM mediciones m
        LEFT JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.paciente_id = ? AND m.activo = 1
      `;
      
      const params = [pacienteId];
      
      if (fechaDesde) {
        queryMediciones += ' AND DATE(m.fecha_medicion) >= ?';
        params.push(fechaDesde);
      }
      
      if (fechaHasta) {
        queryMediciones += ' AND DATE(m.fecha_medicion) <= ?';
        params.push(fechaHasta);
      }
      
      queryMediciones += ' ORDER BY m.fecha_medicion ASC';

      const [mediciones] = await pool.execute(queryMediciones, params);
      const estadisticas = ReportesController.calcularEstadisticas(mediciones);

      res.json({
        paciente,
        mediciones,
        estadisticas,
        totalMediciones: mediciones.length
      });

    } catch (error) {
      console.error('Error al obtener datos del paciente:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor',
        error: error.message 
      });
    }
  }

  // ⭐ NUEVO MÉTODO: Generar reporte PDF con buffer
  static async generarReportePaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const { fechaDesde, fechaHasta } = req.query;

      console.log('🔄 Generando reporte PDF para paciente:', pacienteId);

      const { paciente, mediciones, estadisticas } = await ReportesController.obtenerDatosReporteCompleto(pacienteId, fechaDesde, fechaHasta);

      if (!paciente) {
        return res.status(404).json({ mensaje: 'Paciente no encontrado' });
      }

      console.log('✅ Datos obtenidos:', { paciente: paciente.nombre, mediciones: mediciones.length });

      // ⭐ Generar PDF en buffer
      const pdfBuffer = await ReportesController.generarPDFBuffer(paciente, mediciones, estadisticas);

      const filename = `reporte_${paciente.nombre}_${paciente.apellido}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      console.log('📤 Enviando PDF buffer:', filename, 'Tamaño:', pdfBuffer.length, 'bytes');

      res.send(pdfBuffer);
      console.log('✅ PDF enviado exitosamente');

    } catch (error) {
      console.error('❌ Error al generar reporte PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          mensaje: 'Error al generar reporte PDF',
          error: error.message 
        });
      }
    }
  }

  // ⭐ NUEVO MÉTODO: Generar reporte consolidado con buffer
  static async generarReporteConsolidado(req, res) {
    try {
      const { fechaDesde, fechaHasta, consultorioId } = req.query;

      console.log('🔄 Generando reporte consolidado PDF');

      let whereConditions = ['p.activo = 1'];
      let params = [];

      if (consultorioId) {
        whereConditions.push('p.consultorio_id = ?');
        params.push(consultorioId);
      }

      const [pacientes] = await pool.execute(`
        SELECT p.id, p.nombre, p.apellido, p.sexo, p.fecha_nacimiento,
               TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
               c.nombre as consultorio_nombre,
               m.peso as ultimo_peso,
               m.imc as ultimo_imc,
               m.grasa_corporal as ultima_grasa
        FROM pacientes p
        LEFT JOIN consultorios c ON p.consultorio_id = c.id
        LEFT JOIN mediciones m ON p.id = m.paciente_id 
          AND m.fecha_medicion = (
            SELECT MAX(m2.fecha_medicion) 
            FROM mediciones m2 
            WHERE m2.paciente_id = p.id AND m2.activo = 1
          )
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY p.apellido, p.nombre
      `, params);

      let queryEstadisticas = `
        SELECT 
          COUNT(DISTINCT m.paciente_id) as pacientes_con_mediciones,
          COUNT(m.id) as total_mediciones,
          AVG(m.peso) as peso_promedio,
          AVG(m.imc) as imc_promedio,
          AVG(m.grasa_corporal) as grasa_promedio
        FROM mediciones m
        INNER JOIN pacientes p ON m.paciente_id = p.id
        WHERE m.activo = 1 AND p.activo = 1
      `;

      const estadisticasParams = [];
      
      if (consultorioId) {
        queryEstadisticas += ' AND p.consultorio_id = ?';
        estadisticasParams.push(consultorioId);
      }

      const [estadisticas] = await pool.execute(queryEstadisticas, estadisticasParams);

      console.log('✅ Datos obtenidos:', { pacientes: pacientes.length });

      // ⭐ Generar PDF consolidado en buffer
      const pdfBuffer = await ReportesController.generarPDFConsolidadoBuffer(pacientes, estadisticas[0] || {});

      const filename = `reporte_consolidado_${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      console.log('📤 Enviando PDF consolidado buffer:', filename, 'Tamaño:', pdfBuffer.length, 'bytes');

      res.send(pdfBuffer);
      console.log('✅ PDF consolidado enviado exitosamente');

    } catch (error) {
      console.error('❌ Error al generar reporte consolidado PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          mensaje: 'Error al generar reporte consolidado PDF',
          error: error.message 
        });
      }
    }
  }

  // Obtener datos consolidados
  static async obtenerDatosConsolidado(req, res) {
    try {
      const { fechaDesde, fechaHasta, consultorioId } = req.query;

      let whereConditions = ['p.activo = 1'];
      let params = [];

      if (consultorioId) {
        whereConditions.push('p.consultorio_id = ?');
        params.push(consultorioId);
      }

      const [pacientes] = await pool.execute(`
        SELECT p.id, p.nombre, p.apellido, p.sexo, p.fecha_nacimiento,
               TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
               c.nombre as consultorio_nombre
        FROM pacientes p
        LEFT JOIN consultorios c ON p.consultorio_id = c.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY p.apellido, p.nombre
      `, params);

      res.json({
        pacientes,
        totalPacientes: pacientes.length,
        fechaGeneracion: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error al obtener datos consolidados:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor',
        error: error.message 
      });
    }
  }

  // ⭐ MÉTODO NUEVO: Generar PDF en buffer
  static async generarPDFBuffer(paciente, mediciones, estadisticas) {
    return new Promise((resolve, reject) => {
      try {
        console.log('📄 Iniciando generación de PDF en buffer...');
        
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const buffers = [];
        
        doc.on('data', (chunk) => {
          buffers.push(chunk);
        });
        
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          console.log('✅ PDF buffer generado:', pdfBuffer.length, 'bytes');
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          console.error('❌ Error en generación de PDF buffer:', error);
          reject(error);
        });

        // Generar contenido del PDF
        ReportesController.generarContenidoPDF(doc, paciente, mediciones, estadisticas);
        
        doc.end();

      } catch (error) {
        console.error('❌ Error en generarPDFBuffer:', error);
        reject(error);
      }
    });
  }

  // ⭐ MÉTODO NUEVO: Generar PDF consolidado en buffer
  static async generarPDFConsolidadoBuffer(pacientes, estadisticas) {
    return new Promise((resolve, reject) => {
      try {
        console.log('📊 Iniciando generación de PDF consolidado en buffer...');
        
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const buffers = [];
        
        doc.on('data', (chunk) => {
          buffers.push(chunk);
        });
        
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          console.log('✅ PDF consolidado buffer generado:', pdfBuffer.length, 'bytes');
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          console.error('❌ Error en generación de PDF consolidado buffer:', error);
          reject(error);
        });

        // Generar contenido del PDF consolidado
        ReportesController.generarContenidoPDFConsolidado(doc, pacientes, estadisticas);
        
        doc.end();

      } catch (error) {
        console.error('❌ Error en generarPDFConsolidadoBuffer:', error);
        reject(error);
      }
    });
  }

  // Métodos auxiliares
  static async obtenerDatosReporteCompleto(pacienteId, fechaDesde, fechaHasta) {
    const [pacienteData] = await pool.execute(`
      SELECT p.*, c.nombre as consultorio_nombre,
             os.nombre as obra_social_nombre,
             os.codigo as obra_social_codigo,
             TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
      FROM pacientes p 
      LEFT JOIN consultorios c ON p.consultorio_id = c.id 
      LEFT JOIN obras_sociales os ON p.obra_social_id = os.id
      WHERE p.id = ? AND p.activo = 1
    `, [pacienteId]);

    if (pacienteData.length === 0) {
      return { paciente: null, mediciones: [], estadisticas: {} };
    }

    const paciente = pacienteData[0];

    let queryMediciones = `
      SELECT m.*, u.nombre as usuario_nombre
      FROM mediciones m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.paciente_id = ? AND m.activo = 1
    `;
    
    const params = [pacienteId];
    
    if (fechaDesde) {
      queryMediciones += ' AND DATE(m.fecha_medicion) >= ?';
      params.push(fechaDesde);
    }
    
    if (fechaHasta) {
      queryMediciones += ' AND DATE(m.fecha_medicion) <= ?';
      params.push(fechaHasta);
    }
    
    queryMediciones += ' ORDER BY m.fecha_medicion ASC';

    const [mediciones] = await pool.execute(queryMediciones, params);
    const estadisticas = ReportesController.calcularEstadisticas(mediciones);

    return { paciente, mediciones, estadisticas };
  }

  static calcularEstadisticas(mediciones) {
    if (mediciones.length === 0) return {};

    const valores = {
      peso: mediciones.filter(m => m.peso).map(m => parseFloat(m.peso)),
      imc: mediciones.filter(m => m.imc).map(m => parseFloat(m.imc)),
      grasa: mediciones.filter(m => m.grasa_corporal).map(m => parseFloat(m.grasa_corporal)),
      musculo: mediciones.filter(m => m.musculo).map(m => parseFloat(m.musculo))
    };

    const estadisticas = {};

    Object.keys(valores).forEach(key => {
      if (valores[key].length > 0) {
        const vals = valores[key];
        estadisticas[key] = {
          inicial: vals[0],
          actual: vals[vals.length - 1],
          cambio: vals.length > 1 ? vals[vals.length - 1] - vals[0] : 0
        };
      }
    });

    return estadisticas;
  }

  // Generar contenido PDF individual
  static generarContenidoPDF(doc, paciente, mediciones, estadisticas) {
    try {
      // Header
      doc.fontSize(20).text('REPORTE DE EVOLUCIÓN NUTRICIONAL', 50, 50, { align: 'center' });
      doc.fontSize(12).text('Alimetria - Sistema de Gestión Nutricional', 50, 75, { align: 'center' });
      
      doc.moveTo(50, 100).lineTo(545, 100).stroke();

      let yPosition = 120;

      // Información del paciente
      doc.fontSize(16).text('INFORMACIÓN DEL PACIENTE', 50, yPosition);
      yPosition += 25;

      doc.fontSize(11);
      const nombreCompleto = `${paciente.nombre || ''} ${paciente.apellido || ''}`;
      const sexoTexto = paciente.sexo === 'M' ? 'Masculino' : 'Femenino';
      
      doc.text(`Nombre: ${nombreCompleto}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Sexo: ${sexoTexto}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Edad: ${paciente.edad || 'N/A'} años`, 50, yPosition);
      yPosition += 15;
      
      // Agregar información de obra social si existe
      if (paciente.obra_social_nombre) {
        doc.text(`Obra Social: ${paciente.obra_social_nombre}${paciente.obra_social_codigo ? ` (${paciente.obra_social_codigo})` : ''}`, 50, yPosition);
        yPosition += 15;
        if (paciente.numero_afiliado) {
          doc.text(`Número de Afiliado: ${paciente.numero_afiliado}`, 50, yPosition);
          yPosition += 15;
        }
      }
      
      doc.text(`Altura: ${paciente.altura_inicial ? parseFloat(paciente.altura_inicial).toFixed(1) + ' cm' : 'N/A'}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Peso inicial: ${paciente.peso_inicial ? parseFloat(paciente.peso_inicial).toFixed(1) + ' kg' : 'N/A'}`, 50, yPosition);
      yPosition += 15;
      const pesoActual = estadisticas && estadisticas.peso && estadisticas.peso.actual ? parseFloat(estadisticas.peso.actual).toFixed(1) + ' kg' : 'N/A';
      doc.text(`Peso actual: ${pesoActual}`, 50, yPosition);
      yPosition += 30;

      // Estadísticas
      if (estadisticas && Object.keys(estadisticas).length > 0) {
        doc.fontSize(16).text('ESTADÍSTICAS GENERALES', 50, yPosition);
        yPosition += 25;

        doc.fontSize(11);
        if (estadisticas.peso) {
          doc.text(`Peso inicial: ${estadisticas.peso.inicial ? parseFloat(estadisticas.peso.inicial).toFixed(1) : 'N/A'} kg`, 50, yPosition);
          yPosition += 15;
          doc.text(`Peso actual: ${estadisticas.peso.actual ? parseFloat(estadisticas.peso.actual).toFixed(1) : 'N/A'} kg`, 50, yPosition);
          yPosition += 15;
          const cambio = estadisticas.peso.cambio || 0;
          doc.text(`Cambio de peso: ${cambio > 0 ? '+' : ''}${parseFloat(cambio).toFixed(1)} kg`, 50, yPosition);
          yPosition += 20;
        }
      }

      // Historial de mediciones
      doc.fontSize(16).text('HISTORIAL DE MEDICIONES', 50, yPosition);
      yPosition += 25;

      if (mediciones && mediciones.length > 0) {
        // Headers
        doc.fontSize(10);
        const headers = ['Fecha', 'Peso (kg)', 'IMC', 'Grasa (%)', 'Observaciones'];
        const columnWidths = [80, 60, 50, 60, 200];
        let xPosition = 50;

        headers.forEach((header, index) => {
          doc.text(header, xPosition, yPosition);
          xPosition += columnWidths[index];
        });
        yPosition += 15;

        doc.moveTo(50, yPosition).lineTo(500, yPosition).stroke();
        yPosition += 5;

        // Datos
        mediciones.forEach((medicion) => {
          if (yPosition > 750) {
            doc.addPage();
            yPosition = 50;
          }

          xPosition = 50;
          
          let fecha = 'N/A';
          try {
            if (medicion.fecha_medicion) {
              const fechaObj = new Date(medicion.fecha_medicion);
              if (!isNaN(fechaObj.getTime())) {
                fecha = fechaObj.toLocaleDateString('es-ES');
              }
            }
          } catch (e) {
            fecha = 'Fecha inválida';
          }
          
          const valores = [
            fecha,
            medicion.peso ? parseFloat(medicion.peso).toFixed(1) : '-',
            medicion.imc ? parseFloat(medicion.imc).toFixed(1) : '-',
            medicion.grasa_corporal ? parseFloat(medicion.grasa_corporal).toFixed(1) : '-',
            medicion.observaciones ? medicion.observaciones.substring(0, 50) : '-'
          ];

          valores.forEach((valor, index) => {
            doc.text(String(valor), xPosition, yPosition);
            xPosition += columnWidths[index];
          });

          yPosition += 12;
        });
      } else {
        doc.fontSize(11).text('No hay mediciones registradas.', 50, yPosition);
      }

      // Footer
      doc.fontSize(8).text(`Reporte generado el ${new Date().toLocaleDateString('es-ES')} - Alimetria`, 50, 780, { align: 'center' });

    } catch (error) {
      console.error('Error generando contenido PDF:', error);
      throw error;
    }
  }

  // Generar contenido PDF consolidado
  static generarContenidoPDFConsolidado(doc, pacientes, estadisticas) {
    try {
      // Header
      doc.fontSize(20).text('REPORTE CONSOLIDADO DE PACIENTES', 50, 50, { align: 'center' });
      doc.fontSize(12).text('Alimetria - Sistema de Gestión Nutricional', 50, 75, { align: 'center' });
      
      doc.moveTo(50, 110).lineTo(545, 110).stroke();

      let yPosition = 130;

      // Estadísticas generales
      doc.fontSize(16).text('ESTADÍSTICAS GENERALES', 50, yPosition);
      yPosition += 25;

      doc.fontSize(11);
      doc.text(`Total de pacientes: ${pacientes.length}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Pacientes con mediciones: ${estadisticas.pacientes_con_mediciones || 0}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Total de mediciones: ${estadisticas.total_mediciones || 0}`, 50, yPosition);
      yPosition += 30;

      // Lista de pacientes
      doc.fontSize(16).text('LISTA DE PACIENTES', 50, yPosition);
      yPosition += 25;

      // Headers
      doc.fontSize(10);
      const headers = ['Paciente', 'Sexo', 'Edad', 'Último Peso', 'Último IMC'];
      const columnWidths = [120, 40, 40, 80, 80];
      let xPosition = 50;

      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 15;

      doc.moveTo(50, yPosition).lineTo(410, yPosition).stroke();
      yPosition += 5;

      // Datos de pacientes
      if (pacientes && pacientes.length > 0) {
        pacientes.forEach((paciente) => {
          if (yPosition > 750) {
            doc.addPage();
            yPosition = 50;
          }

          xPosition = 50;
          const nombreCompleto = `${paciente.nombre || ''} ${paciente.apellido || ''}`;
          const sexoTexto = paciente.sexo === 'M' ? 'M' : 'F';
          
          const valores = [
            nombreCompleto.substring(0, 25),
            sexoTexto,
            paciente.edad || 'N/A',
            paciente.ultimo_peso ? parseFloat(paciente.ultimo_peso).toFixed(1) + ' kg' : '-',
            paciente.ultimo_imc ? parseFloat(paciente.ultimo_imc).toFixed(1) : '-'
          ];

          valores.forEach((valor, index) => {
            doc.text(String(valor), xPosition, yPosition);
            xPosition += columnWidths[index];
          });

          yPosition += 12;
        });
      } else {
        doc.fontSize(11).text('No hay pacientes registrados.', 50, yPosition);
      }

      // Footer
      doc.fontSize(8).text(`Reporte generado el ${new Date().toLocaleDateString('es-ES')} - Alimetria`, 50, 780, { align: 'center' });

    } catch (error) {
      console.error('Error generando contenido PDF consolidado:', error);
      throw error;
    }
  }
}

module.exports = ReportesController;
