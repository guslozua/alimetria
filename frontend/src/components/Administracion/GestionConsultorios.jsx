import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Visibility as ViewIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { consultorioService } from '../../services/administracion';

const GestionConsultorios = () => {
  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    activo: true
  });
  const [errors, setErrors] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [consultorioMenu, setConsultorioMenu] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    cargarConsultorios();
  }, []);

  const cargarConsultorios = async () => {
    try {
      setLoading(true);
      const response = await consultorioService.obtenerConsultorios({ activo: 'all' });
      setConsultorios(response.data || []);
    } catch (error) {
      console.error('Error cargando consultorios:', error);
      enqueueSnackbar('Error cargando consultorios', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (consultorio) => {
    try {
      await consultorioService.toggleConsultorio(consultorio.id);
      enqueueSnackbar(
        `Consultorio ${consultorio.activo ? 'desactivado' : 'activado'} exitosamente`,
        { variant: 'success' }
      );
      cargarConsultorios();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error cambiando estado del consultorio', { variant: 'error' });
    }
  };

  const abrirDialog = (consultorio = null) => {
    if (consultorio) {
      setConsultorioSeleccionado(consultorio);
      setFormData({
        nombre: consultorio.nombre || '',
        direccion: consultorio.direccion || '',
        telefono: consultorio.telefono || '',
        email: consultorio.email || '',
        activo: consultorio.activo
      });
    } else {
      setConsultorioSeleccionado(null);
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        activo: true
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setConsultorioSeleccionado(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      activo: true
    });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo modificado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'El formato del email no es válido';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      const datosParaEnviar = {
        ...formData,
        direccion: formData.direccion || null,
        telefono: formData.telefono || null,
        email: formData.email || null
      };

      if (consultorioSeleccionado) {
        await consultorioService.actualizarConsultorio(consultorioSeleccionado.id, datosParaEnviar);
        enqueueSnackbar('Consultorio actualizado exitosamente', { variant: 'success' });
      } else {
        await consultorioService.crearConsultorio(datosParaEnviar);
        enqueueSnackbar('Consultorio creado exitosamente', { variant: 'success' });
      }

      cerrarDialog();
      cargarConsultorios();
    } catch (error) {
      console.error('Error guardando consultorio:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error guardando consultorio', { variant: 'error' });
    }
  };

  const handleEliminar = async (consultorio) => {
    // Verificar si tiene usuarios asignados
    if (consultorio.total_usuarios > 0) {
      enqueueSnackbar(
        `No se puede eliminar el consultorio "${consultorio.nombre}" porque tiene ${consultorio.total_usuarios} usuario(s) asignado(s)`,
        { variant: 'warning' }
      );
      return;
    }

    // Confirmar eliminación
    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres eliminar el consultorio "${consultorio.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) {
      return;
    }

    try {
      // Como no hay ruta de eliminar, usamos toggle para desactivar permanentemente
      // Podrías implementar una ruta DELETE en el backend si prefieres eliminación real
      await consultorioService.toggleConsultorio(consultorio.id);
      enqueueSnackbar('Consultorio eliminado exitosamente', { variant: 'success' });
      cargarConsultorios();
    } catch (error) {
      console.error('Error eliminando consultorio:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error eliminando consultorio', { variant: 'error' });
    }
  };

  const handleMenuClick = (event, consultorio) => {
    setAnchorEl(event.currentTarget);
    setConsultorioMenu(consultorio);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setConsultorioMenu(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Gestión de Consultorios
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Administra los consultorios del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => abrirDialog()}
        >
          Nuevo Consultorio
        </Button>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {consultorios.filter(c => c.activo).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Consultorios Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {consultorios.filter(c => !c.activo).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Consultorios Inactivos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {consultorios.reduce((total, c) => total + (c.total_usuarios || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Usuarios
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de consultorios */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Consultorio</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Usuarios</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consultorios.map((consultorio) => (
                  <TableRow key={consultorio.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {consultorio.nombre}
                        </Typography>
                        {consultorio.direccion && (
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="textSecondary">
                              {consultorio.direccion}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {consultorio.telefono && (
                          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {consultorio.telefono}
                            </Typography>
                          </Box>
                        )}
                        {consultorio.email && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {consultorio.email}
                            </Typography>
                          </Box>
                        )}
                        {!consultorio.telefono && !consultorio.email && (
                          <Typography variant="body2" color="textSecondary">
                            Sin contacto
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {consultorio.total_usuarios || 0} usuarios
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={consultorio.activo ? 'Activo' : 'Inactivo'}
                        color={consultorio.activo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Más opciones">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, consultorio)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {consultorios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box py={4}>
                        <Typography variant="body1" color="textSecondary">
                          No hay consultorios registrados
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => abrirDialog()}
                          sx={{ mt: 2 }}
                        >
                          Crear primer consultorio
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          abrirDialog(consultorioMenu);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleEstado(consultorioMenu);
          handleMenuClose();
        }}>
          {consultorioMenu?.activo ? (
            <>
              <ToggleOffIcon fontSize="small" sx={{ mr: 1 }} />
              Desactivar
            </>
          ) : (
            <>
              <ToggleOnIcon fontSize="small" sx={{ mr: 1 }} />
              Activar
            </>
          )}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleEliminar(consultorioMenu);
            handleMenuClose();
          }}
          disabled={consultorioMenu?.total_usuarios > 0}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar consultorio */}
      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {consultorioSeleccionado ? 'Editar Consultorio' : 'Nuevo Consultorio'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del Consultorio"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                    checked={Boolean(formData.activo)}
                    onChange={(e) => handleInputChange('activo', e.target.checked)}
                    />
                  }
                  label="Consultorio activo"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button onClick={handleGuardar} variant="contained">
            {consultorioSeleccionado ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionConsultorios;
