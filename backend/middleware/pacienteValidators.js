const { body } = require('express-validator');

// Validaciones para crear paciente
const validateCreatePaciente = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('sexo')
    .isIn(['M', 'F', 'O', 'N'])
    .withMessage('El sexo debe ser una opción válida (M, F, O, N)'),

  body('fecha_nacimiento')
    .isDate()
    .withMessage('Debe ser una fecha válida')
    .custom((value) => {
      const fechaNacimiento = new Date(value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      
      if (edad < 0 || edad > 120) {
        throw new Error('La edad debe estar entre 0 y 120 años');
      }
      
      if (fechaNacimiento > hoy) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      
      return true;
    }),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido')
    .isLength({ max: 50 })
    .withMessage('El teléfono no puede exceder 50 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder 100 caracteres'),

  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La dirección no puede exceder 255 caracteres'),

  body('ocupacion')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ocupación no puede exceder 100 caracteres'),

  body('altura_inicial')
    .optional()
    .isFloat({ min: 50, max: 250 })
    .withMessage('La altura debe estar entre 50 y 250 cm'),

  body('peso_inicial')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('El peso debe estar entre 1 y 500 kg'),

  body('objetivo')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El objetivo no puede exceder 1000 caracteres'),

  body('observaciones_generales')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Las observaciones no pueden exceder 2000 caracteres'),

  body('consultorio_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Debe seleccionar un consultorio válido')
];

// Validaciones para actualizar paciente (campos opcionales)
const validateUpdatePaciente = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('sexo')
    .optional()
    .isIn(['M', 'F', 'O', 'N'])
    .withMessage('El sexo debe ser una opción válida (M, F, O, N)'),

  body('fecha_nacimiento')
    .optional()
    .isDate()
    .withMessage('Debe ser una fecha válida')
    .custom((value) => {
      const fechaNacimiento = new Date(value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      
      if (edad < 0 || edad > 120) {
        throw new Error('La edad debe estar entre 0 y 120 años');
      }
      
      if (fechaNacimiento > hoy) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      
      return true;
    }),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido')
    .isLength({ max: 50 })
    .withMessage('El teléfono no puede exceder 50 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder 100 caracteres'),

  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La dirección no puede exceder 255 caracteres'),

  body('ocupacion')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ocupación no puede exceder 100 caracteres'),

  body('altura_inicial')
    .optional()
    .isFloat({ min: 50, max: 250 })
    .withMessage('La altura debe estar entre 50 y 250 cm'),

  body('peso_inicial')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('El peso debe estar entre 1 y 500 kg'),

  body('objetivo')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El objetivo no puede exceder 1000 caracteres'),

  body('observaciones_generales')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Las observaciones no pueden exceder 2000 caracteres')
];

module.exports = {
  validateCreatePaciente,
  validateUpdatePaciente
};
