import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { medicionesService } from '../../services/medicionesService';
import { pacientesService } from '../../services/pacientesService';

const EvolucionMediciones = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [mediciones, setMediciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [campoSeleccionado, setCampoSeleccionado] = useState('peso');
  const [datosEvolucion, setDatosEvolucion] = useState([]);

  const camposDisponibles = [
    { value: 'peso', label: 'Peso (kg)', color: '#8884d8' },
    { value: 'imc', label: 'IMC', color: '#82ca9d' },
    { value: 'grasa_corporal', label: 'Grasa Corporal (%)', color: '#ffc658' },
    { value: 'musculo', label: 'Masa Muscular (kg)', color: '#ff7300' },
    { value: 'perimetro_cintura', label: 'Perímetro Cintura (cm)', color: '#8dd1e1' },
    { value: 'perimetro_cadera', label: 'Perímetro Cadera (cm)', color: '#d084d0' }
  ];

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  useEffect(() => {
    if (pacienteId && campoSeleccionado) {
      cargarDatosEvolucion();
    }
  }, [pacienteId, campoSeleccionado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del paciente
      const responsePaciente = await pacientesService.getPaciente(pacienteId);
      setPaciente(responsePaciente.data);

      // Cargar mediciones
      const responseMediciones = await medicionesService.getMedicionesPorPaciente(pacienteId);
      setMediciones(responseMediciones.data || []);

      // Cargar estadísticas
      const responseEstadisticas = await medicionesService.getEstadisticas(pacienteId);
      setEstadisticas(responseEstadisticas.data);

    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosEvolucion = async () => {
    try {
      const response = await medicionesService.getDatosEvolucion(pacienteId, campoSeleccionado, 15);
      setDatosEvolucion(response.data.valores || []);
    } catch (error) {
      console.error('Error al cargar datos de evolución:', error);
    }
  };

  const getTendenciaIcon = (cambio) => {
    if (cambio > 0) return <TrendingUpIcon color="success" />;
    if (cambio < 0) return <TrendingDownIcon color="error" />;
    return <TrendingFlatIcon color="action" />;
  };

  const formatearValor = (valor, campo) => {
    if (!valor || typeof valor !== 'number') return '-';
    
    switch (campo) {
      case 'peso':
      case 'musculo':
        return `${valor.toFixed(1)} kg`;
      case 'grasa_corporal':
        return `${valor.toFixed(1)}%`;
      case 'imc':
        return valor.toFixed(1);
      case 'perimetro_cintura':
      case 'perimetro_cadera':
        return `${valor.toFixed(1)} cm`;
      default:
        return valor.toFixed(1);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const campo = camposDisponibles.find(c => c.value === campoSeleccionado);
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">{`Fecha: ${label}`}</Typography>
          <Typography variant="body2" sx={{ color: campo?.color }}>
            {`${campo?.label}: ${formatearValor(payload[0].value, campoSeleccionado)}`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const campoActual = camposDisponibles.find(c => c.value === campoSeleccionado);
  const ultimaMedicion = mediciones[0];
  const penultimaMedicion = mediciones[1];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/pacientes/${pacienteId}`)}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h5">
          Evolución - {paciente?.nombre} {paciente?.apellido}
        </Typography>
      </Box>

      {/* Estadísticas generales */}
      {estadisticas && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Total Mediciones
                </Typography>
                <Typography variant="h4">
                  {estadisticas.total_mediciones}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Peso Actual
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="h4">
                    {estadisticas.peso_actual ? `${estadisticas.peso_actual} kg` : '-'}
                  </Typography>
                  {estadisticas.cambio_peso && (
                    <Box ml={1}>
                      {getTendenciaIcon(estadisticas.cambio_peso)}
                    </Box>
                  )}
                </Box>
                {estadisticas.cambio_peso && (
                  <Typography variant="body2" color="textSecondary">
                    {estadisticas.cambio_peso && typeof estadisticas.cambio_peso === 'number' ? 
                      `${estadisticas.cambio_peso > 0 ? '+' : ''}${estadisticas.cambio_peso.toFixed(1)} kg` : '-'
                    }
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  IMC Promedio
                </Typography>
                <Typography variant="h4">
                  {estadisticas.imc_promedio && typeof estadisticas.imc_promedio === 'number' ? estadisticas.imc_promedio.toFixed(1) : '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Grasa Promedio
                </Typography>
                <Typography variant="h4">
                  {estadisticas.grasa_promedio && typeof estadisticas.grasa_promedio === 'number' ? `${estadisticas.grasa_promedio.toFixed(1)}%` : '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Selector de campo y gráfico */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Evolución de Mediciones
            </Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Campo a visualizar</InputLabel>
              <Select
                value={campoSeleccionado}
                onChange={(e) => setCampoSeleccionado(e.target.value)}
                label="Campo a visualizar"
              >
                {camposDisponibles.map((campo) => (
                  <MenuItem key={campo.value} value={campo.value}>
                    {campo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Comparación última vs penúltima medición */}
          {ultimaMedicion && penultimaMedicion && ultimaMedicion[campoSeleccionado] && penultimaMedicion[campoSeleccionado] && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Comparación con medición anterior:
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  label={`Anterior: ${formatearValor(penultimaMedicion[campoSeleccionado], campoSeleccionado)}`}
                  variant="outlined"
                />
                <Chip
                  label={`Actual: ${formatearValor(ultimaMedicion[campoSeleccionado], campoSeleccionado)}`}
                  color="primary"
                />
                {(() => {
                  const diferencia = ultimaMedicion[campoSeleccionado] - penultimaMedicion[campoSeleccionado];
                  const porcentaje = ((diferencia / penultimaMedicion[campoSeleccionado]) * 100);
                  return (
                    <Chip
                      icon={getTendenciaIcon(diferencia)}
                      label={`${diferencia > 0 ? '+' : ''}${diferencia.toFixed(1)} (${porcentaje.toFixed(1)}%)`}
                      color={diferencia > 0 ? 'success' : diferencia < 0 ? 'error' : 'default'}
                    />
                  );
                })()}
              </Box>
            </Box>
          )}

          {/* Gráfico */}
          {datosEvolucion.length > 0 ? (
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={datosEvolucion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha_formateada" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke={campoActual?.color || '#8884d8'}
                    strokeWidth={2}
                    dot={{ fill: campoActual?.color || '#8884d8', strokeWidth: 2, r: 4 }}
                    name={campoActual?.label}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No hay datos suficientes para mostrar la evolución de {campoActual?.label.toLowerCase()}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de barras comparativo (últimas 5 mediciones) */}
      {datosEvolucion.length >= 3 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comparación Últimas Mediciones
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={datosEvolucion.slice(-5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha_formateada" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="valor" 
                    fill={campoActual?.color || '#8884d8'}
                    name={campoActual?.label}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EvolucionMediciones;
