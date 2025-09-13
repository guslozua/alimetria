const Medicion = require('../models/Medicion');
const Paciente = require('../models/Paciente');
const inBodyOCR = require('../utils/ocrInBody');
const path = require('path');
const fs = require('fs');

class MedicionController {
  // Obtener mediciones de un paciente
  static async getMedicionesPorPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const { limit } = req.query;

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(pacienteId);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      const mediciones = await Medicion.getByPacienteId(pacienteId, limit ? parseInt(limit) : null);
      
      res.json({
        success: true,
        data: mediciones,
        total: mediciones.length
      });
    } catch (error) {
      console.error('Error al obtener mediciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener una medición específica
  static async getMedicion(req, res) {
    try {
      const { id } = req.params;
      
      const medicion = await Medicion.getById(id);
      if (!medicion) {
        return res.status(404).json({
          success: false,
          message: 'Medición no encontrada'
        });
      }

      res.json({
        success: true,
        data: medicion
      });
    } catch (error) {
      console.error('Error al obtener medición:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nueva medición
  static async crearMedicion(req, res) {
    try {
      const medicionData = req.body;
      
      // DEBUG: Mostrar datos recibidos
      console.log('🔍 Datos recibidos en controlador:', JSON.stringify(medicionData, null, 2));
      
      // CORREGIR: Limpiar datos antes de enviar al modelo
      const limpiarDatos = (data) => {
        const cleaned = {};
        Object.keys(data).forEach(key => {
          if (data[key] === '' || data[key] === undefined) {
            cleaned[key] = null;
          } else {
            cleaned[key] = data[key];
          }
        });
        return cleaned;
      };
      
      const datosLimpios = limpiarDatos(medicionData);
      console.log('✨ Datos después de limpieza:', JSON.stringify(datosLimpios, null, 2));
      
      // Validar datos requeridos
      if (!datosLimpios.paciente_id) {
        return res.status(400).json({
          success: false,
          message: 'El ID del paciente es requerido'
        });
      }

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(datosLimpios.paciente_id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Calcular IMC si hay peso y altura
      if (datosLimpios.peso && datosLimpios.altura) {
        datosLimpios.imc = Medicion.calcularIMC(datosLimpios.peso, datosLimpios.altura);
      }

      // Establecer fecha actual si no se proporciona
      if (!datosLimpios.fecha_medicion) {
        datosLimpios.fecha_medicion = new Date();
      }

      // Agregar usuario que crea la medición
      datosLimpios.usuario_id = req.user.id;

      const nuevaMedicion = await Medicion.create(datosLimpios);

      res.status(201).json({
        success: true,
        message: 'Medición creada exitosamente',
        data: nuevaMedicion
      });
    } catch (error) {
      console.error('Error al crear medición:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // ===== NUEVOS MÉTODOS OCR =====

  /**
   * Procesar imagen InBody H30 con OCR
   */
  static async procesarImagenInBody(req, res) {
    try {
      // Validar archivo subido
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se subió ninguna imagen'
        });
      }

      const { pacienteId } = req.body;

      // Validar paciente
      if (!pacienteId) {
        return res.status(400).json({
          success: false,
          message: 'El ID del paciente es requerido'
        });
      }

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(pacienteId);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      console.log(`🔍 Procesando imagen InBody para paciente ${paciente.nombre} ${paciente.apellido}`);
      console.log(`📁 Archivo: ${req.file.filename} (${req.file.size} bytes)`);

      // Procesar imagen con OCR
      const ocrResult = await inBodyOCR.processInBodyImage(req.file.path);

      if (!ocrResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al procesar la imagen con OCR',
          error: ocrResult.error
        });
      }

      // Convertir datos OCR al formato de la base de datos
      const medicionData = inBodyOCR.mapToMedicionDB(ocrResult.data, pacienteId);
      medicionData.usuario_id = req.user.id;
      medicionData.archivo_original = req.file.filename;
      medicionData.datos_ocr = JSON.stringify(ocrResult.data);

      console.log('📊 Datos para DB:', medicionData);

      res.json({
        success: true,
        message: 'Imagen procesada exitosamente',
        data: {
          ocrData: ocrResult.data,
          medicionData,
          archivo: req.file.filename,
          confianza: Math.round(ocrResult.data.confianza_ocr),
          rawText: ocrResult.rawText
        }
      });

    } catch (error) {
      console.error('❌ Error al procesar imagen InBody:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear medición desde datos OCR (después de revisión/corrección manual)
   */
  static async crearMedicionDesdeOCR(req, res) {
    try {
      const { medicionData, mantenerArchivo = true } = req.body;

      // Validar datos
      if (!medicionData || !medicionData.paciente_id) {
        return res.status(400).json({
          success: false,
          message: 'Datos de medición incompletos'
        });
      }

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(medicionData.paciente_id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Agregar metadatos
      medicionData.usuario_id = req.user.id;
      medicionData.tipo = 'inbody';

      // Calcular IMC si no está presente pero tenemos peso y altura
      if (!medicionData.imc && medicionData.peso && medicionData.altura) {
        medicionData.imc = Medicion.calcularIMC(medicionData.peso, medicionData.altura);
      }

      // Crear medición
      const nuevaMedicion = await Medicion.create(medicionData);

      console.log(`✅ Medición InBody creada exitosamente para ${paciente.nombre} ${paciente.apellido}`);

      res.status(201).json({
        success: true,
        message: 'Medición InBody creada exitosamente',
        data: nuevaMedicion
      });

    } catch (error) {
      console.error('❌ Error al crear medición desde OCR:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Reprocesar imagen con OCR (si el primer intento falló)
   */
  static async reprocesarImagenOCR(req, res) {
    try {
      const { filename, pacienteId } = req.body;

      if (!filename || !pacienteId) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de archivo y ID de paciente son requeridos'
        });
      }

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(pacienteId);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Construir ruta del archivo
      const filePath = path.join(__dirname, '../uploads', filename);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      console.log(`🔄 Reprocesando imagen: ${filename}`);

      // Procesar imagen con OCR
      const ocrResult = await inBodyOCR.processInBodyImage(filePath);

      if (!ocrResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al reprocesar la imagen con OCR',
          error: ocrResult.error
        });
      }

      // Convertir datos OCR al formato de la base de datos
      const medicionData = inBodyOCR.mapToMedicionDB(ocrResult.data, pacienteId);
      medicionData.usuario_id = req.user.id;
      medicionData.archivo_original = filename;
      medicionData.datos_ocr = JSON.stringify(ocrResult.data);

      res.json({
        success: true,
        message: 'Imagen reprocesada exitosamente',
        data: {
          ocrData: ocrResult.data,
          medicionData,
          archivo: filename,
          confianza: Math.round(ocrResult.data.confianza_ocr),
          rawText: ocrResult.rawText
        }
      });

    } catch (error) {
      console.error('❌ Error al reprocesar imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener texto OCR sin procesar de una imagen
   */
  static async obtenerTextoOCR(req, res) {
    try {
      const { filename } = req.params;
      
      // Construir ruta del archivo
      const filePath = path.join(__dirname, '../uploads', filename);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      console.log(`📄 Extrayendo texto OCR de: ${filename}`);

      // Solo extraer texto sin parsing
      const worker = await inBodyOCR.initWorker();
      const { data: { text } } = await worker.recognize(filePath);

      res.json({
        success: true,
        data: {
          filename,
          rawText: text,
          lines: text.split('\n').filter(line => line.trim().length > 0)
        }
      });

    } catch (error) {
      console.error('❌ Error al extraer texto OCR:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // ===== MÉTODOS EXISTENTES =====

  // Actualizar medición
  static async actualizarMedicion(req, res) {
    try {
      const { id } = req.params;
      const medicionData = req.body;

      console.log(`🔧 Actualizando medición ID: ${id}`);
      console.log('📝 Datos recibidos:', JSON.stringify(medicionData, null, 2));

      // Verificar que la medición existe
      const medicionExistente = await Medicion.getById(id);
      if (!medicionExistente) {
        return res.status(404).json({
          success: false,
          message: 'Medición no encontrada'
        });
      }

      // Limpiar datos como en crear medición
      const limpiarDatos = (data) => {
        const cleaned = {};
        Object.keys(data).forEach(key => {
          if (data[key] === '' || data[key] === undefined) {
            cleaned[key] = null;
          } else {
            cleaned[key] = data[key];
          }
        });
        return cleaned;
      };
      
      const datosLimpios = limpiarDatos(medicionData);
      console.log('✨ Datos después de limpieza:', JSON.stringify(datosLimpios, null, 2));

      // Recalcular IMC si se actualizó peso o altura
      if (datosLimpios.peso || datosLimpios.altura) {
        const peso = datosLimpios.peso || medicionExistente.peso;
        const altura = datosLimpios.altura || medicionExistente.altura;
        
        if (peso && altura) {
          datosLimpios.imc = Medicion.calcularIMC(peso, altura);
          console.log(`📊 IMC recalculado: ${datosLimpios.imc}`);
        }
      }

      const resultado = await Medicion.update(id, datosLimpios);

      if (resultado) {
        console.log(`✅ Medición ${id} actualizada exitosamente`);
        
        // Obtener la medición actualizada para devolverla
        const medicionActualizada = await Medicion.getById(id);
        
        res.json({
          success: true,
          message: 'Medición actualizada exitosamente',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar la medición'
        });
      }
    } catch (error) {
      console.error('Error al actualizar medición:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar medición
  static async eliminarMedicion(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la medición existe
      const medicionExistente = await Medicion.getById(id);
      if (!medicionExistente) {
        return res.status(404).json({
          success: false,
          message: 'Medición no encontrada'
        });
      }

      // Eliminar archivo asociado si existe
      if (medicionExistente.archivo_original) {
        const filePath = path.join(__dirname, '../uploads', medicionExistente.archivo_original);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Archivo eliminado: ${medicionExistente.archivo_original}`);
        }
      }

      await Medicion.delete(id);

      res.json({
        success: true,
        message: 'Medición eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar medición:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de evolución
  static async getEstadisticas(req, res) {
    try {
      const { pacienteId } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(pacienteId);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      const estadisticas = await Medicion.getEstadisticasEvolucion(
        pacienteId, 
        fechaInicio, 
        fechaFin
      );

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

  // Obtener historial de versiones
  static async getHistorialVersiones(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la medición existe
      const medicion = await Medicion.getById(id);
      if (!medicion) {
        return res.status(404).json({
          success: false,
          message: 'Medición no encontrada'
        });
      }

      const historial = await Medicion.getHistorialVersiones(id);

      res.json({
        success: true,
        data: historial
      });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener datos para gráficos de evolución
  static async getDatosEvolucion(req, res) {
    try {
      const { pacienteId } = req.params;
      const { campo = 'peso', limite = 10 } = req.query;

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(pacienteId);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Campos válidos para gráficos
      const camposValidos = [
        'peso', 'imc', 'grasa_corporal', 'musculo', 'agua_corporal',
        'perimetro_cintura', 'perimetro_cadera', 'perimetro_brazo_derecho',
        'perimetro_brazo_izquierdo', 'perimetro_muslo_derecho', 
        'perimetro_muslo_izquierdo', 'perimetro_cuello'
      ];

      if (!camposValidos.includes(campo)) {
        return res.status(400).json({
          success: false,
          message: 'Campo no válido para evolución'
        });
      }

      const mediciones = await Medicion.getByPacienteId(pacienteId, parseInt(limite));
      
      // Filtrar y formatear datos para el gráfico
      const datosEvolucion = mediciones
        .filter(m => m[campo] !== null && m[campo] !== undefined)
        .reverse() // Orden cronológico
        .map(m => ({
          fecha: m.fecha_medicion,
          valor: parseFloat(m[campo]),
          fecha_formateada: new Date(m.fecha_medicion).toLocaleDateString('es-ES')
        }));

      res.json({
        success: true,
        data: {
          campo,
          valores: datosEvolucion,
          total: datosEvolucion.length
        }
      });
    } catch (error) {
      console.error('Error al obtener datos de evolución:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = MedicionController;