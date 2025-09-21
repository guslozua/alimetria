import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Event as EventIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { formatearFecha, formatearHora } from '../../utils/formatters';
import { FormularioCita } from '../Citas';

const ListaCitasPaciente = ({ pacienteId, pacienteNombre }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [citaDetalle, setCitaDetalle] = useState({
    open: false,
    cita: null
  });
  const [formularioCita, setFormularioCita] = useState({
    open: false
  });

  useEffect(() => {
    cargarCitas();
  }, [pacienteId]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamar al endpoint real para obtener las citas del paciente
      const response = await fetch(`/api/pacientes/${pacienteId}/citas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCitas(data.data.citas || []);
      } else {
        throw new Error(data.message || 'Error al cargar las citas');
      }
      
    } catch (error) {
      setError('Error al cargar las citas del paciente');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'programada': 'info',
      'confirmada': 'primary',
      'en_curso': 'warning',
      'completada': 'success',
      'cancelada': 'error',
      'no_asistio': 'error'
    };
    return colores[estado] || 'default';
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      'programada': <ScheduleIcon />,
      'confirmada': <EventIcon />,
      'en_curso': <ScheduleIcon />,
      'completada': <CheckCircleIcon />,
      'cancelada': <CancelIcon />,
      'no_asistio': <ErrorIcon />
    };
    return iconos[estado] || <InfoIcon />;
  };

  const getTipoConsulta = (tipo) => {
    const tipos = {
      'primera_vez': 'Primera vez',
      'seguimiento': 'Seguimiento',
      'control': 'Control',
      'urgencia': 'Urgencia'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoTexto = (estado) => {
    const estados = {
      'programada': 'Programada',
      'confirmada': 'Confirmada',
      'en_curso': 'En curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No asistió'
    };
    return estados[estado] || estado;
  };

  const handleVerDetalle = (cita) => {
    setCitaDetalle({
      open: true,
      cita
    });
  };

  const handleCerrarDetalle = () => {
    setCitaDetalle({
      open: false,
      cita: null
    });
  };

  const handleNuevaCita = () => {
    setFormularioCita({ open: true });
  };

  const handleCerrarFormulario = () => {
    setFormularioCita({ open: false });
  };

  const handleCitaCreada = (nuevaCita) => {
    console.log('✅ Nueva cita creada:', nuevaCita);
    // Recargar la lista de citas
    cargarCitas();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const citasOrdenadas = citas.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
  const proximaCita = citas.find(c => c.estado === 'programada' || c.estado === 'confirmada');
  const ultimaCita = citas.find(c => c.estado === 'completada');

  return (
    <Box>
      {/* Resumen rápido */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <EventIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    Próxima Cita
                  </Typography>
                  {proximaCita ? (
                    <Box>
                      <Typography variant="body1">
                        {formatearFecha(proximaCita.fecha_hora)} a las {formatearHora(proximaCita.fecha_hora)}
                      </Typography>
                      <Chip 
                        label={getEstadoTexto(proximaCita.estado)}
                        color={getEstadoColor(proximaCita.estado)}
                        size="small"
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay citas programadas
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography variant="h6">
                    Última Consulta
                  </Typography>
                  {ultimaCita ? (
                    <Box>
                      <Typography variant="body1">
                        {formatearFecha(ultimaCita.fecha_hora)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getTipoConsulta(ultimaCita.tipo_consulta)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin consultas completadas
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de citas */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Historial de Citas - {pacienteNombre}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              onClick={handleNuevaCita}
            >
              Nueva Cita
            </Button>
          </Box>
          
          {citasOrdenadas.length === 0 ? (
            <Alert severity="info">
              No hay citas registradas para este paciente
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha y Hora</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Motivo</TableCell>
                    <TableCell>Duración</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citasOrdenadas.map((cita) => (
                    <TableRow key={cita.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatearFecha(cita.fecha_hora)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatearHora(cita.fecha_hora)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getTipoConsulta(cita.tipo_consulta)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getEstadoIcon(cita.estado)}
                          label={getEstadoTexto(cita.estado)}
                          color={getEstadoColor(cita.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {cita.motivo || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {cita.duracion_minutos} min
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleVerDetalle(cita)}
                          title="Ver detalle"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalle de cita */}
      <Dialog
        open={citaDetalle.open}
        onClose={handleCerrarDetalle}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Detalle de Cita
        </DialogTitle>
        {citaDetalle.cita && (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha y Hora
                </Typography>
                <Typography variant="body1">
                  {formatearFecha(citaDetalle.cita.fecha_hora)} a las {formatearHora(citaDetalle.cita.fecha_hora)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tipo de Consulta
                </Typography>
                <Typography variant="body1">
                  {getTipoConsulta(citaDetalle.cita.tipo_consulta)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado
                </Typography>
                <Chip 
                  icon={getEstadoIcon(citaDetalle.cita.estado)}
                  label={getEstadoTexto(citaDetalle.cita.estado)}
                  color={getEstadoColor(citaDetalle.cita.estado)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Motivo
                </Typography>
                <Typography variant="body1">
                  {citaDetalle.cita.motivo || '-'}
                </Typography>
              </Grid>
              
              {citaDetalle.cita.notas_previas && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notas Previas
                  </Typography>
                  <Typography variant="body1">
                    {citaDetalle.cita.notas_previas}
                  </Typography>
                </Grid>
              )}
              
              {citaDetalle.cita.notas_posteriores && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notas Posteriores
                  </Typography>
                  <Typography variant="body1">
                    {citaDetalle.cita.notas_posteriores}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nutricionista
                </Typography>
                <Typography variant="body1">
                  {citaDetalle.cita.nutricionista_nombre}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCerrarDetalle}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulario de Nueva Cita */}
      <FormularioCita
        open={formularioCita.open}
        onClose={handleCerrarFormulario}
        onSuccess={handleCitaCreada}
        pacienteId={pacienteId}
        pacienteNombre={pacienteNombre}
      />
    </Box>
  );
};

export default ListaCitasPaciente;