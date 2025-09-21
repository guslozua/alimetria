import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const FormularioCita = ({ open, onClose, onSuccess, pacienteId, pacienteNombre }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    duracion_minutos: 60,
    tipo_consulta: 'seguimiento',
    motivo: '',
    notas_previas: ''
  });

  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (open) {
      setFormData({
        fecha: '',
        hora: '',
        duracion_minutos: 60,
        tipo_consulta: 'seguimiento',
        motivo: '',
        notas_previas: ''
      });
      setError('');
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.fecha) {
      setError('La fecha es obligatoria');
      return false;
    }
    
    if (!formData.hora) {
      setError('La hora es obligatoria');
      return false;
    }
    
    // Validar que la fecha no sea en el pasado (excepto hoy)
    const fechaSeleccionada = new Date(`${formData.fecha}T${formData.hora}`);
    const ahora = new Date();
    
    if (fechaSeleccionada < ahora) {
      setError('No se puede programar una cita en el pasado');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Combinar fecha y hora en formato ISO
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}`);
      
      const citaData = {
        paciente_id: parseInt(pacienteId),
        nutricionista_id: user.id,
        fecha_hora: fechaHora.toISOString(),
        duracion_minutos: parseInt(formData.duracion_minutos),
        tipo_consulta: formData.tipo_consulta,
        estado: 'programada',
        motivo: formData.motivo.trim(),
        notas_previas: formData.notas_previas.trim(),
        consultorio_id: user.consultorioId || 1 // Usar consultorio del usuario o default
      };

      console.log('Datos a enviar:', citaData);

      const response = await fetch('/api/citas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(citaData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        console.log('Cita creada exitosamente:', data.data);
        onSuccess && onSuccess(data.data);
        onClose();
      } else {
        throw new Error(data.message || 'Error al crear la cita');
      }

    } catch (error) {
      console.error('Error creando cita:', error);
      setError(error.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Obtener fecha mínima (hoy)
  const getFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  // Obtener hora mínima si es hoy
  const getHoraMinima = () => {
    const hoy = new Date();
    const fechaSeleccionada = formData.fecha;
    
    if (fechaSeleccionada === hoy.toISOString().split('T')[0]) {
      // Si es hoy, la hora mínima es la hora actual + 1 hora
      const horaMinima = new Date(hoy.getTime() + 60 * 60 * 1000);
      return horaMinima.toTimeString().slice(0, 5);
    }
    
    return '08:00'; // Hora mínima por defecto
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Typography variant="h6">
          Nueva Cita - {pacienteNombre}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Fecha y Hora */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: getFechaMinima()
              }}
              disabled={loading}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hora"
              type="time"
              value={formData.hora}
              onChange={(e) => handleChange('hora', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: getHoraMinima(),
                max: '20:00'
              }}
              disabled={loading}
              required
            />
          </Grid>
          
          {/* Duración */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Duración</InputLabel>
              <Select
                value={formData.duracion_minutos}
                label="Duración"
                onChange={(e) => handleChange('duracion_minutos', e.target.value)}
              >
                <MenuItem value={30}>30 minutos</MenuItem>
                <MenuItem value={45}>45 minutos</MenuItem>
                <MenuItem value={60}>60 minutos</MenuItem>
                <MenuItem value={90}>90 minutos</MenuItem>
                <MenuItem value={120}>120 minutos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Tipo de Consulta */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Tipo de Consulta</InputLabel>
              <Select
                value={formData.tipo_consulta}
                label="Tipo de Consulta"
                onChange={(e) => handleChange('tipo_consulta', e.target.value)}
              >
                <MenuItem value="primera_vez">Primera vez</MenuItem>
                <MenuItem value="seguimiento">Seguimiento</MenuItem>
                <MenuItem value="control">Control</MenuItem>
                <MenuItem value="urgencia">Urgencia</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Motivo */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Motivo de la consulta"
              value={formData.motivo}
              onChange={(e) => handleChange('motivo', e.target.value)}
              multiline
              rows={2}
              disabled={loading}
              placeholder="Ej: Control mensual, seguimiento de plan nutricional..."
            />
          </Grid>
          
          {/* Notas Previas */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notas previas (opcional)"
              value={formData.notas_previas}
              onChange={(e) => handleChange('notas_previas', e.target.value)}
              multiline
              rows={3}
              disabled={loading}
              placeholder="Información adicional, preparación necesaria, etc."
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={handleCancel}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Creando...' : 'Crear Cita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormularioCita;