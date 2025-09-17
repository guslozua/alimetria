import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { usuarioService, rolService, consultorioService } from '../../services/administracion';
import { useSnackbar } from 'notistack';

const GestionUsuarios = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    rol_id: '',
    consultorio_id: '',
    activo: 'all',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [estadisticas, setEstadisticas] = useState({});

  // Estado del diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('crear'); // 'crear', 'editar', 'ver'
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rol_id: '',
    consultorio_id: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos de administración...');
      
      const [usuariosRes, rolesRes, consultoriosRes, estadisticasRes] = await Promise.all([
        usuarioService.obtenerUsuarios(filtros).catch(err => {
          console.error('❌ Error cargando usuarios:', err);
          return { data: [], pagination: {} };
        }),
        rolService.obtenerRoles(false).catch(err => {
          console.error('❌ Error cargando roles:', err);
          return { data: [] };
        }),
        consultorioService.obtenerConsultorios({ activo: 'true' }).catch(err => {
          console.error('❌ Error cargando consultorios:', err);
          return { data: [] };
        }),
        usuarioService.obtenerEstadisticas().catch(err => {
          console.error('❌ Error cargando estadísticas:', err);
          return { data: { total: 0, activos: 0, inactivos: 0 } };
        })
      ]);
      
      console.log('✅ Datos cargados:', {
        usuarios: usuariosRes.data?.length || 0,
        roles: rolesRes.data?.length || 0,
        consultorios: consultoriosRes.data?.length || 0,
        estadisticas: estadisticasRes.data
      });
      
      setUsuarios(usuariosRes.data || []);
      setPagination(usuariosRes.pagination || {});
      setRoles(rolesRes.data || []);
      setConsultorios(consultoriosRes.data || []);
      setEstadisticas(estadisticasRes.data || {});
    } catch (error) {
      console.error('Error cargando datos:', error);
      enqueueSnackbar('Error cargando datos de usuarios', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      page: campo === 'page' ? valor : 1
    }));
  };

  const abrirDialog = (mode, usuario = null) => {
    setDialogMode(mode);
    setUsuarioSeleccionado(usuario);
    
    if (mode === 'crear') {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        rol_id: '',
        consultorio_id: ''
      });
    } else if ((mode === 'editar' || mode === 'ver') && usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        password: '',
        telefono: usuario.telefono || '',
        rol_id: usuario.rol_id || '',
        consultorio_id: usuario.consultorio_id || ''
      });
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setUsuarioSeleccionado(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
      rol_id: '',
      consultorio_id: ''
    });
    setFormErrors({});
  };

  const validarFormulario = () => {
    const errores = {};
    
    if (!formData.nombre) errores.nombre = 'El nombre es obligatorio';
    if (!formData.apellido) errores.apellido = 'El apellido es obligatorio';
    if (!formData.email) errores.email = 'El email es obligatorio';
    if (!formData.rol_id) errores.rol_id = 'El rol es obligatorio';
    
    // Validar contraseña solo al crear usuario
    if (dialogMode === 'crear' && !formData.password) {
      errores.password = 'La contraseña es obligatoria';
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errores.email = 'Formato de email inválido';
    }
    
    setFormErrors(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;
    
    try {
      let response;
      
      if (dialogMode === 'crear') {
        response = await usuarioService.crearUsuario(formData);
        enqueueSnackbar('Usuario creado exitosamente', { variant: 'success' });
      } else if (dialogMode === 'editar') {
        const { password, ...datosActualizacion } = formData;
        response = await usuarioService.actualizarUsuario(usuarioSeleccionado.id, datosActualizacion);
        enqueueSnackbar('Usuario actualizado exitosamente', { variant: 'success' });
      }
      
      cerrarDialog();
      cargarDatos();
    } catch (error) {
      console.error('Error al procesar usuario:', error);
      enqueueSnackbar(
        error.message || 'Error al procesar usuario',
        { variant: 'error' }
      );
    }
  };

  const toggleUsuario = async (usuario) => {
    try {
      await usuarioService.toggleUsuario(usuario.id);
      enqueueSnackbar(
        `Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`,
        { variant: 'success' }
      );
      cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      enqueueSnackbar(
        error.message || 'Error al cambiar estado del usuario',
        { variant: 'error' }
      );
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      try {
        await usuarioService.eliminarUsuario(usuario.id);
        enqueueSnackbar('Usuario eliminado exitosamente', { variant: 'success' });
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        enqueueSnackbar(
          error.message || 'Error al eliminar usuario',
          { variant: 'error' }
        );
      }
    }
  };

  const getRolNombre = (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    return rol ? rol.nombre : 'Sin rol';
  };

  const getConsultorioNombre = (consultorioId) => {
    const consultorio = consultorios.find(c => c.id === consultorioId);
    return consultorio ? consultorio.nombre : 'Sin consultorio';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con estadísticas */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Gestión de Usuarios
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Usuarios
                </Typography>
                <Typography variant="h4">
                  {estadisticas.total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Activos
                </Typography>
                <Typography variant="h4">
                  {estadisticas.activos || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Inactivos
                </Typography>
                <Typography variant="h4">
                  {estadisticas.inactivos || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Último Registro
                </Typography>
                <Typography variant="h6">
                  {new Date().toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                placeholder="Buscar usuarios"
                value={filtros.search}
                onChange={(e) => handleFiltroChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={filtros.rol_id}
                  onChange={(e) => handleFiltroChange('rol_id', e.target.value)}
                  label="Rol"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {roles.map(rol => (
                    <MenuItem key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Consultorio</InputLabel>
                <Select
                  value={filtros.consultorio_id}
                  onChange={(e) => handleFiltroChange('consultorio_id', e.target.value)}
                  label="Consultorio"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {consultorios.map(consultorio => (
                    <MenuItem key={consultorio.id} value={consultorio.id}>
                      {consultorio.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.activo}
                  onChange={(e) => handleFiltroChange('activo', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="true">Activos</MenuItem>
                  <MenuItem value="false">Inactivos</MenuItem>
                  <MenuItem value="all">Todos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => cargarDatos()}
                fullWidth
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Lista de Usuarios
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => abrirDialog('crear')}
            >
              NUEVO USUARIO
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Consultorio</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Último Acceso</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {usuario.nombre} {usuario.apellido}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{usuario.telefono || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.rol_nombre} 
                        color={
                          usuario.rol_nombre === 'administrador' ? 'error' :
                          usuario.rol_nombre === 'nutricionista' ? 'primary' :
                          usuario.rol_nombre === 'secretario' ? 'warning' : 'info'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{usuario.consultorio_nombre || 'Sin consultorio'}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={usuario.activo ? 'Activo' : 'Inactivo'}
                        color={usuario.activo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {usuario.ultimo_acceso ? 
                        new Date(usuario.ultimo_acceso).toLocaleDateString() : 
                        'Nunca'
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small" 
                          onClick={() => abrirDialog('ver', usuario)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          onClick={() => abrirDialog('editar', usuario)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={usuario.activo ? 'Desactivar' : 'Activar'}>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleUsuario(usuario)}
                          color={usuario.activo ? 'error' : 'success'}
                        >
                          {usuario.activo ? <LockOpenIcon /> : <LockIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          size="small" 
                          onClick={() => eliminarUsuario(usuario)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button 
                disabled={pagination.page <= 1}
                onClick={() => handleFiltroChange('page', pagination.page - 1)}
              >
                Anterior
              </Button>
              <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                Página {pagination.page} de {pagination.pages}
              </Typography>
              <Button 
                disabled={pagination.page >= pagination.pages}
                onClick={() => handleFiltroChange('page', pagination.page + 1)}
              >
                Siguiente
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar usuario */}
      <Dialog 
        open={dialogOpen} 
        onClose={cerrarDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'crear' ? 'Nuevo Usuario' : 
           dialogMode === 'editar' ? 'Editar Usuario' : 'Detalles del Usuario'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
                disabled={dialogMode === 'ver'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={formData.apellido}
                onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                error={!!formErrors.apellido}
                helperText={formErrors.apellido}
                disabled={dialogMode === 'ver'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={dialogMode === 'ver'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                disabled={dialogMode === 'ver'}
              />
            </Grid>
            {dialogMode === 'crear' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.rol_id}>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.rol_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, rol_id: e.target.value }))}
                  label="Rol"
                  disabled={dialogMode === 'ver'}
                >
                  {roles.map(rol => (
                    <MenuItem key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.rol_id && (
                  <Typography color="error" variant="caption">
                    {formErrors.rol_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Consultorio</InputLabel>
                <Select
                  value={formData.consultorio_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, consultorio_id: e.target.value }))}
                  label="Consultorio"
                  disabled={dialogMode === 'ver'}
                >
                  <MenuItem value="">Sin consultorio</MenuItem>
                  {consultorios.map(consultorio => (
                    <MenuItem key={consultorio.id} value={consultorio.id}>
                      {consultorio.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialog}>
            Cancelar
          </Button>
          {dialogMode !== 'ver' && (
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'crear' ? 'Crear' : 'Guardar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionUsuarios;
