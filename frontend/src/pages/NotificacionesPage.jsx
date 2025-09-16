import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Pagination,
  Skeleton
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import NotificacionService from '../services/notificacionService';

const NotificacionesPage = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: '',
    leidas: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    noLeidas: 0,
    porTipo: {}
  });

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await NotificacionService.getMisNotificaciones({
        ...filtros,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      });
      
      if (response.success) {
        setNotificaciones(response.data.notificaciones || []);
        setStats({
          total: response.data.total || 0,
          noLeidas: response.data.noLeidas || 0,
          porTipo: response.data.porTipo || {}
        });
        
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    cargarNotificaciones();
  }, [filtros, pagination.page]);

  // Handlers
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleMarcarComoLeida = async (notificacionId) => {
    try {
      await NotificacionService.marcarComoLeida(notificacionId);
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === notificacionId 
            ? { ...n, leida: 1, fecha_leida: new Date().toISOString() }
            : n
        )
      );
      setStats(prev => ({ ...prev, noLeidas: Math.max(0, prev.noLeidas - 1) }));
      // Recargar notificaciones para asegurar sincronización
      await cargarNotificaciones();
      console.log('Notificación marcada como leída');
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleEliminar = async (notificacionId) => {
    try {
      await NotificacionService.eliminar(notificacionId);
      const notificacionEliminada = notificaciones.find(n => n.id === notificacionId);
      setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      
      if (notificacionEliminada && !notificacionEliminada.leida) {
        setStats(prev => ({ ...prev, noLeidas: Math.max(0, prev.noLeidas - 1) }));
      }
      
      // Recargar notificaciones para asegurar sincronización
      await cargarNotificaciones();
      console.log('Notificación eliminada');
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    try {
      await NotificacionService.marcarTodasComoLeidas();
      setNotificaciones(prev => 
        prev.map(n => ({ 
          ...n, 
          leida: 1, 
          fecha_leida: new Date().toISOString() 
        }))
      );
      setStats(prev => ({ ...prev, noLeidas: 0 }));
      // Recargar notificaciones para asegurar sincronización
      await cargarNotificaciones();
      console.log('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Notificaciones
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={cargarNotificaciones}
              disabled={loading}
            >
              Actualizar
            </Button>
            {stats.noLeidas > 0 && (
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={handleMarcarTodasComoLeidas}
              >
                Marcar todas como leídas
              </Button>
            )}
          </Box>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Notificaciones
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  No Leídas
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.noLeidas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Leídas
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.total - stats.noLeidas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterIcon />
            <Typography variant="h6">Filtros</Typography>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filtros.tipo}
                label="Tipo"
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="cita_recordatorio">Recordatorios</MenuItem>
                <MenuItem value="medicion_pendiente">Mediciones</MenuItem>
                <MenuItem value="cumpleanos">Cumpleaños</MenuItem>
                <MenuItem value="sistema">Sistema</MenuItem>
                <MenuItem value="alerta">Alertas</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtros.leidas}
                label="Estado"
                onChange={(e) => handleFiltroChange('leidas', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="false">No leídas</MenuItem>
                <MenuItem value="true">Leídas</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Lista de notificaciones */}
        <Paper>
          {loading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="30%" />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : notificaciones.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No tienes notificaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Las notificaciones aparecerán aquí cuando tengas nuevas alertas o recordatorios
              </Typography>
            </Box>
          ) : (
            <List>
              {notificaciones.map((notificacion, index) => (
                <ListItem
                  key={notificacion.id}
                  sx={{
                    backgroundColor: notificacion.leida ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    borderBottom: index < notificaciones.length - 1 ? 1 : 0,
                    borderColor: 'divider'
                  }}
                >
                  <ListItemIcon>
                    <Box sx={{ fontSize: '1.5rem' }}>
                      {NotificacionService.getIconoPorTipo(notificacion.tipo)}
                    </Box>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: !notificacion.leida ? 'bold' : 'normal' }}>
                          {notificacion.titulo}
                        </Typography>
                        {!notificacion.leida && (
                          <Chip label="Nueva" color="primary" size="small" />
                        )}
                        <Chip 
                          label={notificacion.tipo.replace('_', ' ')} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            textTransform: 'capitalize',
                            color: NotificacionService.getColorPorTipo ? NotificacionService.getColorPorTipo(notificacion.tipo) : 'primary.main'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {notificacion.mensaje}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {NotificacionService.formatearFecha(notificacion.fecha_programada || notificacion.fecha_creacion)}
                        </Typography>
                        {notificacion.paciente_nombre && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Paciente: {notificacion.paciente_nombre} {notificacion.paciente_apellido}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {!notificacion.leida && (
                      <Button
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={() => handleMarcarComoLeida(notificacion.id)}
                      >
                        Marcar leída
                      </Button>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => handleEliminar(notificacion.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Paginación */}
        {Math.ceil(stats.total / pagination.limit) > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(stats.total / pagination.limit)}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default NotificacionesPage;
