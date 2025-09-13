import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { 
  Download, 
  Visibility, 
  Assessment 
} from '@mui/icons-material';
import ReportesService from '../../services/reportes';

const FiltrosReporte = ({ 
  pacienteId = null, 
  onDatosObtenidos, 
  tipo = 'individual', // 'individual' o 'consolidado'
  pacienteNombre = ''
}) => {
  
  const [filtros, setFiltros] = useState({
    fechaDesde: null,
    fechaHasta: null,
    incluirGraficos: true,
    consultorioId: null
  });
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Manejar cambios en los filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setError('');
  };

  // Validar filtros
  const validarFiltros = () => {
    const errores = ReportesService.validarFiltrosFecha(filtros);
    
    if (tipo === 'individual' && !pacienteId) {
      errores.push('Debe seleccionar un paciente');
    }
    
    return errores;
  };

  // Obtener datos para vista previa
  const handleVerDatos = async () => {
    const errores = validarFiltros();
    if (errores.length > 0) {
      setError(errores.join('. '));
      return;
    }

    setCargando(true);
    setError('');

    try {
      let datos;
      
      if (tipo === 'individual') {
        datos = await ReportesService.obtenerDatosPaciente(pacienteId, {
          fechaDesde: filtros.fechaDesde?.toISOString().split('T')[0],
          fechaHasta: filtros.fechaHasta?.toISOString().split('T')[0]
        });
      } else {
        datos = await ReportesService.obtenerDatosConsolidado({
          fechaDesde: filtros.fechaDesde?.toISOString().split('T')[0],
          fechaHasta: filtros.fechaHasta?.toISOString().split('T')[0],
          consultorioId: filtros.consultorioId
        });
      }

      onDatosObtenidos(datos, filtros);
    } catch (error) {
      setError(error.mensaje || 'Error al obtener datos del reporte');
    } finally {
      setCargando(false);
    }
  };

  // Descargar PDF
  const handleDescargarPDF = async () => {
    const errores = validarFiltros();
    if (errores.length > 0) {
      setError(errores.join('. '));
      return;
    }

    setCargando(true);
    setError('');

    try {
      if (tipo === 'individual') {
        await ReportesService.descargarReportePaciente(pacienteId, {
          fechaDesde: filtros.fechaDesde?.toISOString().split('T')[0],
          fechaHasta: filtros.fechaHasta?.toISOString().split('T')[0],
          incluirGraficos: filtros.incluirGraficos
        });
      } else {
        await ReportesService.descargarReporteConsolidado({
          fechaDesde: filtros.fechaDesde?.toISOString().split('T')[0],
          fechaHasta: filtros.fechaHasta?.toISOString().split('T')[0],
          consultorioId: filtros.consultorioId
        });
      }
    } catch (error) {
      setError(error.mensaje || 'Error al descargar el reporte PDF');
    } finally {
      setCargando(false);
    }
  };

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaDesde: null,
      fechaHasta: null,
      incluirGraficos: true,
      consultorioId: null
    });
    setError('');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {tipo === 'individual' ? 'Filtros de Reporte Individual' : 'Filtros de Reporte Consolidado'}
        </Typography>

        {tipo === 'individual' && pacienteNombre && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Generando reporte para: <strong>{pacienteNombre}</strong>
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={3}>
            {/* Filtros de fecha */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha desde"
                value={filtros.fechaDesde}
                onChange={(fecha) => handleFiltroChange('fechaDesde', fecha)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={new Date()}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha hasta"
                value={filtros.fechaHasta}
                onChange={(fecha) => handleFiltroChange('fechaHasta', fecha)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={new Date()}
                minDate={filtros.fechaDesde}
              />
            </Grid>

            {/* Opciones adicionales para reporte individual */}
            {tipo === 'individual' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filtros.incluirGraficos}
                      onChange={(e) => handleFiltroChange('incluirGraficos', e.target.checked)}
                    />
                  }
                  label="Incluir gráficos en el PDF"
                />
              </Grid>
            )}

            {/* Error */}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {error}
                </Alert>
              </Grid>
            )}

            {/* Botones de acción */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Visibility />}
                  onClick={handleVerDatos}
                  disabled={cargando}
                >
                  Ver Datos
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Download />}
                  onClick={handleDescargarPDF}
                  disabled={cargando}
                >
                  Descargar PDF
                </Button>

                {tipo === 'consolidado' && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Assessment />}
                    disabled={true} // Por ahora deshabilitado
                  >
                    Estadísticas Avanzadas
                  </Button>
                )}

                <Button
                  variant="text"
                  onClick={handleLimpiarFiltros}
                  disabled={cargando}
                >
                  Limpiar Filtros
                </Button>
              </Box>
            </Grid>
          </Grid>
        </LocalizationProvider>

        {/* Información de ayuda */}
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            <strong>Nota:</strong> Si no selecciona fechas, se incluirán todas las mediciones disponibles.
            {tipo === 'individual' && ' Los gráficos muestran la evolución temporal de los valores principales.'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FiltrosReporte;