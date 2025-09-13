const Tesseract = require('tesseract.js');
const path = require('path');
const moment = require('moment');

class InBodyOCR {
  constructor() {
    this.worker = null;
  }

  /**
   * Inicializa el worker de Tesseract
   */
  async initWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('spa+eng', 1, {
        logger: m => console.log('OCR:', m)
      });
      
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789.,+-:/ ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚáéíóúÑñ',
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      });
    }
    return this.worker;
  }

  /**
   * Procesa una imagen de InBody H30 y extrae los datos
   */
  async processInBodyImage(imagePath) {
    try {
      console.log(`🔍 Iniciando OCR para: ${imagePath}`);
      
      const worker = await this.initWorker();
      const { data: { text } } = await worker.recognize(imagePath);
      
      console.log('📝 Texto extraído por OCR:', text);
      
      // Parsear el texto extraído
      const parsedData = this.parseInBodyText(text);
      
      console.log('📊 Datos parseados:', parsedData);
      
      return {
        success: true,
        data: parsedData,
        rawText: text
      };
      
    } catch (error) {
      console.error('❌ Error en OCR:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Parsea el texto extraído de InBody H30
   */
  parseInBodyText(text) {
    const result = {
      // Información básica
      fecha_medicion: null,
      hora_medicion: null,
      nombre_paciente: null,
      
      // Mediciones principales
      peso: null,
      masa_muscular: null,
      grasa_corporal_kg: null,
      imc: null,
      grasa_corporal_porcentaje: null,
      
      // Datos adicionales
      puntuacion_corporal: null,
      percentil: null,
      
      // Cambios respecto a medición anterior
      cambio_peso: null,
      cambio_masa_muscular: null,
      cambio_grasa_corporal: null,
      cambio_imc: null,
      cambio_grasa_porcentaje: null,
      
      // Metadatos
      tipo_medicion: 'inbody',
      confianza_ocr: 0
    };

    let confianzaTotal = 0;
    let camposDetectados = 0;

    // Normalizar texto para parsing
    const normalizedText = text
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      // 1. Extraer FECHA (formato: dd.mm.yyyy)
      const fechaMatch = normalizedText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (fechaMatch) {
        const [, day, month, year] = fechaMatch;
        result.fecha_medicion = `${year}-${month}-${day}`;
        confianzaTotal += 10;
        camposDetectados++;
      }

      // 2. Extraer HORA (formato: hh:mm)
      const horaMatch = normalizedText.match(/(\d{1,2}):(\d{2})/);
      if (horaMatch) {
        result.hora_medicion = horaMatch[0];
        confianzaTotal += 5;
        camposDetectados++;
      }

      // 3. Extraer NOMBRE (buscar después de InBody y antes de números)
      const nombrePatterns = [
        /InBody\s+.*?(\w+)\s+\d/i,
        /\d{2}:\d{2}\s+(\w+)/,
        /(\w{6,})\s*Peso/i
      ];
      
      for (const pattern of nombrePatterns) {
        const nombreMatch = normalizedText.match(pattern);
        if (nombreMatch && nombreMatch[1]) {
          result.nombre_paciente = nombreMatch[1].trim();
          confianzaTotal += 8;
          camposDetectados++;
          break;
        }
      }

      // 4. Extraer PESO (buscar "Peso" seguido de número)
      const pesoPatterns = [
        /Peso\s*(\d+(?:[.,]\d+)?)\s*kg/i,
        /(\d+(?:[.,]\d+)?)\s*kg.*?Bajo.*?Normal.*?Alto/i
      ];
      
      for (const pattern of pesoPatterns) {
        const pesoMatch = normalizedText.match(pattern);
        if (pesoMatch) {
          result.peso = parseFloat(pesoMatch[1].replace(',', '.'));
          confianzaTotal += 15;
          camposDetectados++;
          break;
        }
      }

      // 5. Extraer MASA MUSCULAR
      const musculoPatterns = [
        /Masa\s*muscular\s*(\d+(?:[.,]\d+)?)\s*kg/i,
        /muscular\s*(\d+(?:[.,]\d+)?)\s*kg/i
      ];
      
      for (const pattern of musculoPatterns) {
        const musculoMatch = normalizedText.match(pattern);
        if (musculoMatch) {
          result.masa_muscular = parseFloat(musculoMatch[1].replace(',', '.'));
          confianzaTotal += 12;
          camposDetectados++;
          break;
        }
      }

      // 6. Extraer GRASA CORPORAL (kg)
      const grasaKgPatterns = [
        /Grasa\s*corporal\s*(\d+(?:[.,]\d+)?)\s*kg/i,
        /corporal\s*(\d+(?:[.,]\d+)?)\s*kg/i
      ];
      
      for (const pattern of grasaKgPatterns) {
        const grasaMatch = normalizedText.match(pattern);
        if (grasaMatch) {
          result.grasa_corporal_kg = parseFloat(grasaMatch[1].replace(',', '.'));
          confianzaTotal += 12;
          camposDetectados++;
          break;
        }
      }

      // 7. Extraer IMC
      const imcPatterns = [
        /IMC\s*(\d+(?:[.,]\d+)?)\s*kg\/m/i,
        /(\d+(?:[.,]\d+)?)\s*kg\/m²/i
      ];
      
      for (const pattern of imcPatterns) {
        const imcMatch = normalizedText.match(pattern);
        if (imcMatch) {
          result.imc = parseFloat(imcMatch[1].replace(',', '.'));
          confianzaTotal += 10;
          camposDetectados++;
          break;
        }
      }

      // 8. Extraer PORCENTAJE DE GRASA CORPORAL
      const grasaPorcentajePatterns = [
        /Porcentaje\s*de\s*grasa\s*corporal\s*(\d+(?:[.,]\d+)?)\s*%/i,
        /grasa\s*corporal\s*(\d+(?:[.,]\d+)?)\s*%/i,
        /(\d+(?:[.,]\d+)?)\s*%.*?Bajo.*?Normal.*?Alto/i
      ];
      
      for (const pattern of grasaPorcentajePatterns) {
        const grasaPctMatch = normalizedText.match(pattern);
        if (grasaPctMatch) {
          result.grasa_corporal_porcentaje = parseFloat(grasaPctMatch[1].replace(',', '.'));
          confianzaTotal += 12;
          camposDetectados++;
          break;
        }
      }

      // 9. Extraer PUNTUACIÓN CORPORAL
      const puntuacionPatterns = [
        /(\d+)\s*Puntos/i,
        /Puntos\s*(\d+)/i
      ];
      
      for (const pattern of puntuacionPatterns) {
        const puntuacionMatch = normalizedText.match(pattern);
        if (puntuacionMatch) {
          result.puntuacion_corporal = parseInt(puntuacionMatch[1]);
          confianzaTotal += 8;
          camposDetectados++;
          break;
        }
      }

      // 10. Extraer PERCENTIL
      const percentilPatterns = [
        /superior\s*(\d+(?:[.,]\d+)?)\s*%/i,
        /(\d+(?:[.,]\d+)?)\s*%.*?superior/i
      ];
      
      for (const pattern of percentilPatterns) {
        const percentilMatch = normalizedText.match(pattern);
        if (percentilMatch) {
          result.percentil = parseFloat(percentilMatch[1].replace(',', '.'));
          confianzaTotal += 5;
          camposDetectados++;
          break;
        }
      }

      // 11. Extraer CAMBIOS (valores con +/-)
      const cambios = normalizedText.match(/([\+\-]\d+(?:[.,]\d+)?)/g);
      if (cambios && cambios.length > 0) {
        // Mapear cambios a los campos correspondientes
        if (cambios[0]) result.cambio_peso = parseFloat(cambios[0].replace(',', '.'));
        if (cambios[1]) result.cambio_masa_muscular = parseFloat(cambios[1].replace(',', '.'));
        if (cambios[2]) result.cambio_grasa_corporal = parseFloat(cambios[2].replace(',', '.'));
        if (cambios[3]) result.cambio_imc = parseFloat(cambios[3].replace(',', '.'));
        if (cambios[4]) result.cambio_grasa_porcentaje = parseFloat(cambios[4].replace(',', '.'));
        
        confianzaTotal += cambios.length * 3;
        camposDetectados += cambios.length;
      }

      // Calcular confianza final
      result.confianza_ocr = camposDetectados > 0 ? Math.min(100, (confianzaTotal / camposDetectados) * 10) : 0;

      // Si tenemos fecha y hora, combinarlas
      if (result.fecha_medicion && result.hora_medicion) {
        result.fecha_hora_completa = `${result.fecha_medicion} ${result.hora_medicion}:00`;
      }

      // Validaciones básicas
      if (result.peso && result.peso > 300) result.peso = null; // Peso irrealista
      if (result.imc && result.imc > 100) result.imc = null; // IMC irrealista
      if (result.grasa_corporal_porcentaje && result.grasa_corporal_porcentaje > 80) result.grasa_corporal_porcentaje = null;

    } catch (parseError) {
      console.error('❌ Error al parsear texto OCR:', parseError);
      result.confianza_ocr = 0;
    }

    return result;
  }

  /**
   * Convierte los datos parseados al formato de la base de datos
   */
  mapToMedicionDB(ocrData, pacienteId) {
    const medicionData = {
      paciente_id: pacienteId,
      tipo: 'inbody',
      fecha_medicion: ocrData.fecha_hora_completa || new Date().toISOString(),
      
      // Campos principales
      peso: ocrData.peso,
      imc: ocrData.imc,
      grasa_corporal: ocrData.grasa_corporal_porcentaje,
      grasa_corporal_kg: ocrData.grasa_corporal_kg,
      musculo: ocrData.masa_muscular,
      puntuacion_corporal: ocrData.puntuacion_corporal,
      
      // Campos adicionales como JSON
      otros_valores: JSON.stringify({
        cambio_peso: ocrData.cambio_peso,
        cambio_masa_muscular: ocrData.cambio_masa_muscular,
        cambio_grasa_corporal: ocrData.cambio_grasa_corporal,
        cambio_imc: ocrData.cambio_imc,
        cambio_grasa_porcentaje: ocrData.cambio_grasa_porcentaje,
        percentil: ocrData.percentil,
        confianza_ocr: ocrData.confianza_ocr
      }),
      
      observaciones: `Medición automática InBody H30 (Confianza OCR: ${Math.round(ocrData.confianza_ocr)}%)`
    };

    // Calcular altura si tenemos peso e IMC
    if (ocrData.peso && ocrData.imc) {
      // IMC = peso(kg) / altura(m)²
      // altura(m) = sqrt(peso/IMC)
      const alturaMetros = Math.sqrt(ocrData.peso / ocrData.imc);
      medicionData.altura = Math.round(alturaMetros * 100); // Convertir a cm
    }

    return medicionData;
  }

  /**
   * Cierra el worker de Tesseract
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

// Instancia singleton
const inBodyOCR = new InBodyOCR();

module.exports = inBodyOCR;