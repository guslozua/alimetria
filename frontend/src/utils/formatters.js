/**
 * Funciones de formateo para la aplicación Alimetria
 */

// Formatear fechas
export const formatearFecha = (fecha, incluirHora = true) => {
  if (!fecha) return '-';
  
  const fechaObj = new Date(fecha);
  
  if (isNaN(fechaObj.getTime())) return '-';
  
  const opciones = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  if (incluirHora) {
    opciones.hour = '2-digit';
    opciones.minute = '2-digit';
  }
  
  return fechaObj.toLocaleDateString('es-ES', opciones);
};

// Formatear solo fecha sin hora
export const formatearFechaSoloFecha = (fecha) => {
  return formatearFecha(fecha, false);
};

// Formatear solo hora
export const formatearHora = (fecha) => {
  if (!fecha) return '-';
  
  const fechaObj = new Date(fecha);
  
  if (isNaN(fechaObj.getTime())) return '-';
  
  return fechaObj.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formatear números
export const formatearNumero = (numero, decimales = 1) => {
  if (numero === null || numero === undefined || numero === '') return '-';
  
  const num = parseFloat(numero);
  if (isNaN(num)) return '-';
  
  return num.toFixed(decimales);
};

// Formatear peso
export const formatearPeso = (peso) => {
  const pesoFormateado = formatearNumero(peso, 1);
  return pesoFormateado === '-' ? '-' : `${pesoFormateado} kg`;
};

// Formatear altura
export const formatearAltura = (altura) => {
  const alturaFormateada = formatearNumero(altura, 1);
  return alturaFormateada === '-' ? '-' : `${alturaFormateada} cm`;
};

// Formatear IMC
export const formatearIMC = (imc) => {
  return formatearNumero(imc, 2);
};

// Formatear porcentaje
export const formatearPorcentaje = (porcentaje) => {
  const porcentajeFormateado = formatearNumero(porcentaje, 1);
  return porcentajeFormateado === '-' ? '-' : `${porcentajeFormateado}%`;
};

// Formatear perímetro
export const formatearPerimetro = (perimetro) => {
  const perimetroFormateado = formatearNumero(perimetro, 1);
  return perimetroFormateado === '-' ? '-' : `${perimetroFormateado} cm`;
};

// Formatear pliegue
export const formatearPliegue = (pliegue) => {
  const pliegueFormateado = formatearNumero(pliegue, 1);
  return pliegueFormateado === '-' ? '-' : `${pliegueFormateado} mm`;
};

// Formatear edad
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  if (isNaN(nacimiento.getTime())) return null;
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

// Formatear edad
export const formatearEdad = (fechaNacimiento) => {
  const edad = calcularEdad(fechaNacimiento);
  return edad !== null ? `${edad} años` : '-';
};

// Formatear teléfono
export const formatearTelefono = (telefono) => {
  if (!telefono) return '-';
  
  // Remover todo lo que no sean números
  const soloNumeros = telefono.replace(/\D/g, '');
  
  // Si tiene código de país argentino (+54)
  if (soloNumeros.length === 12 && soloNumeros.startsWith('54')) {
    return `+${soloNumeros.slice(0, 2)} ${soloNumeros.slice(2, 5)} ${soloNumeros.slice(5, 8)}-${soloNumeros.slice(8)}`;
  }
  
  // Si es un número local argentino (10 dígitos)
  if (soloNumeros.length === 10) {
    return `(${soloNumeros.slice(0, 3)}) ${soloNumeros.slice(3, 6)}-${soloNumeros.slice(6)}`;
  }
  
  // Si es un número con código de área (9 dígitos)
  if (soloNumeros.length === 9) {
    return `${soloNumeros.slice(0, 3)} ${soloNumeros.slice(3, 6)}-${soloNumeros.slice(6)}`;
  }
  
  // Devolver como está si no coincide con ningún formato
  return telefono;
};

// Formatear dinero (pesos argentinos)
export const formatearDinero = (cantidad) => {
  if (cantidad === null || cantidad === undefined || cantidad === '') return '-';
  
  const num = parseFloat(cantidad);
  if (isNaN(num)) return '-';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

// Capitalizar primera letra
export const capitalizarPrimeraLetra = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Formatear nombre completo
export const formatearNombreCompleto = (nombre, apellido) => {
  const nombreFormateado = nombre ? capitalizarPrimeraLetra(nombre.trim()) : '';
  const apellidoFormateado = apellido ? capitalizarPrimeraLetra(apellido.trim()) : '';
  
  if (!nombreFormateado && !apellidoFormateado) return '-';
  if (!nombreFormateado) return apellidoFormateado;
  if (!apellidoFormateado) return nombreFormateado;
  
  return `${nombreFormateado} ${apellidoFormateado}`;
};

// Obtener iniciales
export const obtenerIniciales = (nombre, apellido) => {
  const nombreInicial = nombre ? nombre.charAt(0).toUpperCase() : '';
  const apellidoInicial = apellido ? apellido.charAt(0).toUpperCase() : '';
  
  return `${nombreInicial}${apellidoInicial}`;
};

// Truncar texto
export const truncarTexto = (texto, longitudMaxima = 50) => {
  if (!texto) return '';
  if (texto.length <= longitudMaxima) return texto;
  
  return texto.substring(0, longitudMaxima) + '...';
};

// Formatear duración en minutos
export const formatearDuracion = (minutos) => {
  if (!minutos || minutos === 0) return '-';
  
  if (minutos < 60) {
    return `${minutos} min`;
  }
  
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  
  if (minutosRestantes === 0) {
    return `${horas}h`;
  }
  
  return `${horas}h ${minutosRestantes}min`;
};

// Validar email
export const esEmailValido = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar teléfono argentino
export const esTelefonoValido = (telefono) => {
  if (!telefono) return false;
  
  const soloNumeros = telefono.replace(/\D/g, '');
  
  // Acepta números de 8, 9, 10 dígitos (locales) o 12 dígitos (con código de país)
  return [8, 9, 10, 12].includes(soloNumeros.length);
};

// Formatear diferencia de fechas
export const formatearTiempoTranscurrido = (fecha) => {
  if (!fecha) return '-';
  
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) return '-';
  
  const ahora = new Date();
  const diferencia = ahora - fechaObj;
  
  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  
  return 'hace un momento';
};

// Formatear estado (para chips y badges)
export const formatearEstado = (estado) => {
  if (!estado) return '';
  
  const estadosMap = {
    'activo': 'Activo',
    'inactivo': 'Inactivo',
    'pendiente': 'Pendiente',
    'completado': 'Completado',
    'cancelado': 'Cancelado',
    'programada': 'Programada',
    'confirmada': 'Confirmada',
    'en_curso': 'En Curso',
    'no_asistio': 'No Asistió',
    'manual': 'Manual',
    'inbody': 'InBody',
    'mixta': 'Mixta'
  };
  
  return estadosMap[estado] || capitalizarPrimeraLetra(estado);
};

// Convertir a slug (para URLs)
export const convertirASlug = (texto) => {
  if (!texto) return '';
  
  return texto
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Formatear sexo/género
export const formatearSexo = (sexo) => {
  switch(sexo) {
    case 'M': return 'Masculino';
    case 'F': return 'Femenino';
    case 'O': return 'Otro/No binario';
    case 'N': return 'Prefiero no especificar';
    default: return 'No especificado';
  }
};

// Obtener color para chip de sexo
export const getSexoColor = (sexo) => {
  switch(sexo) {
    case 'M': return 'primary';
    case 'F': return 'secondary';
    case 'O': return 'info';
    case 'N': return 'default';
    default: return 'default';
  }
};

const formatters = {
  formatearFecha,
  formatearFechaSoloFecha,
  formatearHora,
  formatearNumero,
  formatearPeso,
  formatearAltura,
  formatearIMC,
  formatearPorcentaje,
  formatearPerimetro,
  formatearPliegue,
  calcularEdad,
  formatearEdad,
  formatearTelefono,
  formatearDinero,
  capitalizarPrimeraLetra,
  formatearNombreCompleto,
  obtenerIniciales,
  truncarTexto,
  formatearDuracion,
  esEmailValido,
  esTelefonoValido,
  formatearTiempoTranscurrido,
  formatearEstado,
  convertirASlug,
  formatearSexo,
  getSexoColor
};

export default formatters;
