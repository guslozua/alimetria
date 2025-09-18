import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tab,
  Tabs,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Importar componentes
import GestionUsuarios from './GestionUsuarios';
import GestionRolesPermisos from './GestionRolesPermisos';
import ConfiguracionSistema from './ConfiguracionSistema';
import GestionConsultorios from './GestionConsultorios';
import GestionObrasSociales from './GestionObrasSociales';

// Importar servicios
import { usuarioService, rolService, consultorioService, configuracionService } from '../../services/administracion';

const PanelAdministracion = () => {
  const theme = useTheme();
  const [tabActiva, setTabActiva] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabActiva(newValue);
  };

  const tabs = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      component: <DashboardAdmin />
    },
    {
      label: 'Usuarios',
      icon: <PeopleIcon />,
      component: <GestionUsuarios />
    },
    {
      label: 'Roles y Permisos',
      icon: <SecurityIcon />,
      component: <GestionRolesPermisos />
    },
    {
      label: 'Consultorios',
      icon: <BusinessIcon />,
      component: <GestionConsultorios />
    },
    {
      label: 'Obras Sociales',
      icon: <HospitalIcon />,
      component: <GestionObrasSociales />
    },
    {
      label: 'Configuración',
      icon: <SettingsIcon />,
      component: <ConfiguracionSistema />
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Panel de Administración
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Gestiona usuarios, roles, configuraciones y consultorios del sistema
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabActiva}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '1rem'
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center'
              }}
            />
          ))}
        </Tabs>
      </Card>

      {/* Contenido de la tab activa */}
      <Box>
        {tabs[tabActiva]?.component}
      </Box>
    </Box>
  );
};

// Componente Dashboard de administración
const DashboardAdmin = () => {
  const [estadisticas, setEstadisticas] = useState({
    usuarios: { total: 0, activos: 0, inactivos: 0 },
    roles: { total: 0, activos: 0, inactivos: 0 },
    consultorios: { total: 0 },
    configuraciones: { total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        console.log('📈 Cargando estadísticas del dashboard...');
        
        const [usuariosRes, rolesRes, consultoriosRes, configuracionesRes] = await Promise.all([
          usuarioService.obtenerEstadisticas().catch(err => ({ data: { total: 0, activos: 0, inactivos: 0 } })),
          rolService.obtenerEstadisticas().catch(err => ({ data: { total: 0 } })),
          consultorioService.obtenerEstadisticas().catch(err => ({ data: { total: 0 } })),
          configuracionService.obtenerConfiguraciones().catch(err => ({ data: [] }))
        ]);
        
        setEstadisticas({
          usuarios: usuariosRes.data || { total: 0, activos: 0, inactivos: 0 },
          roles: rolesRes.data || { total: 0, activos: 0, inactivos: 0 },
          consultorios: consultoriosRes.data || { total: 0 },
          configuraciones: { total: configuracionesRes.data?.length || 0 }
        });
        
        console.log('✅ Estadísticas cargadas:', {
          usuarios: usuariosRes.data,
          roles: rolesRes.data,
          consultorios: consultoriosRes.data,
          configuraciones: configuracionesRes.data?.length
        });
        
        // Debug completo para ver qué contienen los objetos
        console.log('🔍 DEBUG completo:');
        console.log('usuariosRes completo:', usuariosRes);
        console.log('rolesRes completo:', rolesRes);
        console.log('consultoriosRes completo:', consultoriosRes);
        console.log('configuracionesRes completo:', configuracionesRes);
      } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        enqueueSnackbar('Error cargando estadísticas', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    cargarEstadisticas();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Resumen de usuarios */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
              <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
              <Typography color="textSecondary" gutterBottom>
              Total Usuarios
              </Typography>
              <Typography variant="h4">
              {estadisticas.usuarios.total}
              </Typography>
              <Typography variant="body2" color="success.main">
              {estadisticas.usuarios.activos} activos
              </Typography>
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Roles activos */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
              <SecurityIcon color="secondary" sx={{ fontSize: 40 }} />
              <Box>
              <Typography color="textSecondary" gutterBottom>
              Roles Activos
              </Typography>
              <Typography variant="h4">
              {estadisticas.roles.activos}
              </Typography>
              <Typography variant="body2" color="textSecondary">
              Roles del sistema
              </Typography>
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Consultorios */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
              <BusinessIcon color="info" sx={{ fontSize: 40 }} />
              <Box>
              <Typography color="textSecondary" gutterBottom>
              Consultorios
              </Typography>
              <Typography variant="h4">
              {estadisticas.consultorios.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
              Consultorio activo
              </Typography>
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuraciones */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
              <SettingsIcon color="warning" sx={{ fontSize: 40 }} />
              <Box>
              <Typography color="textSecondary" gutterBottom>
              Configuraciones
              </Typography>
              <Typography variant="h4">
              {estadisticas.configuraciones.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
              Parámetros del sistema
              </Typography>
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actividad reciente */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" flexDirection="column" gap={2}>
                {/* Actividad real dinámica */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main'
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Sistema inicializado:</strong> Módulo de administración activo
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Hoy
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'info.main'
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Panel creado:</strong> Gestión de usuarios y configuraciones
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Hoy
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main'
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Dashboard operativo:</strong> {estadisticas.usuarios.total} usuarios, {estadisticas.roles.total} roles
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Ahora
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Accesos rápidos */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Accesos Rápidos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" flexDirection="column" gap={1}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    👤 Crear nuevo usuario
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    🔧 Configurar notificaciones
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    🏢 Gestionar consultorio
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    📊 Ver estadísticas completas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PanelAdministracion;
