import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import NotificacionService from '../../services/notificacionService';

const NotificacionDropdown = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const open = Boolean(anchorEl);

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await NotificacionService.getMisNotificaciones({
        limit: 10,
        offset: 0
      });
      
      if (response.success) {
        setNotificaciones(response.data.notificaciones || []);
        setNoLeidas(response.data.noLeidas || 0);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Contar notificaciones no leídas
  const contarNoLeidas = async () => {
    try {
      const response = await NotificacionService.contarNoLeidas();
      if (response.success) {
        setNoLeidas(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error contando notificaciones:', error);
    }
  };

  // Efectos
  useEffect(() => {
    if (!initialized) {
      contarNoLeidas();
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (open && !loading && notificaciones.length === 0) {
      cargarNotificaciones();
    }
  }, [open]);

  // Polling para actualizar contador cada 30 segundos
  useEffect(() => {
    const interval = setInterval(contarNoLeidas, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarcarComoLeida = async (notificacionId, event) => {
    event.stopPropagation();
    
    try {
      await NotificacionService.marcarComoLeida(notificacionId);
      
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === notificacionId 
            ? { ...n, leida: 1, fecha_leida: new Date().toISOString() }
            : n
        )
      );
      
      setNoLeidas(prev => Math.max(0, prev - 1));
      console.log('Notificación marcada como leída');
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    try {
      await NotificacionService.marcarTodasComoLeidas();
      
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => ({ 
          ...n, 
          leida: 1, 
          fecha_leida: new Date().toISOString() 
        }))
      );
      
      setNoLeidas(0);
      console.log('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  const handleEliminar = async (notificacionId, event) => {
    event.stopPropagation();
    
    try {
      await NotificacionService.eliminar(notificacionId);
      
      // Actualizar estado local
      const notificacionEliminada = notificaciones.find(n => n.id === notificacionId);
      setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      
      if (notificacionEliminada && !notificacionEliminada.leida) {
        setNoLeidas(prev => Math.max(0, prev - 1));
      }
      
      console.log('Notificación eliminada');
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton
          onClick={handleClick}
          sx={{ 
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Badge 
            badgeContent={noLeidas} 
            color="error"
            max={99}
            invisible={noLeidas === 0}
          >
            {noLeidas > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
            boxShadow: 3
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              Notificaciones
              {noLeidas > 0 && (
                <Chip 
                  label={noLeidas} 
                  size="small" 
                  color="error" 
                  sx={{ ml: 1, minWidth: 24, height: 20 }}
                />
              )}
            </Typography>
            
            {noLeidas > 0 && (
              <Tooltip title="Marcar todas como leídas">
                <IconButton 
                  size="small"
                  onClick={handleMarcarTodasComoLeidas}
                >
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Divider />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notificaciones.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {notificaciones.map((notificacion, index) => (
              <React.Fragment key={notificacion.id}>
                <ListItem
                  sx={{
                    backgroundColor: notificacion.leida ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: notificacion.leida 
                        ? 'rgba(0, 0, 0, 0.04)' 
                        : 'rgba(25, 118, 210, 0.12)'
                    },
                    cursor: 'pointer',
                    py: 1.5
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {NotificacionService.getIconoPorTipo(notificacion.tipo)}
                    </Box>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: !notificacion.leida ? 'bold' : 'normal' }}>
                          {notificacion.titulo}
                        </Typography>
                        {!notificacion.leida && (
                          <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notificacion.mensaje && notificacion.mensaje.length > 100 
                            ? `${notificacion.mensaje.substring(0, 100)}...` 
                            : notificacion.mensaje || 'Sin mensaje'
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {NotificacionService.formatearFecha(notificacion.fecha_programada || notificacion.fecha_creacion)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {!notificacion.leida && (
                      <Tooltip title="Marcar como leída">
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMarcarComoLeida(notificacion.id, e)}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Eliminar">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleEliminar(notificacion.id, e)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                
                {index < notificaciones.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {notificaciones.length > 0 && (
          <Box sx={{ p: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              fullWidth 
              size="small" 
              onClick={() => {
                handleClose();
                navigate('/notificaciones');
              }}
            >
              Ver todas las notificaciones
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificacionDropdown;
