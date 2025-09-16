// Servicio OCR para InBody H30
// Ubicación: backend/utils/inbodyOcr.js

const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');

class InBodyOCR {
  constructor() {
    this.worker = null;
  }

  async initialize() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker({
        logger: m => console.log('OCR:', m.status, m.progress)
      });
      
      // Configurar para español y números
      await this.worker.loadLanguage('spa+eng');
      await this.worker.initialize('spa+eng');
      
      // Configuraciones específicas para InBody
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789.,+-=% ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚáéíóúñÑ:/',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        preserve_interword_spaces: '1'
      });
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  // Preprocesar imagen para mejorar OCR
  async preprocessImage(imagePath) {
    try {
      const outputPath = imagePath.replace(/\.[^/.]+$/, '_processed.png');
      
      await sharp(imagePath)
        .resize(null, 1200, { withoutEnlargement: true }) // Escalar para mejor resolución
        .greyscale() // Convertir a escala de grises
        .normalize() // Normalizar contraste
        .sharpen() // Mejorar nitidez
        .png({ quality: 100 })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Error preprocesando imagen:', error);
      return imagePath; // Devolver imagen original si hay error
    }
  }

  // Extraer datos específicos de InBody H30
  async extractInBodyData(imagePath) {
    try {
      await this.initialize();
      
      // Preprocesar imagen
      const processedPath = await this.preprocessImage(imagePath);
      
      // Ejecutar OCR
      const { data: { text } } = await this.worker.recognize(processedPath);
      console.log('📝 Texto OCR extraído:', text);
      
      // Parsear datos específicos de InBody
      const parsedData = this.parseInBodyText(text);
      
      // Limpiar archivo procesado temporal
      if (processedPath !== imagePath) {
        try {
          const fs = require('fs');
          fs.unlinkSync(processedPath);
        } catch (cleanupError) {
          console.warn('Warning: No se pudo limpiar archivo temporal:', cleanupError.message);
        }
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error en extractInBodyData:', error);
      throw error;
    }
  }

  // Parsear texto OCR específico para InBody H30
  parseInBodyText(text) {
    const data = {
      peso: null,
      masa_muscular: null,
      grasa_corporal: null,
      grasa_corporal_kg: null,
      imc: null,
      porcentaje_grasa: null,
      agua_corporal: null,
      metabolismo_basal: null,
      puntuacion_corporal: null,
      fecha_medicion: null,
      usuario_nombre: null,
      masa_osea: null,
      grasa_visceral: null,
      edad_metabolica: null,
      raw_text: text
    };

    try {
      // Buscar peso (formato: "105.0 kg" o "Peso 105.0")
      const pesoMatch = text.match(/(?:Peso[^\d]*)?(\d+\.?\d*)\s*kg/i);
      if (pesoMatch) {
        data.peso = parseFloat(pesoMatch[1]);
      }

      // Buscar masa muscular (formato: "39.4 kg" después de "Masa muscular")
      const masaMatch = text.match(/Masa\s+muscular[^\d]*(\d+\.?\d*)\s*kg/i);
      if (masaMatch) {
        data.masa_muscular = parseFloat(masaMatch[1]);
      }

      // Buscar grasa corporal en kg (formato: "35.5 kg" después de "Grasa corporal")
      const grasaKgMatch = text.match(/Grasa\s+corporal[^\d]*(\d+\.?\d*)\s*kg/i);
      if (grasaKgMatch) {
        data.grasa_corporal_kg = parseFloat(grasaKgMatch[1]);
        data.grasa_corporal = data.grasa_corporal_kg; // Compatibilidad
      }

      // Buscar IMC (formato: "32.4 kg/m²")
      const imcMatch = text.match(/IMC[^\d]*(\d+\.?\d*)\s*kg\/m/i);
      if (imcMatch) {
        data.imc = parseFloat(imcMatch[1]);
      }

      // Buscar porcentaje de grasa (formato: "33.8%")
      const porcentajeMatch = text.match(/(?:Porcentaje\s+de\s+grasa\s+corporal|grasa\s+corporal)[^\d]*(\d+\.?\d*)\s*%/i);
      if (porcentajeMatch) {
        data.porcentaje_grasa = parseFloat(porcentajeMatch[1]);
      }

      // Buscar puntuación (formato: "66 Puntos")
      const puntuacionMatch = text.match(/(\d+)\s*Puntos/i);
      if (puntuacionMatch) {
        data.puntuacion_corporal = parseInt(puntuacionMatch[1]);
      }

      // Buscar fecha (formato: "08.09.2025 16:41")
      const fechaMatch = text.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
      if (fechaMatch) {
        const [, dia, mes, año, hora, minuto] = fechaMatch;
        data.fecha_medicion = `${año}-${mes}-${dia} ${hora}:${minuto}:00`;
      }

      // Buscar nombre de usuario
      const nombreMatch = text.match(/(?:Usuario|Nombre)[:\s]*([A-Za-z]+)/i);
      if (nombreMatch) {
        data.usuario_nombre = nombreMatch[1];
      }

      // Buscar agua corporal (si está presente)
      const aguaMatch = text.match(/agua\s+corporal[^\d]*(\d+\.?\d*)/i);
      if (aguaMatch) {
        data.agua_corporal = parseFloat(aguaMatch[1]);
      }

      // Buscar metabolismo basal
      const metabolismoMatch = text.match(/metabolismo\s+basal[^\d]*(\d+)/i);
      if (metabolismoMatch) {
        data.metabolismo_basal = parseInt(metabolismoMatch[1]);
      }

      // Buscar grasa visceral
      const visceralMatch = text.match(/grasa\s+visceral[^\d]*(\d+\.?\d*)/i);
      if (visceralMatch) {
        data.grasa_visceral = parseFloat(visceralMatch[1]);
      }

      console.log('📊 Datos extraídos de InBody:', data);
      return data;

    } catch (error) {
      console.error('Error parseando texto OCR:', error);
      return { ...data, error: error.message };
    }
  }

  // Método auxiliar para validar datos extraídos
  validateExtractedData(data) {
    const warnings = [];
    const errors = [];

    // Validaciones básicas
    if (!data.peso || data.peso < 30 || data.peso > 300) {
      warnings.push('Peso fuera del rango normal (30-300 kg)');
    }

    if (!data.imc || data.imc < 10 || data.imc > 60) {
      warnings.push('IMC fuera del rango normal (10-60)');
    }

    if (data.porcentaje_grasa && (data.porcentaje_grasa < 5 || data.porcentaje_grasa > 50)) {
      warnings.push('Porcentaje de grasa fuera del rango normal (5-50%)');
    }

    if (data.masa_muscular && data.peso && data.masa_muscular > data.peso) {
      errors.push('Masa muscular no puede ser mayor al peso total');
    }

    return { warnings, errors, isValid: errors.length === 0 };
  }

  // Procesar archivo InBody completo (incluyendo guardado)
  async processInBodyFile(filePath, pacienteId, usuarioId) {
    try {
      console.log('🔍 Procesando archivo InBody:', filePath);
      
      // Extraer datos
      const extractedData = await this.extractInBodyData(filePath);
      
      // Validar datos
      const validation = this.validateExtractedData(extractedData);
      
      // Preparar datos para base de datos
      const medicionData = {
        paciente_id: pacienteId,
        tipo: 'inbody',
        peso: extractedData.peso,
        imc: extractedData.imc,
        grasa_corporal: extractedData.porcentaje_grasa,
        grasa_corporal_kg: extractedData.grasa_corporal_kg,
        musculo: extractedData.masa_muscular,
        agua_corporal: extractedData.agua_corporal,
        masa_osea: extractedData.masa_osea,
        grasa_visceral: extractedData.grasa_visceral,
        metabolismo_basal: extractedData.metabolismo_basal,
        puntuacion_corporal: extractedData.puntuacion_corporal,
        archivo_original: path.basename(filePath),
        datos_ocr: JSON.stringify(extractedData),
        observaciones: validation.warnings.length > 0 ? 
          `Advertencias OCR: ${validation.warnings.join(', ')}` : 
          'Datos extraídos automáticamente por OCR',
        usuario_id: usuarioId,
        fecha_medicion: extractedData.fecha_medicion || new Date()
      };

      return {
        success: validation.isValid,
        data: medicionData,
        extracted: extractedData,
        validation: validation
      };

    } catch (error) {
      console.error('Error procesando archivo InBody:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

// Singleton para reutilizar worker
let ocrInstance = null;

const getOCRInstance = () => {
  if (!ocrInstance) {
    ocrInstance = new InBodyOCR();
  }
  return ocrInstance;
};

// Función de limpieza para cerrar worker al terminar aplicación
process.on('SIGINT', async () => {
  if (ocrInstance) {
    await ocrInstance.terminate();
  }
  process.exit(0);
});

module.exports = {
  InBodyOCR,
  getOCRInstance,
  processInBodyFile: async (filePath, pacienteId, usuarioId) => {
    const ocr = getOCRInstance();
    return await ocr.processInBodyFile(filePath, pacienteId, usuarioId);
  }
};
