// Utilidades para manejo de zona horaria Argentina - VERSIÓN CORREGIDA
class TimezoneUtils {
  // Argentina está en GMT-3 (UTC-3)
  static ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';
  static ARGENTINA_OFFSET_HOURS = -3; // Argentina está UTC-3

  /**
   * Procesa fecha del frontend para almacenar en BD
   * El frontend envía fechas locales argentinas, las convertimos a UTC
   * @param {string} fechaString - Fecha del frontend (YYYY-MM-DDTHH:mm:ss)
   * @returns {string} Fecha en formato ISO UTC
   */
  static procesarFechaFrontend(fechaString) {
    if (!fechaString) return null;
    
    console.log('🔄 TimezoneUtils.procesarFechaFrontend input:', fechaString);
    
    // Si la fecha NO tiene información de timezone, asumimos que es hora local Argentina
    if (!fechaString.includes('Z') && !fechaString.includes('+') && !fechaString.includes('-', 10)) {
      // Crear fecha como si fuera UTC (para evitar conversiones automáticas del navegador)
      const partes = fechaString.split('T');
      const [year, month, day] = partes[0].split('-').map(Number);
      const [hours, minutes, seconds = 0] = (partes[1] || '00:00:00').split(':').map(Number);
      
      // Crear fecha en UTC directamente
      const fechaLocal = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
      
      // Verificar si la fecha es válida
      if (isNaN(fechaLocal.getTime())) {
        console.error('❌ Fecha inválida recibida:', fechaString);
        return null;
      }
      
      // CONVERTIR de Argentina (UTC-3) a UTC: RESTAR el offset de Argentina
      // Si en Argentina son las 14:00, en UTC son las 17:00 (14 + 3)
      const fechaUTC = new Date(fechaLocal.getTime() + (Math.abs(this.ARGENTINA_OFFSET_HOURS) * 60 * 60 * 1000));
      
      console.log('🔄 TimezoneUtils.procesarFechaFrontend output (UTC):', fechaUTC.toISOString());
      return fechaUTC.toISOString();
    }
    
    // Si ya tiene timezone, usarla directamente
    const fecha = new Date(fechaString);
    console.log('🔄 TimezoneUtils.procesarFechaFrontend output (directo):', fecha.toISOString());
    return fecha.toISOString();
  }

  /**
   * Convierte una fecha UTC de la BD para mostrar en el frontend
   * @param {string|Date} fechaUTC - Fecha en UTC desde la base de datos
   * @returns {string} Fecha en formato ISO para Argentina
   */
  static paraFrontend(fechaUTC) {
    if (!fechaUTC) return null;
    
    console.log('🔄 TimezoneUtils.paraFrontend input:', fechaUTC);
    
    const fecha = new Date(fechaUTC);
    
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      console.error('❌ Fecha inválida en BD:', fechaUTC);
      return null;
    }
    
    // CONVERTIR de UTC a Argentina (UTC-3): SUMAR el offset de Argentina
    // Si en UTC son las 17:00, en Argentina son las 14:00 (17 - 3)
    const fechaArgentina = new Date(fecha.getTime() + (this.ARGENTINA_OFFSET_HOURS * 60 * 60 * 1000));
    
    console.log('🔄 TimezoneUtils.paraFrontend output:', fechaArgentina.toISOString());
    return fechaArgentina.toISOString();
  }

  /**
   * Formatea una fecha UTC para mostrar en hora Argentina legible
   * @param {string|Date} fechaUTC - Fecha en UTC
   * @returns {string} Fecha formateada en español Argentina
   */
  static formatearFechaArgentina(fechaUTC) {
    if (!fechaUTC) return '';
    
    const fecha = new Date(fechaUTC);
    
    // Usar toLocaleString con timezone argentino
    return fecha.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  }

  /**
   * Crear fecha desde componentes de fecha y hora en zona Argentina
   * @param {number} year 
   * @param {number} month (0-11)
   * @param {number} day 
   * @param {number} hour 
   * @param {number} minute 
   * @returns {string} Fecha en formato ISO UTC
   */
  static crearFechaArgentina(year, month, day, hour = 0, minute = 0) {
    // Crear fecha local Argentina en UTC
    const fechaLocal = new Date(Date.UTC(year, month, day, hour, minute));
    
    // Convertir a UTC sumando el offset
    const fechaUTC = new Date(fechaLocal.getTime() + (Math.abs(this.ARGENTINA_OFFSET_HOURS) * 60 * 60 * 1000));
    
    return fechaUTC.toISOString();
  }

  /**
   * Crea una fecha actual en hora Argentina convertida a UTC
   * @returns {string} Fecha UTC actual equivalente a ahora en Argentina
   */
  static ahoraUTC() {
    const ahora = new Date();
    return ahora.toISOString();
  }

  /**
   * Verifica si una fecha está en el pasado comparando en timezone argentino
   * @param {string|Date} fechaUTC - Fecha UTC a verificar
   * @returns {boolean} True si está en el pasado
   */
  static esPasado(fechaUTC) {
    const fechaComparar = new Date(fechaUTC);
    const ahora = new Date();
    
    return fechaComparar < ahora;
  }
}

module.exports = TimezoneUtils;