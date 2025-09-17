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
  FormControlLabel,
  FormGroup,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { rolService } from '../../services/administracion';

const GestionRolesPermisos = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados principales
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('crear'); // 'crear', 'editar'
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: {},
    activo: true
  });
  
  // Definición de módulos y permisos disponibles
  const modulosPermisos = {
    usuarios: {
      nombre: 'Gestión de Usuarios',
      icon: PersonIcon,
      permisos: ['crear', 'leer', 'actualizar', 'eliminar']
    },
    pacientes: {
      nombre: 'Gestión de Pacientes',
      icon: GroupIcon,
      permisos: ['crear', 'leer', 'actualizar', 'eliminar']
    },
    mediciones: {
      nombre: 'Mediciones',
      icon: SecurityIcon,
      permisos: ['crear', 'leer', 'actualizar', 'eliminar']
    },
    reportes: {
      nombre: 'Reportes',
      icon: SecurityIcon,
      permisos: ['crear', 'leer', 'exportar']
    },
    citas: {
      nombre: 'Agenda de Citas',
      icon: SecurityIcon,
      permisos: ['crear', 'leer', 'actualizar', 'eliminar']
    },
    configuraciones: {
      nombre: 'Configuraciones',
      icon: AdminIcon,
      permisos: ['leer', 'actualizar']
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando roles desde API...');
      
      const response = await rolService.obtenerRoles(true);
      console.log('✅ Roles cargados:', response.data);
      
      setRoles(response.data || []);
    } catch (error) {
      console.error('❌ Error cargando roles:', error);
      enqueueSnackbar('Error cargando roles', { variant: 'error' });
      
      // Fallback a datos de ejemplo si falla la API
      const rolesEjemplo = [
        {
          id: 1,
          nombre: 'administrador',
          descripcion: 'Acceso completo al sistema',
          permisos: {
            usuarios: ['crear', 'leer', 'actualizar', 'eliminar'],
            pacientes: ['crear', 'leer', 'actualizar', 'eliminar'],
            mediciones: ['crear', 'leer', 'actualizar', 'eliminar'],
            reportes: ['crear', 'leer', 'exportar'],
            citas: ['crear', 'leer', 'actualizar', 'eliminar'],
            configuraciones: ['leer', 'actualizar']
          },
          activo: true,
          fecha_creacion: '2025-09-10',
          usuarios_count: 1
        },
        {
          id: 2,
          nombre: 'nutricionista',
          descripcion: 'Profesional nutricionista',
          permisos: {
            pacientes: ['crear', 'leer', 'actualizar'],
            mediciones: ['crear', 'leer', 'actualizar'],
            reportes: ['crear', 'leer', 'exportar'],
            citas: ['crear', 'leer', 'actualizar']
          },
          activo: true,
          fecha_creacion: '2025-09-10',
          usuarios_count: 1
        },
        {
          id: 3,
          nombre: 'secretario',
          descripcion: 'Personal administrativo',
          permisos: {
            pacientes: ['crear', 'leer'],
            citas: ['crear', 'leer', 'actualizar'],
            reportes: ['leer']
          },
          activo: true,
          fecha_creacion: '2025-09-10',
          usuarios_count: 0
        },
        {
          id: 4,
          nombre: 'paciente',
          descripcion: 'Paciente del consultorio',
          permisos: {
            perfil_propio: ['leer'],
            mediciones_propias: ['leer'],
            citas_propias: ['leer']
          },
          activo: true,
          fecha_creacion: '2025-09-10',
          usuarios_count: 0
        }
      ];
      
      console.log('📝 Usando datos de ejemplo como fallback');
      setRoles(rolesEjemplo);
    } finally {
      setLoading(false);
    }
  };

  const abrirDialog = (mode, rol = null) => {
    setDialogMode(mode);
    setRolSeleccionado(rol);
    
    if (mode === 'crear') {
      setFormData({
        nombre: '',
        descripcion: '',
        permisos: {},
        activo: true
      });
    } else if (mode === 'editar' && rol) {
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos || {},
        activo: rol.activo
      });
    }
    
    setDialogOpen(true);
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setRolSeleccionado(null);
    setFormData({
      nombre: '',
      descripcion: '',
      permisos: {},
      activo: true
    });
  };

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handlePermisoChange = (modulo, permiso, checked) => {
    setFormData(prev => {
      const nuevosPermisos = { ...prev.permisos };
      
      if (!nuevosPermisos[modulo]) {
        nuevosPermisos[modulo] = [];
      }
      
      if (checked) {
        if (!nuevosPermisos[modulo].includes(permiso)) {
          nuevosPermisos[modulo] = [...nuevosPermisos[modulo], permiso];
        }
      } else {
        nuevosPermisos[modulo] = nuevosPermisos[modulo].filter(p => p !== permiso);
        if (nuevosPermisos[modulo].length === 0) {
          delete nuevosPermisos[modulo];
        }
      }
      
      return {
        ...prev,
        permisos: nuevosPermisos
      };
    });
  };

  const guardarRol = async () => {
    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        enqueueSnackbar('El nombre del rol es obligatorio', { variant: 'error' });
        return;
      }
      
      if (!formData.descripcion.trim()) {
        enqueueSnackbar('La descripción del rol es obligatoria', { variant: 'error' });
        return;
      }

      // Llamada a la API
      if (dialogMode === 'crear') {
        console.log('🆕 Creando nuevo rol:', formData);
        await rolService.crearRol(formData);
        enqueueSnackbar('Rol creado exitosamente', { variant: 'success' });
      } else {
        console.log('📝 Actualizando rol:', rolSeleccionado.id, formData);
        await rolService.actualizarRol(rolSeleccionado.id, formData);
        enqueueSnackbar('Rol actualizado exitosamente', { variant: 'success' });
      }
      
      cerrarDialog();
      cargarRoles();
    } catch (error) {
      console.error('❌ Error guardando rol:', error);
      const mensaje = error.response?.data?.message || error.message || 'Error guardando rol';
      enqueueSnackbar(mensaje, { variant: 'error' });
    }
  };

  const toggleActivo = async (rol) => {
    try {
      // Verificar si el rol tiene usuarios asignados antes de desactivar
      if (rol.activo && rol.usuarios_count > 0) {
        enqueueSnackbar(
          `No se puede desactivar el rol "${rol.nombre}" porque tiene ${rol.usuarios_count} usuario(s) asignado(s)`,
          { variant: 'warning' }
        );
        return;
      }

      console.log(`🔄 Toggling rol ID ${rol.id}: ${rol.nombre}`);
      
      const response = await rolService.toggleRol(rol.id);
      
      enqueueSnackbar(
        response.message || `Rol ${rol.activo ? 'desactivado' : 'activado'} exitosamente`,
        { variant: 'success' }
      );
      
      cargarRoles();
    } catch (error) {
      console.error('❌ Error cambiando estado del rol:', error);
      const mensaje = error.response?.data?.message || error.message || 'Error cambiando estado del rol';
      enqueueSnackbar(mensaje, { variant: 'error' });
    }
  };

  const obtenerColorRol = (nombre) => {
    const colores = {
      administrador: 'error',
      nutricionista: 'primary',
      secretario: 'warning',
      paciente: 'success'
    };
    return colores[nombre] || 'default';
  };

  const obtenerIconoRol = (nombre) => {
    const iconos = {
      administrador: AdminIcon,
      nutricionista: SecurityIcon,
      secretario: PersonIcon,
      paciente: GroupIcon
    };
    const Icono = iconos[nombre] || LockIcon;
    return <Icono />;
  };

  const contarPermisos = (permisos) => {
    return Object.values(permisos || {}).reduce((total, modulo) => total + modulo.length, 0);
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
            Gestión de Roles y Permisos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los roles del sistema y sus permisos asociados
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => abrirDialog('crear')}
        >
          Nuevo Rol
        </Button>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {roles.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Roles Totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {roles.filter(r => r.activo).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Roles Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {roles.reduce((total, r) => total + r.usuarios_count, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios Asignados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {Object.keys(modulosPermisos).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Módulos Sistema
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de Roles */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rol</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Permisos</TableCell>
                  <TableCell align="center">Usuarios</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((rol) => (
                  <TableRow key={rol.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {obtenerIconoRol(rol.nombre)}
                        <Box>
                          <Typography variant="subtitle2">
                            {rol.nombre}
                          </Typography>
                          <Chip
                            label={rol.nombre}
                            size="small"
                            color={obtenerColorRol(rol.nombre)}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rol.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={rol.activo}
                        onChange={() => toggleActivo(rol)}
                        size="small"
                        disabled={rol.nombre === 'administrador'} // No permitir desactivar admin
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${contarPermisos(rol.permisos)} permisos`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={rol.usuarios_count}
                        size="small"
                        color={rol.usuarios_count > 0 ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar rol">
                        <IconButton
                          size="small"
                          onClick={() => abrirDialog('editar', rol)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar Rol */}
      <Dialog
        open={dialogOpen}
        onClose={cerrarDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'crear' ? 'Crear Nuevo Rol' : 'Editar Rol'}
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <Grid container spacing={3}>
              {/* Información básica */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Rol"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  margin="normal"
                  disabled={dialogMode === 'editar' && rolSeleccionado?.nombre === 'administrador'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo}
                      onChange={(e) => handleInputChange('activo', e.target.checked)}
                    />
                  }
                  label="Rol Activo"
                  sx={{ mt: 2 }}
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
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Permisos por módulo */}
            <Typography variant="h6" gutterBottom>
              Permisos por Módulo
            </Typography>
            
            {Object.entries(modulosPermisos).map(([modulo, config]) => {
              const IconoModulo = config.icon;
              return (
                <Accordion key={modulo} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconoModulo fontSize="small" />
                      <Typography variant="subtitle1">
                        {config.nombre}
                      </Typography>
                      <Chip
                        label={`${(formData.permisos[modulo] || []).length}/${config.permisos.length}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup row>
                      {config.permisos.map((permiso) => (
                        <FormControlLabel
                          key={`${modulo}-${permiso}`}
                          control={
                            <Checkbox
                              checked={(formData.permisos[modulo] || []).includes(permiso)}
                              onChange={(e) => handlePermisoChange(modulo, permiso, e.target.checked)}
                            />
                          }
                          label={permiso.charAt(0).toUpperCase() + permiso.slice(1)}
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialog} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button
            onClick={guardarRol}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {dialogMode === 'crear' ? 'Crear Rol' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionRolesPermisos;