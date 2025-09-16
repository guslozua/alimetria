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
  Autocomplete,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EventBusy as EventBusyIcon,
  Update as UpdateIcon
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
  
  // *** NUEVOS ESTADOS PARA MEJORAS ***
  const [advertenciaFechaPasada, setAdvertenciaFechaPasada] = useState(false);
  const [estadoSugerido, setEstadoSugerido] = useState(null);
  const [mostrarAccionesRapidas, setMostrarAccionesRapidas] = useState(false);

  // *** NUEVA FUNCIÓN: Análisis inteligente de estados ***
  const analizarEstadoCita = (fechaHora, estadoActual, duracionMinutos) => {
    if (!fechaHora) return null;

    const ahora = dayjs();
    const fechaCita = dayjs(fechaHora);
    const finCita = fechaCita.add(duracionMinutos, 'minute');
    
    const esPasada = fechaCita.isBefore(ahora);
    const yaTermino = finCita.isBefore(ahora);
    const enCurso = fechaCita.isBefore(ahora) && finCita.isAfter(ahora);
    
    return {
      esPasada,
      yaTermino,
      enCurso,
      sugerencia: getSugerenciaEstado(estadoActual, esPasada, yaTermino, enCurso)
    };
  };

  const getSugerenciaEstado = (estadoActual, esPasada, yaTermino, enCurso) => {
    // No sugerir cambios para estados finales
    if (['completada', 'cancelada', 'no_asistio'].includes(estadoActual)) {
      return null;
    }

    if (enCurso && ['programada', 'confirmada'].includes(estadoActual)) {
      return {
        estado: 'en_curso',
        razon: 'La cita está en curso actualmente'
      };
    }

    if (yaTermino && ['programada', 'confirmada', 'en_curso'].includes(estadoActual)) {
      return {
        estado: 'no_asistio', // Por defecto, luego el usuario puede cambiar a completada
        razon: 'La cita ya terminó (se puede cambiar a "Completada" si asistió)'
      };
    }

    return null;
  };

  // *** MODIFICACIÓN: Validación mejorada ***
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.paciente_id) {
      nuevosErrores.paciente_id = 'Selecciona un paciente';
    }

    if (!formData.fecha_hora) {
      nuevosErrores.fecha_hora = 'Selecciona fecha y hora';
    } else {
      const analisis = analizarEstadoCita(formData.fecha_hora, formData.estado, formData.duracion_minutos);
      const esFechaPasada = analisis?.esPasada;
      const esEdicion = Boolean(citaInicial?.id);
      
      // *** NUEVA LÓGICA: Permitir fechas pasadas solo en edición ***
      if (esFechaPasada && !esEdicion) {
        nuevosErrores.fecha_hora = 'Para citas nuevas, la fecha debe ser futura';
      }
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

  // *** NUEVO: Efecto para análisis automático de estados ***
  useEffect(() => {
    if (formData.fecha_hora) {
      const analisis = analizarEstadoCita(formData.fecha_hora, formData.estado, formData.duracion_minutos);
      
      if (analisis) {
        setAdvertenciaFechaPasada(analisis.esPasada);
        setEstadoSugerido(analisis.sugerencia);
        setMostrarAccionesRapidas(analisis.esPasada && citaInicial?.id);
      } else {
        setAdvertenciaFechaPasada(false);
        setEstadoSugerido(null);
        setMostrarAccionesRapidas(false);
      }
    }
  }, [formData.fecha_hora, formData.duracion_minutos, formData.estado, citaInicial?.id]);

  // *** NUEVAS FUNCIONES: Acciones rápidas ***
  const aplicarEstadoSugerido = () => {
    if (estadoSugerido) {
      setFormData(prev => ({ ...prev, estado: estadoSugerido.estado }));
      setEstadoSugerido(null);
    }
  };

  const marcarCompletada = () => {
    setFormData(prev => ({ 
      ...prev, 
      estado: 'completada',
      notas_previas: prev.notas_previas + (prev.notas_previas ? '\n' : '') + 'Cita completada exitosamente.'
    }));
  };

  const marcarNoAsistio = () => {
    setFormData(prev => ({ 
      ...prev, 
      estado: 'no_asistio',
      notas_previas: prev.notas_previas + (prev.notas_previas ? '\n' : '') + 'Paciente no asistió a la cita.'
    }));
  };

  const reagendarCita = () => {
    // Reagendar para el día siguiente a la misma hora
    const fechaActual = dayjs(formData.fecha_hora);
    const nuevaFecha = fechaActual.add(1, 'day');
    
    setFormData(prev => ({
      ...prev,
      fecha_hora: nuevaFecha.toDate(),
      estado: 'programada',
      notas_previas: prev.notas_previas + (prev.notas_previas ? '\n' : '') + `Reagendada desde ${fechaActual.format('DD/MM/YYYY HH:mm')}.`
    }));
  };

  // *** RESTO DE FUNCIONES EXISTENTES ***
  const cargarPacientes = async () => {
    try {
      const response = await pacientesService.getPacientes(1, 100);
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

  const cargarNutricionistas = async () => {
    try {
      const opciones = [
        { id: 1, nombre: 'Dr. Admin Sistema', rol: 'administrador' }
      ];
      
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

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      cargarPacientes();
      cargarNutricionistas();
      
      if (citaInicial) {
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
  }, [open, citaInicial]);

  // Verificar disponibilidad
  useEffect(() => {
    if (formData.fecha_hora && formData.nutricionista_id) {
      const verificarDisp = async () => {
        try {
          setLoadingDisponibilidad(true);
          console.log('🔍 TEMPORAL - Saltando verificación de disponibilidad');
          setDisponibilidadCheck(true);
        } catch (error) {
          console.error('Error al verificar disponibilidad:', error);
          setDisponibilidadCheck(true);
        } finally {
          setLoadingDisponibilidad(false);
        }
      };
      
      verificarDisp();
    }
  }, [formData.fecha_hora, formData.duracion_minutos, formData.nutricionista_id, citaInicial?.id]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    const datosParaEnviar = {
      ...formData,
      paciente_id: parseInt(formData.paciente_id),
      nutricionista_id: parseInt(formData.nutricionista_id),
      duracion_minutos: parseInt(formData.duracion_minutos)
    };

    console.log('Datos enviados:', {
      fecha_original: formData.fecha_hora,
      datos_completos: datosParaEnviar
    });

    await onGuardar(datosParaEnviar);
  };

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
    setAdvertenciaFechaPasada(false);
    setEstadoSugerido(null);
    setMostrarAccionesRapidas(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6">
            {citaInicial ? 'Editar Cita' : 'Nueva Cita'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* *** NUEVA: Advertencia para fechas pasadas *** */}
        {advertenciaFechaPasada && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Fecha en el pasado:</strong> Esta cita tiene una fecha/hora que ya pasó. 
              Verifica que el estado sea apropiado.
            </Typography>
          </Alert>
        )}

        {/* *** NUEVA: Sugerencia automática de estado *** */}
        {estadoSugerido && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={aplicarEstadoSugerido}>
                Aplicar
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Sugerencia:</strong> {estadoSugerido.razon}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Paciente */}
          <Grid item xs={12}>
            <Autocomplete
              options={pacientes}
              value={pacientes.find(p => p.id === formData.paciente_id) || null}
              onChange={(_, newValue) => handleChange('paciente_id', newValue?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Paciente"
                  error={!!errors.paciente_id}
                  helperText={errors.paciente_id}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">{option.label}</Typography>
                    {option.telefono && (
                      <Typography variant="caption" color="text.secondary">
                        {option.telefono}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
            />
          </Grid>

          {/* Fecha y Hora */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DateTimePicker
                label="Fecha y Hora"
                value={formData.fecha_hora}
                onChange={(newValue) => handleChange('fecha_hora', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.fecha_hora,
                    helperText: errors.fecha_hora
                  }
                }}
                ampm={false}
              />
            </LocalizationProvider>
          </Grid>

          {/* Duración */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Duración (minutos)"
              value={formData.duracion_minutos}
              onChange={(e) => handleChange('duracion_minutos', parseInt(e.target.value) || 60)}
              error={!!errors.duracion_minutos}
              helperText={errors.duracion_minutos}
              inputProps={{ min: 15, max: 480, step: 15 }}
            />
          </Grid>

          {/* Tipo de Consulta */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.tipo_consulta}>
              <InputLabel>Tipo de Consulta</InputLabel>
              <Select
                value={formData.tipo_consulta}
                onChange={(e) => handleChange('tipo_consulta', e.target.value)}
                label="Tipo de Consulta"
              >
                {citasService.TIPOS_CONSULTA.map(tipo => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Estado */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                label="Estado"
              >
                {citasService.ESTADOS_CITA.map(estado => (
                  <MenuItem key={estado.value} value={estado.value}>
                    <Chip 
                      label={estado.label} 
                      size="small" 
                      sx={{ 
                        backgroundColor: estado.color, 
                        color: 'white',
                        mr: 1
                      }} 
                    />
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* *** NUEVA: Sección de Acciones Rápidas *** */}
          {mostrarAccionesRapidas && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Acciones rápidas para cita vencida:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={marcarCompletada}
                  >
                    Marcar Completada
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="warning"
                    startIcon={<EventBusyIcon />}
                    onClick={marcarNoAsistio}
                  >
                    No Asistió
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    startIcon={<UpdateIcon />}
                    onClick={reagendarCita}
                  >
                    Reagendar (+1 día)
                  </Button>
                </Stack>
              </Box>
            </Grid>
          )}

          {/* Motivo */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Motivo de la consulta"
              value={formData.motivo}
              onChange={(e) => handleChange('motivo', e.target.value)}
              placeholder="Describe brevemente el motivo de la consulta..."
            />
          </Grid>

          {/* Notas Previas */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notas previas"
              value={formData.notas_previas}
              onChange={(e) => handleChange('notas_previas', e.target.value)}
              placeholder="Observaciones, preparación, indicaciones previas..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingDisponibilidad}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Guardando...' : (citaInicial ? 'Actualizar' : 'Crear')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormularioCita;