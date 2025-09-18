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
  Grid,
  Avatar,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  TablePagination,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  LocalHospital as HospitalIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Clear as ClearIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ObraSocialService from '../../services/obraSocialService';

const GestionObrasSociales = () => {
  const [obrasSociales, setObrasSociales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [obraSocialSeleccionada, setObraSocialSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    contacto_telefono: '',
    contacto_email: ''
  });
  const [errors, setErrors] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [obraSocialMenu, setObraSocialMenu] = useState(null);
  const [filtros, setFiltros] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  const [totalItems, setTotalItems] = useState(0);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    conPacientes: 0,
    sinPacientes: 0,
    pacientesParticulares: 0,
    totalPacientes: 0
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    cargarObrasSociales();
    cargarEstadisticasGenerales();
  }, [filtros]);

  const cargarEstadisticasGenerales = async () => {
    try {
      console.log('🔄 Cargando estadísticas globales...');
      // Cargar estadísticas globales desde el nuevo endpoint
      const response = await ObraSocialService.getEstadisticasGlobales();
      
      console.log('📊 Response completa de estadísticas:', response);
      
      // El servicio ya devuelve response.data, por lo que la estructura es directa
      if (response.obras_sociales && response.pacientes) {
        console.log('✅ Datos de estadísticas encontrados:', response);
        const { obras_sociales, pacientes } = response;
        const stats = {
          total: obras_sociales.total,
          conPacientes: obras_sociales.con_pacientes,
          sinPacientes: obras_sociales.sin_pacientes,
          pacientesParticulares: pacientes.particulares,
          totalPacientes: pacientes.total,
          porcentajeParticulares: pacientes.porcentaje_particulares
        };
        console.log('📈 Estadísticas procesadas para estado:', stats);
        setEstadisticas(stats);
      } else {
        console.log('❌ Response no tiene la estructura esperada:', response);
      }
    } catch (error) {
      console.error('Error cargando estadísticas generales:', error);
      // Fallback a estadísticas básicas si falla el endpoint nuevo
      try {
        const response = await ObraSocialService.getAll({ simple: 'true' });
        if (response.success) {
          const todasLasObrasSociales = response.data.obrasSociales || [];
          const stats = {
            total: todasLasObrasSociales.length,
            conPacientes: todasLasObrasSociales.filter(os => (os.pacientes_count || 0) > 0).length,
            sinPacientes: todasLasObrasSociales.filter(os => (os.pacientes_count || 0) === 0).length,
            pacientesParticulares: 0, // No disponible en fallback
            totalPacientes: 0,
            porcentajeParticulares: 0
          };
          setEstadisticas(stats);
        }
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
    }
  };

  const cargarObrasSociales = async () => {
    try {
      setLoading(true);
      const params = {
        page: filtros.page,
        limit: filtros.limit,
        ...(filtros.search && { search: filtros.search })
      };
      
      console.log('🏥 Cargando obras sociales con parámetros:', params);
      
      const response = await ObraSocialService.getAll(params);
      
      console.log('📊 Respuesta completa del servicio:', response);
      
      // La respuesta ya viene procesada por api.js
      if (response.success) {
        console.log('📋 Estructura con success detectada');
        const obrasSocialesData = response.data.obrasSociales || [];
        console.log('🏥 Obras sociales extraídas:', obrasSocialesData);
        
        setObrasSociales(obrasSocialesData);
        setTotalItems(response.data.pagination?.total || 0);
        
        // NO actualizar estadísticas aquí, se cargan por separado
      } else if (response.obrasSociales) {
        // Estructura alternativa directa
        console.log('📋 Estructura directa detectada');
        const obrasSocialesData = response.obrasSociales || [];
        console.log('🏥 Obras sociales extraídas:', obrasSocialesData);
        
        setObrasSociales(obrasSocialesData);
        setTotalItems(response.pagination?.total || 0);
        
        // NO actualizar estadísticas aquí, se cargan por separado
      } else {
        console.error('❌ Estructura de respuesta no reconocida:', response);
      }
    } catch (error) {
      console.error('❌ Error cargando obras sociales:', error);
      enqueueSnackbar('Error cargando obras sociales', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const abrirDialog = (obraSocial = null) => {
    if (obraSocial) {
      setObraSocialSeleccionada(obraSocial);
      setFormData({
        nombre: obraSocial.nombre || '',
        codigo: obraSocial.codigo || '',
        descripcion: obraSocial.descripcion || '',
        contacto_telefono: obraSocial.contacto_telefono || '',
        contacto_email: obraSocial.contacto_email || ''
      });
    } else {
      setObraSocialSeleccionada(null);
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        contacto_telefono: '',
        contacto_email: ''
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setObraSocialSeleccionada(null);
    setFormData({
      nombre: '',
      codigo: '',
      descripcion: '',
      contacto_telefono: '',
      contacto_email: ''
    });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!formData.codigo.trim()) {
      nuevosErrores.codigo = 'El código es obligatorio';
    }

    if (formData.contacto_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacto_email)) {
      nuevosErrores.contacto_email = 'El formato del email no es válido';
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
        descripcion: formData.descripcion || null,
        contacto_telefono: formData.contacto_telefono || null,
        contacto_email: formData.contacto_email || null
      };

      if (obraSocialSeleccionada) {
        await ObraSocialService.update(obraSocialSeleccionada.id, datosParaEnviar);
        enqueueSnackbar('Obra social actualizada exitosamente', { variant: 'success' });
      } else {
        await ObraSocialService.create(datosParaEnviar);
        enqueueSnackbar('Obra social creada exitosamente', { variant: 'success' });
      }

      cerrarDialog();
      cargarObrasSociales();
    } catch (error) {
      console.error('Error guardando obra social:', error);
      enqueueSnackbar(error.message || 'Error guardando obra social', { variant: 'error' });
    }
  };

  const handleEliminar = async (obraSocial) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la obra social "${obraSocial.nombre}"?`)) {
      try {
        await ObraSocialService.delete(obraSocial.id);
        enqueueSnackbar('Obra social eliminada exitosamente', { variant: 'success' });
        cargarObrasSociales();
      } catch (error) {
        console.error('Error eliminando obra social:', error);
        enqueueSnackbar(error.message || 'Error eliminando obra social', { variant: 'error' });
      }
    }
  };

  const handleMenuClick = (event, obraSocial) => {
    setAnchorEl(event.currentTarget);
    setObraSocialMenu(obraSocial);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setObraSocialMenu(null);
  };

  const handleBusqueda = (value) => {
    setFiltros(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const limpiarBusqueda = () => {
    setFiltros(prev => ({
      ...prev,
      search: '',
      page: 1
    }));
  };

  const handlePageChange = (event, newPage) => {
    setFiltros(prev => ({
      ...prev,
      page: newPage + 1
    }));
  };

  const handleRowsPerPageChange = (event) => {
    setFiltros(prev => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1
    }));
  };

  if (loading && obrasSociales.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Gestión de Obras Sociales
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Administra las obras sociales del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => abrirDialog()}
        >
          Nueva Obra Social
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <HospitalIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {estadisticas.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Obras Sociales
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
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {(estadisticas.totalPacientes || 0) - (estadisticas.pacientesParticulares || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pacientes con Obra Social
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
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {estadisticas.pacientesParticulares || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pacientes Particulares
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
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {estadisticas.porcentajeParticulares || 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    % Particulares
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar obras sociales por nombre, código..."
            value={filtros.search}
            onChange={(e) => handleBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filtros.search && (
                <InputAdornment position="end">
                  <IconButton onClick={limpiarBusqueda} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Obra Social</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Pacientes</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : (
                  obrasSociales.map((obraSocial) => (
                    <TableRow key={obraSocial.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {obraSocial.nombre}
                          </Typography>
                          {obraSocial.descripcion && (
                            <Typography variant="body2" color="textSecondary">
                              {obraSocial.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={obraSocial.codigo}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          {obraSocial.contacto_telefono && (
                            <Typography variant="body2">
                              📞 {obraSocial.contacto_telefono}
                            </Typography>
                          )}
                          {obraSocial.contacto_email && (
                            <Typography variant="body2" color="textSecondary">
                              ✉️ {obraSocial.contacto_email}
                            </Typography>
                          )}
                          {!obraSocial.contacto_telefono && !obraSocial.contacto_email && (
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
                            {obraSocial.pacientes_count || 0} pacientes
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Más opciones">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, obraSocial)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!loading && obrasSociales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box py={4}>
                        <Typography variant="body1" color="textSecondary">
                          {filtros.search 
                            ? 'No se encontraron obras sociales con ese criterio' 
                            : 'No hay obras sociales registradas'
                          }
                        </Typography>
                        {!filtros.search && (
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => abrirDialog()}
                            sx={{ mt: 2 }}
                          >
                            Crear primera obra social
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalItems > 0 && (
            <TablePagination
              component="div"
              count={totalItems}
              page={filtros.page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={filtros.limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          abrirDialog(obraSocialMenu);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleEliminar(obraSocialMenu);
            handleMenuClose();
          }}
          disabled={(obraSocialMenu?.pacientes_count || 0) > 0}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {obraSocialSeleccionada ? 'Editar Obra Social' : 'Nueva Obra Social'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Nombre de la Obra Social"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Código"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value.toUpperCase())}
                  error={!!errors.codigo}
                  helperText={errors.codigo || 'Código único identificatorio'}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Información adicional sobre la obra social..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Información de Contacto
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono de Contacto"
                  value={formData.contacto_telefono}
                  onChange={(e) => handleInputChange('contacto_telefono', e.target.value)}
                  placeholder="Ej: (011) 4123-4567"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email de Contacto"
                  type="email"
                  value={formData.contacto_email}
                  onChange={(e) => handleInputChange('contacto_email', e.target.value)}
                  error={!!errors.contacto_email}
                  helperText={errors.contacto_email}
                  placeholder="contacto@obrasocial.com"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button onClick={handleGuardar} variant="contained">
            {obraSocialSeleccionada ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionObrasSociales;