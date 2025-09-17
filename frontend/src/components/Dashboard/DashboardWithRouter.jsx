import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import CustomButton from '../Common/CustomButton';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Importar componentes
import ListaPacientes from '../Pacientes/ListaPacientes';
import DetallePaciente from '../Pacientes/DetallePaciente';
import FormularioPaciente from '../Pacientes/FormularioPaciente';

// Importar páginas de mediciones
import NuevaMedicionPage from '../../pages/NuevaMedicionPage';
import EditarMedicionPage from '../../pages/EditarMedicionPage';
import VerMedicionPage from '../../pages/VerMedicionPage';
import EvolucionMedicionesPage from '../../pages/EvolucionMedicionesPage';
import MedicionesHomePage from '../../pages/MedicionesHomePage';
import MedicionInBodyPage from '../../pages/MedicionInBodyPage';

// Importar página de reportes
import Reportes from '../../pages/Reportes';

// Importar componentes de agenda
import { AgendaPage } from '../Agenda';

// Importar página de notificaciones
import NotificacionesPage from '../../pages/NotificacionesPage';

// Importar componente de notificaciones
import NotificacionDropdown from '../Notificaciones/NotificacionDropdown';

// Importar panel de administración
import PanelAdministracion from '../Administracion/PanelAdministracion';



const Dashboard = () => {
  const { user, logout, isAdmin, isNutricionista, isSecretario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      available: true
    },
    {
      title: 'Pacientes',
      icon: <PeopleIcon />,
      path: '/pacientes',
      available: true
    },
    {
      title: 'Mediciones',
      icon: <AssessmentIcon />,
      path: '/mediciones',
      available: isAdmin() || isNutricionista()
    },
    {
      title: 'Reportes',
      icon: <AssessmentIcon />,
      path: '/reportes',
      available: isAdmin() || isNutricionista()
    },
    {
      title: 'Agenda',
      icon: <ScheduleIcon />,
      path: '/agenda',
      available: isAdmin() || isNutricionista() || isSecretario()
    },
    {
      title: 'Administración',
      icon: <SettingsIcon />,
      path: '/administracion',
      available: isAdmin()
    }
  ];

  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case 'administrador': return 'error';
      case 'nutricionista': return 'primary';
      case 'secretario': return 'warning';
      case 'paciente': return 'info';
      default: return 'default';
    }
  };

  const getCurrentPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Panel Principal';
    if (path.startsWith('/pacientes')) return 'Pacientes';
    if (path.startsWith('/mediciones')) return 'Mediciones';
    if (path.startsWith('/reportes')) return 'Reportes';
    if (path.startsWith('/agenda')) return 'Agenda';
    if (path.startsWith('/administracion')) return 'Administración';
    if (path.startsWith('/notificaciones')) return 'Notificaciones';
    
    return 'Alimetria';
  };

  // Página de inicio del dashboard
  const DashboardHome = () => (
    <>
      {/* Bienvenida */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido, {user?.nombre}
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom color="text.secondary">
          {user?.rol_nombre === 'administrador' && 'Panel de Administración'}
          {user?.rol_nombre === 'nutricionista' && 'Panel del Nutricionista'}
          {user?.rol_nombre === 'secretario' && 'Panel Administrativo'}
          {user?.rol_nombre === 'paciente' && 'Mi Portal de Paciente'}
        </Typography>
      </Box>

      {/* Estado del Sistema */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#e8f5e8' }}>
        <Typography variant="h6" gutterBottom>
          Sistema de Autenticación Activo
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">Sistema</Typography>
              <Chip label="Operativo" color="success" size="small" />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">Autenticación</Typography>
              <Chip label="JWT Activo" color="success" size="small" />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">Sesión</Typography>
              <Chip label="Autenticado" color="success" size="small" />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">Rol</Typography>
              <Chip 
                label={user?.rol_nombre} 
                color={getRoleBadgeColor(user?.rol_nombre)} 
                size="small" 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Módulos del Sistema como Cards Clickeables */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Módulos Disponibles
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {menuItems.filter(item => item.available && item.path !== '/').map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  elevation: 4
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box color="primary.main" sx={{ mb: 2 }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.path === '/pacientes' && 'Gestionar perfiles, datos y seguimiento de pacientes'}
                  {item.path === '/mediciones' && 'Mediciones manuales y automáticas InBody'}
                  {item.path === '/reportes' && 'Generar reportes PDF de evolución y estadísticas'}
                  {item.path === '/agenda' && 'Gestión de citas y calendario'}
                  {item.path === '/administracion' && 'Usuarios, roles, consultorios y configuraciones'}
                </Typography>
                <CustomButton
                  variant="contained"
                  size="small"
                  color={['/pacientes', '/mediciones', '/reportes', '/agenda', '/administracion'].includes(item.path) ? 'primary' : 'default'}
                  disabled={!['/pacientes', '/mediciones', '/reportes', '/agenda', '/administracion'].includes(item.path)}
                >
                  {['/pacientes', '/mediciones', '/reportes', '/agenda'].includes(item.path) ? 'Abrir Módulo' : 'Próximamente'}
                </CustomButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Información de Desarrollo */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: '#f0f7ff' }}>
        <Typography variant="h6" gutterBottom>
          Estado del Desarrollo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Fase Actual:</strong> Sistema de Agenda y Citas (COMPLETADO)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Completado:</strong> Autenticación, Pacientes, Mediciones, Reportes PDF, Agenda de Citas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Próximo:</strong> InBody OCR, Galería de fotos, Notificaciones
        </Typography>
      </Paper>
    </>
  );

  // Placeholder para módulos no implementados
  const ModuloEnDesarrollo = ({ titulo }) => (
    <Card>
      <CardContent>
        <Typography variant="h5">{titulo}</Typography>
        <Typography>En desarrollo - Próximamente</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: 1200 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Alimetria - {getCurrentPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificacionDropdown />
            <Typography variant="body2" sx={{ mr: 2, ml: 2 }}>
              {user?.nombre} {user?.apellido}
            </Typography>
            <Chip 
              label={user?.rol_nombre} 
              color={getRoleBadgeColor(user?.rol_nombre)}
              size="small" 
              sx={{ mr: 2 }}
            />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountIcon />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Mi Perfil</MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer de navegación */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            mt: '64px'
          }
        }}
      >
        <List>
          {menuItems.filter(item => item.available).map((item) => (
            <ListItem 
              button 
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>

      {/* Contenido principal con rutas */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px'
        }}
      >
        <Container maxWidth="lg">
          <Routes>
            {/* Ruta principal */}
            <Route path="/" element={<DashboardHome />} />
            
            {/* Rutas de pacientes */}
            <Route path="/pacientes" element={<ListaPacientes />} />
            <Route path="/pacientes/nuevo" element={<FormularioPaciente />} />
            <Route path="/pacientes/editar/:id" element={<FormularioPaciente />} />
            <Route path="/pacientes/:id" element={<DetallePaciente />} />
            
            {/* Rutas de mediciones */}
            <Route path="/mediciones" element={<MedicionesHomePage />} />
            <Route path="/mediciones/nueva/:pacienteId" element={<NuevaMedicionPage />} />
            <Route path="/mediciones/editar/:medicionId" element={<EditarMedicionPage />} />
            <Route path="/mediciones/ver/:medicionId" element={<VerMedicionPage />} />
            <Route path="/mediciones/evolucion/:pacienteId" element={<EvolucionMedicionesPage />} />
            <Route path="/mediciones/inbody/:pacienteId" element={<MedicionInBodyPage />} />

            
            {/* Rutas de reportes */}
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/reportes/paciente/:pacienteId" element={<Reportes />} />
            
            {/* Rutas de agenda */}
            <Route path="/agenda" element={<AgendaPage />} />
            
            {/* Rutas de administración */}
            <Route path="/administracion/*" element={<PanelAdministracion />} />
            
            {/* Rutas de notificaciones */}
            <Route path="/notificaciones" element={<NotificacionesPage />} />
            
            {/* Ruta futura redirigida a administración */}
            <Route path="/configuración" element={<Navigate to="/administracion" replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
