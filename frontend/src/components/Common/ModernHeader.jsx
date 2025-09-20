import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Breadcrumbs,
  Link,
  useTheme,
  alpha
} from '@mui/material';
import {
  NotificationsNone,
  Settings,
  Person,
  ExitToApp,
  KeyboardArrowDown,
  Home,
  NavigateNext,
  Menu as MenuIcon,
  LightMode,
  DarkMode
} from '@mui/icons-material';

// Importar los logos
import LogoPrincipal from '../../assets/images/Logo principal-fdo transparente.png';
import IconoLogo from '../../assets/images/ICONOLogo principal-fdo transparente.png';

const ModernHeader = ({ 
  user = { name: "Administrador", role: "administrador" },
  notifications = 3,
  currentPage = "Dashboard",
  breadcrumbs = ["Inicio"],
  onToggleSidebar, // Nueva prop para manejar el sidebar
  onLogout, // Nueva prop para manejar el logout
  darkMode = false, // Nueva prop para el modo oscuro
  onToggleDarkMode // Nueva prop para cambiar modo oscuro
}) => {
  const theme = useTheme();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleNotificationsOpen = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    handleUserMenuClose();
  };

  return (
    <>
      {/* Header principal */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
          {/* Botón de menú hamburguesa */}
          <IconButton
            onClick={onToggleSidebar}
            sx={{
              mr: 2,
              color: 'grey.600',
              '&:hover': { 
                bgcolor: alpha(theme.palette.grey[100], 0.8),
                color: 'primary.main' 
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo sin título */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box
              component="img"
              src={LogoPrincipal}
              alt="Alimetria"
              sx={{
                height: { xs: 60, md: 80 }, // Tamaño del footer (más grande)
                width: 'auto',
                mr: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
          </Box>

          {/* Acciones del header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Toggle modo oscuro */}
            <IconButton
              onClick={onToggleDarkMode}
              sx={{
                color: 'grey.600',
                '&:hover': { 
                  bgcolor: alpha(theme.palette.grey[100], 0.8),
                  color: 'primary.main' 
                }
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>

            {/* Notificaciones */}
            <IconButton
              onClick={handleNotificationsOpen}
              sx={{
                color: 'grey.600',
                '&:hover': { 
                  bgcolor: alpha(theme.palette.grey[100], 0.8),
                  color: 'primary.main' 
                }
              }}
            >
              <Badge badgeContent={notifications} color="error">
                <NotificationsNone />
              </Badge>
            </IconButton>

            {/* Configuración */}
            <IconButton
              sx={{
                color: 'grey.600',
                '&:hover': { 
                  bgcolor: alpha(theme.palette.grey[100], 0.8),
                  color: 'primary.main' 
                }
              }}
            >
              <Settings />
            </IconButton>

            {/* Divisor */}
            <Box sx={{
              width: '1px',
              height: '20px',
              bgcolor: alpha(theme.palette.grey[300], 0.6),
              mx: 1,
              display: { xs: 'none', sm: 'block' }
            }} />

            {/* Perfil de usuario */}
            <Box
              onClick={handleUserMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                px: { xs: 1, sm: 1.5 },
                py: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[100], 0.8)
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              
              <Box sx={{ ml: 1.5, display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'grey.800',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    fontSize: '0.875rem'
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'grey.500',
                    lineHeight: 1,
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}
                >
                  {user.role}
                </Typography>
              </Box>
              
              <KeyboardArrowDown 
                sx={{ 
                  ml: 0.5, 
                  color: 'grey.400',
                  fontSize: '1.2rem'
                }} 
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <Box
          sx={{
            mt: 8,
            px: { xs: 2, md: 4 },
            py: 2,
            bgcolor: alpha(theme.palette.grey[50], 0.5),
            borderBottom: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`
          }}
        >
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" sx={{ color: 'grey.400' }} />}
            sx={{
              '& .MuiBreadcrumbs-separator': {
                mx: 1
              }
            }}
          >
            <Link
              underline="hover"
              color="grey.600"
              href="/"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '0.875rem',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <Home sx={{ mr: 0.5, fontSize: '1rem' }} />
              Inicio
            </Link>
            {breadcrumbs.slice(1).map((crumb, index) => (
              <Typography 
                key={index} 
                color="text.primary"
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: index === breadcrumbs.length - 2 ? 600 : 400
                }}
              >
                {crumb}
              </Typography>
            ))}
          </Breadcrumbs>
        </Box>
      )}

      {/* Menu de usuario */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08)
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <Person sx={{ mr: 2, color: 'grey.600' }} />
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <Settings sx={{ mr: 2, color: 'grey.600' }} />
          Configuración
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ExitToApp sx={{ mr: 2 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Menu de notificaciones */}
      <Menu
        anchorEl={anchorElNotifications}
        open={Boolean(anchorElNotifications)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 320,
            maxWidth: 400,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.grey[200], 0.5)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Notificaciones
          </Typography>
        </Box>
        
        {/* Notificaciones de ejemplo */}
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Nueva cita programada
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Juan Pérez - 15/09/2025 10:00
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Medición pendiente
            </Typography>
            <Typography variant="caption" color="text.secondary">
              María González requiere seguimiento
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Recordatorio de cita
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Carlos Rodríguez mañana 09:30
            </Typography>
          </Box>
        </MenuItem>
        
        {/* Enlace para ver todas las notificaciones */}
        <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`, mt: 1 }}>
          <MenuItem 
            onClick={() => {
              handleNotificationsClose();
              // Navegar a la página de notificaciones
              window.location.href = '/notificaciones';
            }}
            sx={{ 
              justifyContent: 'center',
              color: 'primary.main',
              fontWeight: 600
            }}
          >
            Ver todas las notificaciones
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
};

export default ModernHeader;