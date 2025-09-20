import React, { useState, useEffect, useMemo } from 'react';
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
  Button,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  Avatar,
  IconButton,
  Badge,
  Stack,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  TrendingUp,
  PersonAdd,
  EventNote,
  ArrowUpward,
  ArrowDownward,
  Circle,
  LightMode,
  DarkMode,
  Logout,
  Person,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';

// Importar logos
import LogoClaro from '../../assets/images/Logo principal-fdo transparente.png';
import LogoOscuro from '../../assets/images/Logo-principal-fdo-oscuro.png';

// Importar componentes
import DashboardHome from './DashboardHome';
import ListaPacientes from '../Pacientes/ListaPacientes';
import DetallePaciente from '../Pacientes/DetallePaciente';
import FormularioPaciente from '../Pacientes/FormularioPaciente';
import NuevaMedicionPage from '../../pages/NuevaMedicionPage';
import EditarMedicionPage from '../../pages/EditarMedicionPage';
import VerMedicionPage from '../../pages/VerMedicionPage';
import EvolucionMedicionesPage from '../../pages/EvolucionMedicionesPage';
import MedicionesHomePage from '../../pages/MedicionesHomePage';
import MedicionInBodyPage from '../../pages/MedicionInBodyPage';
import Reportes from '../../pages/Reportes';
import { AgendaPage } from '../Agenda';
import NotificacionesPage from '../../pages/NotificacionesPage';
import PanelAdministracion from '../Administracion/PanelAdministracion';
import Footer from '../Common/Footer';
import NotificationButton from '../Common/NotificationButton';

const Dashboard = () => {
  const { user, logout, isAdmin, isNutricionista, isSecretario } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Configuración de navegación
  const navigationTabs = useMemo(() => [
    {
      title: 'Inicio',
      icon: <DashboardIcon sx={{ fontSize: '1.1rem' }} />,
      path: '/',
      available: true
    },
    {
      title: 'Pacientes',
      icon: <PeopleIcon sx={{ fontSize: '1.1rem' }} />,
      path: '/pacientes',
      available: isAdmin || isNutricionista || isSecretario
    },
    {
      title: 'Agenda',
      icon: <ScheduleIcon sx={{ fontSize: '1.1rem' }} />,
      path: '/agenda',
      available: isAdmin || isNutricionista || isSecretario
    },
    {
      title: 'Reportes',
      icon: <AssessmentIcon sx={{ fontSize: '1.1rem' }} />,
      path: '/reportes',
      available: isAdmin || isNutricionista
    },
    {
      title: 'Administración',
      icon: <SettingsIcon sx={{ fontSize: '1.1rem' }} />,
      path: '/administracion',
      available: isAdmin
    }
  ], [isAdmin, isNutricionista, isSecretario]);

  // Actualizar tab activo basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    const availableTabs = navigationTabs.filter(tab => tab.available);
    
    // Rutas especiales que no corresponden a ningún tab
    const specialRoutes = ['/notificaciones'];
    const isSpecialRoute = specialRoutes.includes(currentPath) || currentPath.startsWith('/mediciones');
    
    if (specialRoutes.includes(currentPath)) {
      setActiveTab(-1); // -1 indica que ningún tab está activo
    } else {
      const tabIndex = availableTabs.findIndex(tab => 
        currentPath === tab.path || currentPath.startsWith(tab.path + '/')
      );
      if (tabIndex !== -1) {
        setActiveTab(tabIndex);
      } else {
        setActiveTab(-1); // También para rutas no encontradas
      }
    }
  }, [location.pathname, navigationTabs]);

  const handleTabChange = (event, newValue) => {
    // Si newValue es false (viene de activeTab = -1), no hacer nada
    if (newValue === false) return;
    
    const selectedTab = navigationTabs.filter(tab => tab.available)[newValue];
    if (selectedTab) {
      setActiveTab(newValue);
      navigate(selectedTab.path);
    }
  };

  const availableTabs = useMemo(() => 
    navigationTabs.filter(tab => tab.available), 
    [navigationTabs]
  );

  // Funciones para manejar el menú de usuario
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    // Aquí podrías navegar a una página de perfil si existe
    // navigate('/perfil');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: darkMode ? '#0f172a' : '#fafbfc',
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      
      {/* Header estilo Stripe con logo real */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          bgcolor: darkMode ? '#1e293b' : '#ffffff',
          borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          color: darkMode ? '#ffffff' : '#1a1a1a'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: 0, py: 1.5, minHeight: '72px !important' }}>
            
            {/* Logo real */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Box
                component="img"
                src={darkMode ? LogoOscuro : LogoClaro}
                alt="Alimetria"
                sx={{
                  height: 70,
                  width: 220,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => navigate('/')}
              />
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ flexGrow: 1 }}>
              <Tabs
                value={activeTab === -1 ? false : activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#667eea',
                    height: 2,
                    borderRadius: '1px 1px 0 0'
                  },
                  '& .MuiTab-root': {
                    minHeight: 48,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                    minWidth: 'auto',
                    px: 2.5,
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    '&.Mui-selected': {
                      color: darkMode ? '#ffffff' : '#1a1a1a',
                      fontWeight: 600
                    },
                    '&:hover': {
                      color: darkMode ? '#e5e7eb' : '#374151'
                    }
                  }
                }}
              >
                {availableTabs.map((tab, index) => (
                  <Tab
                    key={index}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {tab.icon}
                        {tab.title}
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Right section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              
              {/* Search */}
              <Button
                variant="outlined"
                startIcon={<SearchIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  borderColor: darkMode ? '#374151' : '#e5e7eb',
                  color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  minWidth: 100,
                  justifyContent: 'flex-start',
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  '&:hover': {
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    bgcolor: 'transparent'
                  }
                }}
              >
                Buscar...
              </Button>

              {/* Theme Toggle */}
              <IconButton
                onClick={toggleDarkMode}
                sx={{
                  color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                  }
                }}
              >
                {darkMode ? <LightMode sx={{ fontSize: '1.2rem' }} /> : <DarkMode sx={{ fontSize: '1.2rem' }} />}
              </IconButton>

              {/* Notifications */}
              <NotificationButton darkMode={darkMode} />

              {/* User Avatar */}
              <Button
                onClick={handleOpenUserMenu}
                sx={{
                  textTransform: 'none',
                  color: darkMode ? '#ffffff' : '#1a1a1a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  // Efecto glassmorphism base
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
                  boxShadow: darkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    // Efecto glassmorphism mejorado en hover
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6))',
                    boxShadow: darkMode
                      ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                      : '0 12px 40px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-1px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 'inherit',
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  }
                }}
                startIcon={
                  <Avatar sx={{ 
                    width: 24, 
                    height: 24, 
                    bgcolor: '#667eea',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    // Efecto glassmorphism en el avatar también
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    {user?.nombre?.charAt(0) || 'A'}
                  </Avatar>
                }
              >
                {user?.nombre || 'Administrador'}
              </Button>
              
              {/* Menu de usuario */}
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                  sx: {
                    bgcolor: darkMode ? '#1f2937' : '#ffffff',
                    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    boxShadow: darkMode 
                      ? '0 10px 25px rgba(0, 0, 0, 0.4)' 
                      : '0 10px 25px rgba(0, 0, 0, 0.1)',
                    borderRadius: 2,
                    minWidth: 200
                  }
                }}
              >
                <MenuItem onClick={handleProfile} sx={{
                  color: darkMode ? '#ffffff' : '#1a1a1a',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                  }
                }}>
                  <ListItemIcon>
                    <Person sx={{ color: darkMode ? '#ffffff' : '#1a1a1a' }} />
                  </ListItemIcon>
                  <ListItemText primary="Mi Perfil" />
                </MenuItem>
                <Divider sx={{ bgcolor: darkMode ? '#374151' : '#e5e7eb' }} />
                <MenuItem onClick={handleLogout} sx={{
                  color: darkMode ? '#ffffff' : '#1a1a1a',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                  }
                }}>
                  <ListItemIcon>
                    <Logout sx={{ color: darkMode ? '#ffffff' : '#1a1a1a' }} />
                  </ListItemIcon>
                  <ListItemText primary="Cerrar Sesión" />
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: 'calc(100vh - 72px)'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 0
          }}
        >
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
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Dashboard;
