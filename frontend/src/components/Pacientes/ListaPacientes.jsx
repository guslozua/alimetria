import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import CustomButton from '../Common/CustomButton';
import FormularioPaciente from './FormularioPaciente';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { PageTitle, SectionTitle, MetaText, InfoText } from '../Common/TypographyHelpers';
import PacienteService from '../../services/pacienteService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatearSexo, getSexoColor } from '../../utils/formatters';

const ListaPacientes = () => {
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();
  
  // Verificación temporal para admin
  const canReadPacientes = hasPermission('pacientes', 'leer') || user?.rol_nombre === 'administrador';
  const canCreatePacientes = hasPermission('pacientes', 'crear') || user?.rol_nombre === 'administrador';
  const canUpdatePacientes = hasPermission('pacientes', 'actualizar') || user?.rol_nombre === 'administrador';
  const canDeletePacientes = hasPermission('pacientes', 'eliminar') || user?.rol_nombre === 'administrador';
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    sexo: '',
    edad_min: '',
    edad_max: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    paciente: null
  });
  const [formularioDialog, setFormularioDialog] = useState({
    open: false,
    paciente: null
  });

  // Cargar pacientes
  const cargarPacientes = async () => {
    // Verificar permisos antes de cargar
    if (!canReadPacientes) {
      setError('No tienes permisos para ver pacientes');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page + 1,
        limit: pagination.limit,
        search: searchTerm,
        ...filtros
      };

      // Limpiar filtros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await PacienteService.getAll(params);
      
      // PacienteService.getAll() ya devuelve response.data, no response completo
      setPacientes(response.pacientes);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pacientes al montar el componente y cuando cambien los filtros
  useEffect(() => {
    cargarPacientes();
  }, [pagination.page, pagination.limit, searchTerm, filtros]);

  // Manejar búsqueda
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Manejar cambio de filtros
  const handleFiltroChange = (field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltros({
      sexo: '',
      edad_min: '',
      edad_max: ''
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Manejar paginación
  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  // Eliminar paciente
  const handleDelete = async () => {
    if (!deleteDialog.paciente || !deleteDialog.paciente.id) {
      console.error('No hay paciente seleccionado para eliminar');
      setDeleteDialog({ open: false, paciente: null });
      return;
    }

    try {
      await PacienteService.delete(deleteDialog.paciente.id);
      setDeleteDialog({ open: false, paciente: null });
      cargarPacientes(); // Recargar lista
    } catch (error) {
      setError(error.message);
    }
  };

  // Abrir formulario para nuevo paciente
  const handleNuevoPaciente = () => {
    setFormularioDialog({ open: true, paciente: null });
  };

  // Abrir formulario para editar paciente
  const handleEditarPaciente = async (pacienteResumen) => {
    try {
      console.log('Obteniendo datos completos del paciente ID:', pacienteResumen.id);
      
      // Obtener datos completos del paciente desde el backend
      const response = await PacienteService.getById(pacienteResumen.id);
      
      console.log('Respuesta completa del servicio:', response);
      console.log('response.data:', response.data);
      console.log('response.paciente:', response.paciente);
      
      // Determinar la estructura correcta de datos
      const pacienteCompleto = response.paciente || response.data || response;
      
      console.log('Paciente final a enviar al formulario:', pacienteCompleto);
      
      setFormularioDialog({ 
        open: true, 
        paciente: pacienteCompleto
      });
    } catch (error) {
      console.error('Error obteniendo datos del paciente:', error);
      setError('Error al cargar los datos del paciente para edición');
    }
  };

  // Cerrar formulario
  const handleCerrarFormulario = () => {
    setFormularioDialog({ open: false, paciente: null });
  };

  // Manejar éxito del formulario
  const handleExitoFormulario = (pacienteActualizado) => {
    console.log('ListaPacientes - Callback onSuccess llamado con:', pacienteActualizado);
    setFormularioDialog({ open: false, paciente: null });
    cargarPacientes(); // Recargar la lista
  };

  // Ver detalle del paciente
  const handleVerDetalle = (paciente) => {
    navigate(`/pacientes/${paciente.id}`);
  };

  // Formatear edad
  const formatearEdad = (edad) => {
    return edad ? `${edad} años` : 'N/A';
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleDateString() : 'N/A';
  };

  return (
    <Box>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Gestión de Pacientes
            </Typography>
            <Box>
              <IconButton onClick={cargarPacientes} disabled={loading}>
                <RefreshIcon />
              </IconButton>
              {canCreatePacientes && (
                <CustomButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ ml: 1 }}
                  onClick={handleNuevoPaciente}
                >
                  Nuevo Paciente
                </CustomButton>
              )}
            </Box>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Filtros */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar pacientes"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Nombre, apellido o email..."
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sexo</InputLabel>
                <Select
                  value={filtros.sexo}
                  label="Sexo"
                  onChange={(e) => handleFiltroChange('sexo', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Femenino</MenuItem>
                  <MenuItem value="O">Otro/No binario</MenuItem>
                  <MenuItem value="N">Prefiero no especificar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Edad mínima"
                type="number"
                value={filtros.edad_min}
                onChange={(e) => handleFiltroChange('edad_min', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Edad máxima"
                type="number"
                value={filtros.edad_max}
                onChange={(e) => handleFiltroChange('edad_max', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <CustomButton
                fullWidth
                variant="outlined"
                onClick={limpiarFiltros}
                sx={{ height: '56px' }}
              >
                Limpiar
              </CustomButton>
            </Grid>
          </Grid>

          {/* Tabla de pacientes */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Paciente</TableCell>
                      <TableCell>Sexo</TableCell>
                      <TableCell>Edad</TableCell>
                      <TableCell>Contacto</TableCell>
                      <TableCell>Última Medición</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pacientes.map((paciente) => (
                      <TableRow key={paciente.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography 
                                variant="subtitle2" 
                                component="button"
                                sx={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  color: 'primary.main',
                                  cursor: 'pointer',
                                  textDecoration: 'none',
                                  fontSize: 'inherit',
                                  fontWeight: 'inherit',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                                onClick={() => handleVerDetalle(paciente)}
                              >
                                {paciente.nombre} {paciente.apellido}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                ID: {paciente.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={formatearSexo(paciente.sexo)}
                            color={getSexoColor(paciente.sexo)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatearEdad(paciente.edad)}</TableCell>
                        <TableCell>
                          <Box>
                            {paciente.email && (
                              <Typography variant="body2">
                                {paciente.email}
                              </Typography>
                            )}
                            {paciente.telefono && (
                              <Typography variant="body2" color="textSecondary">
                                {paciente.telefono}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {paciente.ultima_medicion_fecha ? (
                            <Box>
                              <Typography variant="body2">
                                {formatearFecha(paciente.ultima_medicion_fecha)}
                              </Typography>
                              {paciente.ultimo_peso && (
                                <Typography variant="body2" color="textSecondary">
                                  {paciente.ultimo_peso} kg
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Sin mediciones
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            {/* Botón Ver siempre visible */}
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleVerDetalle(paciente)}
                              title="Ver detalle del paciente"
                            >
                              <VisibilityIcon />
                            </IconButton>
                            
                            {/* Botón Editar con permisos */}
                            {canUpdatePacientes && (
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleEditarPaciente(paciente)}
                                title="Editar paciente"
                              >
                                <EditIcon />
                              </IconButton>
                            )}
                            
                            {/* Botón Eliminar con permisos */}
                            {canDeletePacientes && (
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => setDeleteDialog({ open: true, paciente })}
                                title="Eliminar paciente"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              <TablePagination
                component="div"
                count={pagination.total}
                page={pagination.page}
                onPageChange={handleChangePage}
                rowsPerPage={pagination.limit}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación para eliminar */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, paciente: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar al paciente{' '}
          <strong>
            {deleteDialog.paciente?.nombre} {deleteDialog.paciente?.apellido}
          </strong>?
          Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <CustomButton 
            onClick={() => setDeleteDialog({ open: false, paciente: null })}
          >
            Cancelar
          </CustomButton>
          <CustomButton 
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Eliminar
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Formulario de Paciente */}
      <FormularioPaciente
        open={formularioDialog.open}
        onClose={handleCerrarFormulario}
        onSuccess={handleExitoFormulario}
        paciente={formularioDialog.paciente}
      />
    </Box>
  );
};

export default ListaPacientes;
