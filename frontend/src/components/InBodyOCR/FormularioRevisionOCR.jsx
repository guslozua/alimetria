import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { medicionesService } from '../../services/medicionesService';
import Swal from 'sweetalert2';

dayjs.locale('es');

const FormularioRevisionOCR = ({ 
  ocrData, 
  pacienteId, 
  onSave, 
  onCancel,
  initialData = null 
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [autoCalcular, setAutoCalcular] = useState(true);

  // Inicializar formulario
  useEffect(() => {
    if (ocrData) {
      const mappedData = medicionesService.mapearDatosOCR(ocrData);
      setFormData({
        ...mappedData,
        paciente_id: pacienteId,
        ...initialData // Sobrescribir con datos iniciales si existen
      });
    }
  }, [ocrData, pacienteId, initialData]);

  // Manejar cambios en el formulario
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calcular IMC si está habilitado
      if (autoCalcular && (field === 'peso' || field === 'altura')) {
        const peso = parseFloat(field === 'peso' ? value : prev.peso);
        const altura = parseFloat(field === 'altura' ? value : prev.altura);
        
        if (peso && altura) {
          newData.imc = medicionesService.calcularIMC(peso, altura);
        }
      }
      
      return newData;
    });
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Manejar cambio de fecha
  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      fecha_medicion: newDate ? newDate.toISOString() : ''
    }));
  };

  // Calcular IMC manualmente
  const calcularIMC = () => {
    const peso = parseFloat(formData.peso);
    const altura = parseFloat(formData.altura);
    
    if (peso && altura) {
      const imc = medicionesService.calcularIMC(peso, altura);
      setFormData(prev => ({ ...prev, imc }));
      
      Swal.fire({
        icon: 'success',
        title: 'IMC Calculado',
        text: `IMC: ${imc}`,
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Datos faltantes',
        text: 'Necesitas peso y altura para calcular el IMC'
      });
    }
  };

  // Restaurar datos originales del OCR
  const restaurarDatosOCR = () => {
    if (ocrData) {
      const mappedData = medicionesService.mapearDatosOCR(ocrData);
      setFormData({
        ...mappedData,
        paciente_id: pacienteId
      });
      setErrors({});
      
      Swal.fire({
        icon: 'info',
        title: 'Datos restaurados',
        text: 'Se han restaurado los datos originales del OCR',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const validacion = medicionesService.validarMedicion(formData);
    setErrors({});
    
    if (!validacion.esValido) {
      const errorsMap = {};
      validacion.errores.forEach(error => {
        if (error.includes('paciente')) errorsMap.paciente_id = error;
        if (error.includes('fecha')) errorsMap.fecha_medicion = error;
        if (error.includes('peso')) errorsMap.peso = error;
        if (error.includes('altura')) errorsMap.altura = error;
        if (error.includes('grasa')) errorsMap.grasa_corporal = error;
      });
      setErrors(errorsMap);
    }
    
    return validacion.esValido;
  };

  // Guardar medición
  const handleSave = async () => {
    if (!validarFormulario()) {
      Swal.fire({
        icon: 'error',
        title: 'Datos inválidos',
        text: 'Por favor corrige los errores antes de guardar'
      });
      return;
    }

    setLoading(true);
    
    try {
      await medicionesService.crearMedicionDesdeOCR(formData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Medición guardada!',
        text: 'La medición InBody se ha guardado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
      
      if (onSave) onSave(formData);
      
    } catch (error) {
      console.error('Error al guardar medición:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.response?.data?.message || 'No se pudo guardar la medición'
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener color del chip de confianza
  const getConfianzaColor = (confianza) => {
    if (confianza >= 80) return 'success';
    if (confianza >= 60) return 'warning';
    return 'error';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Revisar Datos de Medición InBody
            </Typography>
            
            <Box display="flex" gap={1} alignItems="center">
              <Chip
                label={`Confianza OCR: ${formData.confianza_ocr || 0}%`}
                color={getConfianzaColor(formData.confianza_ocr || 0)}
                size="small"
              />
              
              <Tooltip title="Restaurar datos originales del OCR">
                <IconButton size="small" onClick={restaurarDatosOCR}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Alerta de confianza baja */}
          {formData.confianza_ocr < 70 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                La confianza del OCR es baja. Te recomendamos revisar cuidadosamente todos los campos.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Fecha y Hora */}
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Fecha y Hora de Medición"
                value={formData.fecha_medicion ? dayjs(formData.fecha_medicion) : null}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.fecha_medicion}
                    helperText={errors.fecha_medicion}
                  />
                )}
              />
            </Grid>

            {/* Tipo de Medición */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Medición</InputLabel>
                <Select
                  value={formData.tipo || 'inbody'}
                  onChange={handleChange('tipo')}
                  label="Tipo de Medición"
                >
                  <MenuItem value="inbody">InBody H30</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="mixta">Mixta</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Datos Principales
              </Typography>
            </Grid>

            {/* Peso */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Peso (kg)"
                type="number"
                value={formData.peso || ''}
                onChange={handleChange('peso')}
                error={!!errors.peso}
                helperText={errors.peso}
                inputProps={{ step: 0.1, min: 0, max: 500 }}
              />
            </Grid>

            {/* Altura */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Altura (cm)"
                type="number"
                value={formData.altura || ''}
                onChange={handleChange('altura')}
                error={!!errors.altura}
                helperText={errors.altura}
                inputProps={{ step: 0.1, min: 0, max: 300 }}
              />
            </Grid>

            {/* IMC */}
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="IMC (kg/m²)"
                  type="number"
                  value={formData.imc || ''}
                  onChange={handleChange('imc')}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                />
                <Tooltip title="Calcular IMC">
                  <IconButton onClick={calcularIMC} color="primary">
                    <CalculateIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={autoCalcular}
                    onChange={(e) => setAutoCalcular(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="caption">Auto-calcular</Typography>}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Composición Corporal
              </Typography>
            </Grid>

            {/* Grasa Corporal % */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Grasa Corporal (%)"
                type="number"
                value={formData.grasa_corporal || ''}
                onChange={handleChange('grasa_corporal')}
                error={!!errors.grasa_corporal}
                helperText={errors.grasa_corporal}
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
            </Grid>

            {/* Grasa Corporal kg */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Grasa Corporal (kg)"
                type="number"
                value={formData.grasa_corporal_kg || ''}
                onChange={handleChange('grasa_corporal_kg')}
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>

            {/* Masa Muscular */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Masa Muscular (kg)"
                type="number"
                value={formData.musculo || ''}
                onChange={handleChange('musculo')}
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>

            {/* Puntuación Corporal */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Puntuación Corporal"
                type="number"
                value={formData.puntuacion_corporal || ''}
                onChange={handleChange('puntuacion_corporal')}
                inputProps={{ step: 1, min: 0, max: 100 }}
              />
            </Grid>

            {/* Observaciones */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={formData.observaciones || ''}
                onChange={handleChange('observaciones')}
                placeholder="Observaciones adicionales sobre la medición..."
              />
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              {loading ? 'Guardando...' : 'Guardar Medición'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default FormularioRevisionOCR;