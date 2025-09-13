import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import CustomButton from '../Common/CustomButton';
import PacienteService from '../../services/pacienteService';
import ObraSocialService from '../../services/obraSocialService';

const FormularioPaciente = ({ open, onClose, onSuccess, paciente = null }) => {
  const isEditing = !!paciente;
  
  const [formData, setFormData] = useState({
    nombre: paciente?.nombre || '',
    apellido: paciente?.apellido || '',
    sexo: paciente?.sexo || '',
    fecha_nacimiento: paciente?.fecha_nacimiento ? 
      new Date(paciente.fecha_nacimiento).toISOString().split('T')[0] : '',
    telefono: paciente?.telefono || '',
    email: paciente?.email || '',
    direccion: paciente?.direccion || '',
    ocupacion: paciente?.ocupacion || '',
    altura_inicial: paciente?.altura_inicial || '',
    peso_inicial: paciente?.peso_inicial || '',
    objetivo: paciente?.objetivo || '',
    observaciones_generales: paciente?.observaciones_generales || '',
    obra_social_id: paciente?.obra_social_id || '',
    numero_afiliado: paciente?.numero_afiliado || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [obrasSociales, setObrasSociales] = useState([]);
  const [loadingObrasSociales, setLoadingObrasSociales] = useState(true);

  // Cargar obras sociales al montar el componente
  useEffect(() => {
    const cargarObrasSociales = async () => {
      try {
        setLoadingObrasSociales(true);
        const response = await ObraSocialService.getSimple();
        setObrasSociales(response.data?.obrasSociales || response.obrasSociales || []);
      } catch (error) {
        console.error('Error cargando obras sociales:', error);
        setObrasSociales([]);
      } finally {
        setLoadingObrasSociales(false);
      }
    };

    if (open) {
      cargarObrasSociales();
    }
  }, [open]);

  // Actualizar formData cuando cambie el paciente
  useEffect(() => {
    if (paciente) {
      // Función helper para convertir null/undefined a string vacío
      const convertirAString = (valor) => {
        if (valor === null || valor === undefined) return '';
        return valor.toString();
      };
      
      // Función helper para formatear fecha
      const formatearFecha = (fechaString) => {
        if (!fechaString || fechaString === null || fechaString === undefined) return '';
        try {
          const fecha = new Date(fechaString);
          // Asegurarse de que la fecha sea válida
          if (isNaN(fecha.getTime())) return '';
          return fecha.toISOString().split('T')[0];
        } catch (error) {
          console.log('Error formateando fecha:', error);
          return '';
        }
      };

      console.log('Datos del paciente recibidos:', paciente);
      console.log('Campos individuales:');
      console.log('- fecha_nacimiento:', paciente.fecha_nacimiento, typeof paciente.fecha_nacimiento);
      console.log('- altura_inicial:', paciente.altura_inicial, typeof paciente.altura_inicial);
      console.log('- peso_inicial:', paciente.peso_inicial, typeof paciente.peso_inicial);
      console.log('- direccion:', paciente.direccion, typeof paciente.direccion);
      console.log('- ocupacion:', paciente.ocupacion, typeof paciente.ocupacion);
      console.log('- objetivo:', paciente.objetivo, typeof paciente.objetivo);
      console.log('- observaciones_generales:', paciente.observaciones_generales, typeof paciente.observaciones_generales);
      
      setFormData({
        nombre: convertirAString(paciente.nombre),
        apellido: convertirAString(paciente.apellido),
        sexo: convertirAString(paciente.sexo),
        fecha_nacimiento: formatearFecha(paciente.fecha_nacimiento),
        telefono: convertirAString(paciente.telefono),
        email: convertirAString(paciente.email),
        direccion: convertirAString(paciente.direccion),
        ocupacion: convertirAString(paciente.ocupacion),
        altura_inicial: convertirAString(paciente.altura_inicial),
        peso_inicial: convertirAString(paciente.peso_inicial),
        objetivo: convertirAString(paciente.objetivo),
        observaciones_generales: convertirAString(paciente.observaciones_generales),
        obra_social_id: convertirAString(paciente.obra_social_id),
        numero_afiliado: convertirAString(paciente.numero_afiliado)
      });
      
      console.log('FormData configurado:', {
        fecha_nacimiento: formatearFecha(paciente.fecha_nacimiento),
        altura_inicial: paciente.altura_inicial ? paciente.altura_inicial.toString() : '',
        peso_inicial: paciente.peso_inicial ? paciente.peso_inicial.toString() : '',
        obra_social_id: paciente.obra_social_id,
        numero_afiliado: paciente.numero_afiliado
      });
    } else {
      // Limpiar formulario si no hay paciente (nuevo)
      setFormData({
        nombre: '',
        apellido: '',
        sexo: '',
        fecha_nacimiento: '',
        telefono: '',
        email: '',
        direccion: '',
        ocupacion: '',
        altura_inicial: '',
        peso_inicial: '',
        objetivo: '',
        observaciones_generales: '',
        obra_social_id: '',
        numero_afiliado: ''
      });
    }
    // Limpiar errores cuando cambie el paciente
    setErrors({});
    setSubmitError('');
  }, [paciente]);

  // Manejar cambios en los campos
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo al modificarlo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2 || formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre debe tener entre 2 y 100 caracteres';
    } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre.trim())) {
      newErrors.nombre = 'El nombre solo puede contener letras y espacios';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.trim().length < 2 || formData.apellido.trim().length > 100) {
      newErrors.apellido = 'El apellido debe tener entre 2 y 100 caracteres';
    } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.apellido.trim())) {
      newErrors.apellido = 'El apellido solo puede contener letras y espacios';
    }
    
    if (!formData.sexo) {
      newErrors.sexo = 'El sexo es requerido';
    } else if (!['M', 'F', 'O', 'N'].includes(formData.sexo)) {
      newErrors.sexo = 'El sexo debe ser una opción válida';
    }
    
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }

    // Validacion de email
    if (formData.email && formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'El email no tiene un formato valido';
      } else if (formData.email.trim().length > 100) {
        newErrors.email = 'El email no puede exceder 100 caracteres';
      }
    }

    // Validacion de telefono
    if (formData.telefono && formData.telefono.trim()) {
      if (!/^[+]?[\d\s\-\(\)]+$/.test(formData.telefono.trim())) {
        newErrors.telefono = 'Formato de telefono invalido';
      } else if (formData.telefono.trim().length > 50) {
        newErrors.telefono = 'El telefono no puede exceder 50 caracteres';
      }
    }

    // Validacion de fecha de nacimiento
    if (formData.fecha_nacimiento) {
      const fecha = new Date(formData.fecha_nacimiento);
      const hoy = new Date();
      
      if (isNaN(fecha.getTime())) {
        newErrors.fecha_nacimiento = 'La fecha de nacimiento no es valida';
      } else {
        const edad = hoy.getFullYear() - fecha.getFullYear();
        
        if (edad < 0 || edad > 120) {
          newErrors.fecha_nacimiento = 'La edad debe estar entre 0 y 120 anos';
        }
        
        if (fecha > hoy) {
          newErrors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura';
        }
      }
    }

    // Validacion de medidas
    if (formData.altura_inicial && formData.altura_inicial.trim()) {
      const altura = parseFloat(formData.altura_inicial);
      if (isNaN(altura) || altura < 50 || altura > 250) {
        newErrors.altura_inicial = 'La altura debe estar entre 50 y 250 cm';
      }
    }

    if (formData.peso_inicial && formData.peso_inicial.trim()) {
      const peso = parseFloat(formData.peso_inicial);
      if (isNaN(peso) || peso < 1 || peso > 500) {
        newErrors.peso_inicial = 'El peso debe estar entre 1 y 500 kg';
      }
    }

    // Validación de obra social y número de afiliado
    if (formData.obra_social_id && !formData.numero_afiliado.trim()) {
      newErrors.numero_afiliado = 'El número de afiliado es requerido cuando se selecciona una obra social';
    }
    
    if (formData.numero_afiliado.trim() && formData.numero_afiliado.trim().length > 50) {
      newErrors.numero_afiliado = 'El número de afiliado no puede exceder 50 caracteres';
    }

    // Validacion de longitud de campos opcionales
    if (formData.direccion && formData.direccion.trim().length > 255) {
      newErrors.direccion = 'La direccion no puede exceder 255 caracteres';
    }
    
    if (formData.ocupacion && formData.ocupacion.trim().length > 100) {
      newErrors.ocupacion = 'La ocupacion no puede exceder 100 caracteres';
    }
    
    if (formData.objetivo && formData.objetivo.trim().length > 1000) {
      newErrors.objetivo = 'El objetivo no puede exceder 1000 caracteres';
    }
    
    if (formData.observaciones_generales && formData.observaciones_generales.trim().length > 2000) {
      newErrors.observaciones_generales = 'Las observaciones no pueden exceder 2000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envio del formulario
  const handleSubmit = async () => {
    console.log('Datos del formulario antes de validar:', formData);
    
    if (!validateForm()) {
      console.log('Validación fallida, errores:', errors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      // Preparar datos para enviar
      const dataToSend = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        sexo: formData.sexo,
        fecha_nacimiento: formData.fecha_nacimiento,
        // Campos opcionales - solo enviar si tienen valor
        ...(formData.telefono.trim() && { telefono: formData.telefono.trim() }),
        ...(formData.email.trim() && { email: formData.email.trim() }),
        ...(formData.direccion.trim() && { direccion: formData.direccion.trim() }),
        ...(formData.ocupacion.trim() && { ocupacion: formData.ocupacion.trim() }),
        ...(formData.objetivo.trim() && { objetivo: formData.objetivo.trim() }),
        ...(formData.observaciones_generales.trim() && { observaciones_generales: formData.observaciones_generales.trim() }),
        // Obra social
        ...(formData.obra_social_id && { obra_social_id: parseInt(formData.obra_social_id) }),
        ...(formData.numero_afiliado.trim() && { numero_afiliado: formData.numero_afiliado.trim() }),
        // Numeros solo si tienen valor valido
        ...(formData.altura_inicial.trim() && !isNaN(parseFloat(formData.altura_inicial)) && {
          altura_inicial: parseFloat(formData.altura_inicial)
        }),
        ...(formData.peso_inicial.trim() && !isNaN(parseFloat(formData.peso_inicial)) && {
          peso_inicial: parseFloat(formData.peso_inicial)
        })
      };
      
      console.log('Datos a enviar:', dataToSend);
      console.log('Es edición:', isEditing, 'ID del paciente:', paciente?.id);

      let result;
      
      if (isEditing) {
        result = await PacienteService.update(paciente.id, dataToSend);
      } else {
        result = await PacienteService.create(dataToSend);
      }

      console.log('Respuesta del servidor:', result);
      
      // Manejo seguro de la respuesta del servidor
      const pacienteActualizado = result?.data?.paciente || result?.paciente || result?.data || result;
      console.log('Paciente actualizado a enviar al callback:', pacienteActualizado);
      
      onSuccess(pacienteActualizado);
      handleClose();
    } catch (error) {
      console.error('Error al guardar paciente:', error);
      console.error('Response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al guardar el paciente';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!loading) {
      // Solo limpiar errores al cerrar
      setErrors({});
      setSubmitError('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
      </DialogTitle>
      
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Informacion Personal */}
          <Grid item xs={12}>
            <h4>Informacion Personal</h4>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido"
              value={formData.apellido}
              onChange={handleChange('apellido')}
              error={!!errors.apellido}
              helperText={errors.apellido}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.sexo} required>
              <InputLabel>Sexo</InputLabel>
              <Select
                value={formData.sexo}
                label="Sexo"
                onChange={handleChange('sexo')}
              >
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Femenino</MenuItem>
                <MenuItem value="O">Otro / No binario</MenuItem>
                <MenuItem value="N">Prefiero no especificar</MenuItem>
              </Select>
              {errors.sexo && <FormHelperText>{errors.sexo}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={handleChange('fecha_nacimiento')}
              error={!!errors.fecha_nacimiento}
              helperText={errors.fecha_nacimiento}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          {/* Contacto */}
          <Grid item xs={12}>
            <h4>Informacion de Contacto</h4>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefono"
              value={formData.telefono}
              onChange={handleChange('telefono')}
              error={!!errors.telefono}
              helperText={errors.telefono}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Direccion"
              value={formData.direccion}
              onChange={handleChange('direccion')}
              error={!!errors.direccion}
              helperText={errors.direccion}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ocupacion"
              value={formData.ocupacion}
              onChange={handleChange('ocupacion')}
              error={!!errors.ocupacion}
              helperText={errors.ocupacion}
            />
          </Grid>

          {/* Obra Social */}
          <Grid item xs={12}>
            <h4>Información de Obra Social</h4>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.obra_social_id}>
              <InputLabel>Obra Social</InputLabel>
              <Select
                value={obrasSociales.length > 0 ? (formData.obra_social_id || '') : ''}
                label="Obra Social"
                onChange={handleChange('obra_social_id')}
                disabled={loadingObrasSociales}
              >
                <MenuItem value="">
                  <em>Seleccionar obra social</em>
                </MenuItem>
                {obrasSociales.map((obraSocial) => (
                  <MenuItem key={obraSocial.id} value={obraSocial.id}>
                    {obraSocial.nombre}
                    {obraSocial.codigo && ` (${obraSocial.codigo})`}
                  </MenuItem>
                ))}
              </Select>
              {errors.obra_social_id && <FormHelperText>{errors.obra_social_id}</FormHelperText>}
              {loadingObrasSociales && (
                <FormHelperText>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Cargando obras sociales...
                </FormHelperText>
              )}
              {obrasSociales.length === 0 && !loadingObrasSociales && (
                <FormHelperText>
                  No se pudieron cargar las obras sociales
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Número de Afiliado"
              value={formData.numero_afiliado}
              onChange={handleChange('numero_afiliado')}
              error={!!errors.numero_afiliado}
              helperText={errors.numero_afiliado || 
                (!formData.obra_social_id ? 'Solo requerido si tiene obra social' : '')
              }
              disabled={!formData.obra_social_id}
              placeholder={formData.obra_social_id ? 'Ingrese el número de afiliado' : 'Primero seleccione una obra social'}
            />
          </Grid>

          {/* Mediciones Iniciales */}
          <Grid item xs={12}>
            <h4>Mediciones Iniciales</h4>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Altura (cm)"
              type="number"
              value={formData.altura_inicial}
              onChange={handleChange('altura_inicial')}
              error={!!errors.altura_inicial}
              helperText={errors.altura_inicial}
              inputProps={{ min: 50, max: 250, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Peso Inicial (kg)"
              type="number"
              value={formData.peso_inicial}
              onChange={handleChange('peso_inicial')}
              error={!!errors.peso_inicial}
              helperText={errors.peso_inicial}
              inputProps={{ min: 20, max: 500, step: 0.1 }}
            />
          </Grid>

          {/* Objetivos y Observaciones */}
          <Grid item xs={12}>
            <h4>Objetivos y Observaciones</h4>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Objetivo Principal"
              multiline
              rows={2}
              value={formData.objetivo}
              onChange={handleChange('objetivo')}
              error={!!errors.objetivo}
              helperText={errors.objetivo}
              placeholder="Ej: Reducir peso, ganar masa muscular, mejorar composicion corporal..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones Generales"
              multiline
              rows={3}
              value={formData.observaciones_generales}
              onChange={handleChange('observaciones_generales')}
              error={!!errors.observaciones_generales}
              helperText={errors.observaciones_generales}
              placeholder="Alergias, condiciones medicas, preferencias alimentarias, etc."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <CustomButton
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </CustomButton>
        
        <CustomButton
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            isEditing ? 'Actualizar' : 'Crear Paciente'
          )}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default FormularioPaciente;