import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Autocomplete
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import dayjs from 'dayjs';
import citasService from '../../services/citasService';
import { pacientesService } from '../../services/pacientesService';
import { useAuth } from '../../context/AuthContext';

const FormularioCita = ({ 
  open, 
  onClose, 
  onGuardar, 
  citaInicial, 
  loading = false 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    paciente_id: '',
    nutricionista_id: user?.userId || 1,
    fecha_hora: null,
    duracion_minutos: 60,
    tipo_consulta: 'seguimiento',
    estado: 'programada',
    motivo: '',
    notas_previas: '',
    consultorio_id: user?.consultorioId || 1
  });
  
  const [errors, setErrors] = useState({});
  const [pacientes, setPacientes] = useState([]);
  const [nutricionistas, setNutricionistas] = useState([]);
  const [disponibilidadCheck, setDisponibilidadCheck] = useState(null);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      cargarPacientes();
      cargarNutricionistas();
      
      if (citaInicial) {
        // Estamos editando una cita existente
        setFormData(prev => ({
          ...prev,
          paciente_id: citaInicial.paciente_id || '',
          nutricionista_id: citaInicial.nutricionista_id || 1,
          fecha_hora: citaInicial.fecha_hora ? new Date(citaInicial.fecha_hora) : null,
          duracion_minutos: citaInicial.duracion_minutos || 60,
          tipo_consulta: citaInicial.tipo_consulta || 'seguimiento',
          estado: citaInicial.estado || 'programada',
          motivo: citaInicial.motivo || '',
          notas_previas: citaInicial.notas_previas || ''
        }));
      } else {
        // Resetear formulario para nueva cita
        setFormData(prev => ({
          ...prev,
          paciente_id: '',
          nutricionista_id: 1,
          fecha_hora: citaInicial?.fecha_hora ? new Date(citaInicial.fecha_hora) : null,
          duracion_minutos: 60,
          tipo_consulta: 'seguimiento',
          estado: 'programada',
          motivo: '',
          notas_previas: ''
        }));
      }
      
      setErrors({});
      setDisponibilidadCheck(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, citaInicial]);

  // Cargar pacientes
  const cargarPacientes = async () => {
    try {
      const response = await pacientesService.getPacientes(1, 100); // Cargar hasta 100 pacientes
      
      // Los pacientes vienen en response.data.pacientes
      const pacientesData = response.data?.pacientes || [];
      
      setPacientes(pacientesData.map(p => ({
        id: p.id,
        label: `${p.nombre} ${p.apellido}`,
        telefono: p.telefono,
        email: p.email
      })));
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      setPacientes([]);
    }
  };

  // Cargar nutricionistas (usuarios con rol nutricionista o admin)
  const cargarNutricionistas = async () => {
    try {
      // Por ahora, cargamos opciones básicas
      // En el futuro se puede crear un endpoint específico para obtener usuarios con rol nutricionista
      const opciones = [
        { id: 1, nombre: 'Dr. Admin Sistema', rol: 'administrador' }
      ];
      
      // Si el usuario actual es diferente al admin, agregarlo también
      if (user?.userId && user.userId !== 1) {
        opciones.push({
          id: user.userId,
          nombre: `${user.nombre} ${user.apellido || ''}`.trim() || user.email,
          rol: user.rol_nombre
        });
      }
      
      setNutricionistas(opciones);
    } catch (error) {
      console.error('Error al cargar nutricionistas:', error);
      setNutricionistas([{ id: 1, nombre: 'Dr. Admin Sistema' }]);
    }
  };

  // Verificar disponibilidad cuando cambian fecha, duración o nutricionista
  useEffect(() => {
    if (formData.fecha_hora && formData.nutricionista_id) {
      const verificarDisp = async () => {
        try {
          setLoadingDisponibilidad(true);
          
          const response = await citasService.verificarDisponibilidad(
            formData.nutricionista_id,
            formData.fecha_hora.toISOString(),
            formData.duracion_minutos,
            citaInicial?.id
          );
          
          // Verificar disponibilidad desde la respuesta
          const disponible = response?.disponible !== undefined ? response.disponible : false;
          setDisponibilidadCheck(disponible);
        } catch (error) {
          console.error('Error al verificar disponibilidad:', error);
          setDisponibilidadCheck(false);
        } finally {
          setLoadingDisponibilidad(false);
        }
      };
      
      verificarDisp();
    }
  }, [formData.fecha_hora, formData.duracion_minutos, formData.nutricionista_id, citaInicial?.id]);

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.paciente_id) {
      nuevosErrores.paciente_id = 'Selecciona un paciente';
    }

    if (!formData.fecha_hora) {
      nuevosErrores.fecha_hora = 'Selecciona fecha y hora';
    } else if (dayjs(formData.fecha_hora).isBefore(dayjs())) {
      nuevosErrores.fecha_hora = 'La fecha debe ser futura';
    }

    if (!formData.duracion_minutos || formData.duracion_minutos < 15) {
      nuevosErrores.duracion_minutos = 'Duración mínima: 15 minutos';
    }

    if (!formData.tipo_consulta) {
      nuevosErrores.tipo_consulta = 'Selecciona el tipo de consulta';
    }

    if (disponibilidadCheck === false) {
      nuevosErrores.fecha_hora = 'El horario no está disponible';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    const datosParaEnviar = {
      ...formData,
      fecha_hora: formData.fecha_hora.toISOString(),
      paciente_id: parseInt(formData.paciente_id),
      nutricionista_id: parseInt(formData.nutricionista_id),
      duracion_minutos: parseInt(formData.duracion_minutos)
    };

    await onGuardar(datosParaEnviar);
  };

  // Cerrar modal
  const handleClose = () => {
    setFormData({
      paciente_id: '',
      nutricionista_id: user?.userId || 1,
      fecha_hora: null,
      duracion_minutos: 60,
      tipo_consulta: 'seguimiento',
      estado: 'programada',
      motivo: '',
      notas_previas: '',
      consultorio_id: user?.consultorioId || 1
    });
    setErrors({});
    setDisponibilidadCheck(null);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6">
              {citaInicial ? 'Editar Cita' : 'Nueva Cita'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Selección de Paciente */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Paciente *
              </Typography>
              <Autocomplete
                options={pacientes}
                value={pacientes.find(p => p.id === formData.paciente_id) || null}
                onChange={(event, newValue) => handleChange('paciente_id', newValue?.id || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Buscar y seleccionar paciente..."
                    error={!!errors.paciente_id}
                    helperText={errors.paciente_id}
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
                          👤
                        </Box>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">{option.label}</Typography>
                      {option.telefono && (
                        <Typography variant="caption" color="text.secondary">
                          📞 {option.telefono}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Fecha y Hora */}
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Fecha y Hora"
                value={formData.fecha_hora}
                onChange={(newValue) => handleChange('fecha_hora', newValue)}
                slots={{
                  textField: (params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.fecha_hora}
                      helperText={errors.fecha_hora}
                      required
                    />
                  )
                }}
                minDateTime={new Date()}
              />
              
              {/* Indicador de disponibilidad */}
              {formData.fecha_hora && formData.nutricionista_id && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {loadingDisponibilidad ? (
                    <CircularProgress size={16} />
                  ) : disponibilidadCheck === true ? (
                    <Alert severity="success" sx={{ py: 0 }}>
                      ✅ Horario disponible
                    </Alert>
                  ) : disponibilidadCheck === false ? (
                    <Alert severity="error" sx={{ py: 0 }}>
                      ❌ Horario no disponible
                    </Alert>
                  ) : null}
                </Box>
              )}
            </Grid>

            {/* Duración */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Duración</InputLabel>
                <Select
                  value={formData.duracion_minutos}
                  onChange={(e) => handleChange('duracion_minutos', e.target.value)}
                  label="Duración"
                  error={!!errors.duracion_minutos}
                >
                  <MenuItem value={30}>30 minutos</MenuItem>
                  <MenuItem value={45}>45 minutos</MenuItem>
                  <MenuItem value={60}>1 hora</MenuItem>
                  <MenuItem value={90}>1.5 horas</MenuItem>
                  <MenuItem value={120}>2 horas</MenuItem>
                </Select>
              </FormControl>
              {errors.duracion_minutos && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.duracion_minutos}
                </Typography>
              )}
            </Grid>

            {/* Selección de Nutricionista (solo si es admin o secretario) */}
            {(user?.rol_nombre === 'administrador' || user?.rol_nombre === 'secretario') ? (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Nutricionista</InputLabel>
                  <Select
                    value={formData.nutricionista_id}
                    onChange={(e) => handleChange('nutricionista_id', e.target.value)}
                    label="Nutricionista"
                  >
                    {nutricionistas.map((nutricionista) => (
                      <MenuItem key={nutricionista.id} value={nutricionista.id}>
                        {nutricionista.nombre} 
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({nutricionista.rol})
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nutricionista"
                  value={nutricionistas.find(n => n.id === formData.nutricionista_id)?.nombre || 'Dr. Admin Sistema'}
                  disabled
                  fullWidth
                  helperText="Se asigna automáticamente según el usuario actual"
                />
              </Grid>
            )}

            {/* Tipo de Consulta */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Consulta</InputLabel>
                <Select
                  value={formData.tipo_consulta}
                  onChange={(e) => handleChange('tipo_consulta', e.target.value)}
                  label="Tipo de Consulta"
                  error={!!errors.tipo_consulta}
                >
                  {citasService.TIPOS_CONSULTA.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.tipo_consulta && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.tipo_consulta}
                </Typography>
              )}
            </Grid>

            {/* Estado (solo para editar) */}
            {citaInicial && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estado}
                    onChange={(e) => handleChange('estado', e.target.value)}
                    label="Estado"
                  >
                    {citasService.ESTADOS_CITA.map((estado) => (
                      <MenuItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Motivo */}
            <Grid item xs={12}>
              <TextField
                label="Motivo de la Consulta"
                value={formData.motivo}
                onChange={(e) => handleChange('motivo', e.target.value)}
                multiline
                rows={2}
                fullWidth
                placeholder="Ej: Control mensual, seguimiento de plan alimentario..."
              />
            </Grid>

            {/* Notas Previas */}
            <Grid item xs={12}>
              <TextField
                label="Notas Previas"
                value={formData.notas_previas}
                onChange={(e) => handleChange('notas_previas', e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Información relevante antes de la cita..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            color="inherit"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={loading || disponibilidadCheck === false}
          >
            {loading ? 'Guardando...' : citaInicial ? 'Actualizar' : 'Crear Cita'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default FormularioCita;
