import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Paper,
  Divider,
  Button,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import citasService from '../../services/citasService';
import { useAuth } from '../../context/AuthContext';

const DashboardCitas = ({ 
  citas = [], 
  onEditarCita, 
  onCancelarCita, 
  onCompletarCita, 
  onConfirmarCita,
  onRecargarCitas,
  loading 
}) => {
  const { user } = useAuth();
  const [proximasCitas, setProximasCitas] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);

  // Calcular estadísticas locales
  const calcularEstadisticas = () => {
    const hoy = dayjs();
    const estaSemana = dayjs().add(7, 'day');

    const stats = {
      hoy: citas.filter(c => dayjs(c.fecha_hora).isSame(hoy, 'day')).length,
      estaSemana: citas.filter(c => 
        dayjs(c.fecha_hora).isAfter(hoy) && 
        dayjs(c.fecha_hora).isBefore(estaSemana)
      ).length,
      pendientes: citas.filter(c => 
        ['programada', 'confirmada'].includes(c.estado)
      ).length,
      completadas: citas.filter(c => c.estado === 'completada').length
    };

    const porEstado = citasService.ESTADOS_CITA.map(estado => {
      const cantidad = citas.filter(c => c.estado === estado.value).length;
      return {
        ...estado,
        cantidad,
        porcentaje: citas.length > 0 ? ((cantidad / citas.length) * 100).toFixed(1) : 0
      };
    }).filter(e => e.cantidad > 0);

    return { stats, porEstado };
  };

  const { stats, porEstado } = calcularEstadisticas();

  // Obtener próximas citas (limitadas)
  const obtenerProximasCitas = () => {
    const ahora = dayjs();
    return citas
      .filter(cita => dayjs(cita.fecha_hora).isAfter(ahora))
      .sort((a, b) => dayjs(a.fecha_hora).diff(dayjs(b.fecha_hora)))
      .slice(0, 8); // Mostrar máximo 8 próximas citas
  };

  const proximasCitasData = obtenerProximasCitas();

  // Formatear tiempo relativo
  const formatearTiempoRelativo = (fechaHora) => {
    const fecha = dayjs(fechaHora);
    const ahora = dayjs();
    const diff = fecha.diff(ahora, 'minute');

    if (diff < 60) {
      return `En ${diff} min`;
    } else if (diff < 1440) { // menos de 24 horas
      return `En ${Math.floor(diff / 60)} hs`;
    } else {
      return fecha.format('DD/MM HH:mm');
    }
  };

  return (
    <Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Header con botón de refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          📊 Dashboard de Citas
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRecargarCitas}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Estadísticas Rápidas */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Citas de Hoy */}
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon />
                    <Box>
                      <Typography variant="h4" component="div">
                        {stats.hoy}
                      </Typography>
                      <Typography variant="body2">
                        Hoy
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Citas Esta Semana */}
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventAvailableIcon />
                    <Box>
                      <Typography variant="h4" component="div">
                        {stats.estaSemana}
                      </Typography>
                      <Typography variant="body2">
                        Esta Semana
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Citas Pendientes */}
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventBusyIcon />
                    <Box>
                      <Typography variant="h4" component="div">
                        {stats.pendientes}
                      </Typography>
                      <Typography variant="body2">
                        Pendientes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Citas Completadas */}
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon />
                    <Box>
                      <Typography variant="h4" component="div">
                        {stats.completadas}
                      </Typography>
                      <Typography variant="body2">
                        Completadas
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Próximas Citas */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              Próximas Citas
            </Typography>
            
            {proximasCitasData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <EventAvailableIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay citas próximas programadas
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {proximasCitasData.map((cita, index) => (
                  <React.Fragment key={cita.id}>
                    <ListItem
                      sx={{
                        px: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: citasService.getColorByEstado(cita.estado) }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <span style={{ fontWeight: 'medium' }}>
                              {cita.paciente_nombre}
                            </span>
                            <Chip
                              label={citasService.getLabelByEstado(cita.estado)}
                              size="small"
                              color={cita.estado === 'confirmada' ? 'success' : 'primary'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <ScheduleIcon fontSize="small" />
                              <span>
                                {dayjs(cita.fecha_hora).format('DD/MM/YYYY HH:mm')} 
                                <span style={{ color: 'primary.main', fontWeight: 'bold', marginLeft: 8 }}>
                                  ({formatearTiempoRelativo(cita.fecha_hora)})
                                </span>
                              </span>
                            </Box>
                            <span style={{ color: 'text.secondary' }}>
                              {citasService.getLabelByTipoConsulta(cita.tipo_consulta)} 
                              {cita.motivo && ` • ${cita.motivo}`}
                            </span>
                          </Box>
                        }
                      />

                      {/* Acciones Rápidas */}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {cita.paciente_telefono && (
                          <Tooltip title={`Llamar: ${cita.paciente_telefono}`}>
                            <IconButton 
                              size="small" 
                              href={`tel:${cita.paciente_telefono}`}
                              sx={{ color: 'success.main' }}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Editar cita">
                          <IconButton 
                            size="small"
                            onClick={() => onEditarCita?.(cita)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {cita.estado === 'programada' && (
                          <Tooltip title="Confirmar cita">
                            <IconButton 
                              size="small"
                              onClick={() => onConfirmarCita?.(cita.id)}
                              sx={{ color: 'success.main' }}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {cita.estado === 'confirmada' && (
                          <Tooltip title="Completar cita">
                            <IconButton 
                              size="small"
                              onClick={() => onCompletarCita?.(cita.id, '')}
                              sx={{ color: 'primary.main' }}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItem>
                    
                    {index < proximasCitasData.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Estadísticas por Estado */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              Estados de Citas
            </Typography>
            
            {porEstado.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay datos de citas
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                {porEstado.map((estado, index) => (
                  <Box key={estado.value} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {estado.label}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {estado.cantidad} ({estado.porcentaje}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(estado.porcentaje)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: estado.color,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Resumen del Día */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              Agenda de Hoy - {dayjs().format('dddd, DD [de] MMMM')}
            </Typography>
            
            {(() => {
              const citasHoy = citas.filter(c => 
                dayjs(c.fecha_hora).isSame(dayjs(), 'day')
              ).sort((a, b) => 
                dayjs(a.fecha_hora).diff(dayjs(b.fecha_hora))
              );

              if (citasHoy.length === 0) {
                return (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <EventAvailableIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No hay citas programadas para hoy
                    </Typography>
                  </Box>
                );
              }

              return (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {citasHoy.map((cita) => (
                    <Grid item xs={12} sm={6} md={4} key={cita.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => onEditarCita?.(cita)}
                      >
                        <CardContent sx={{ pb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" color="primary">
                              {dayjs(cita.fecha_hora).format('HH:mm')}
                            </Typography>
                            <Chip
                              label={citasService.getLabelByEstado(cita.estado)}
                              size="small"
                              sx={{
                                backgroundColor: citasService.getColorByEstado(cita.estado),
                                color: 'white'
                              }}
                            />
                          </Box>
                          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                            {cita.paciente_nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {citasService.getLabelByTipoConsulta(cita.tipo_consulta)}
                            {cita.duracion_minutos && ` • ${cita.duracion_minutos} min`}
                          </Typography>
                          {cita.motivo && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              💬 {cita.motivo}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              );
            })()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardCitas;
