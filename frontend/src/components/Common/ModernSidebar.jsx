import React, { useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  ChevronLeft,
  Notifications,
  Search,
  Help
} from '@mui/icons-material';

const ModernSidebar = ({ 
  open, 
  onClose, 
  user, 
  menuItems, 
  location, 
  navigate,
  darkMode = false 
}) => {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  
  const sidebarWidth = collapsed ? 80 : 280;

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Sidebar completamente rediseñado estilo Notion/Slack
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          mt: 10,
          height: 'calc(100vh - 80px)',
          borderRadius: '0 24px 24px 0',
          border: 'none',
          overflow: 'hidden',
          bgcolor: darkMode ? '#1a1a1a' : '#fafafa',
          boxShadow: darkMode 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          transition: 'width 0.3s ease, background-color 0.2s ease',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(4px)',
        }
      }}
    >
      {/* Header del sidebar - Estilo Notion */}
      <Box
        sx={{
          p: collapsed ? 1.5 : 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          transition: 'padding 0.3s ease'
        }}
      >
        {!collapsed && (
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.1rem',
                color: darkMode ? '#ffffff' : '#1a1a1a',
                letterSpacing: '-0.025em'
              }}
            >
              Alimetria
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                fontWeight: 500
              }}
            >
              Sistema de Nutrición
            </Typography>
          </Box>
        )}
        
        <IconButton
          onClick={handleToggleCollapse}
          size="small"
          sx={{
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            p: 1,
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronLeft 
            sx={{ 
              fontSize: '1.2rem',
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} 
          />
        </IconButton>
      </Box>

      {/* Barra de búsqueda - Solo visible cuando no está colapsado */}
      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            <Search sx={{ 
              fontSize: '1.1rem', 
              color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' 
            }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                fontWeight: 400
              }}
            >
              Buscar...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navegación principal - Estilo Slack/Notion */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          px: collapsed ? 1 : 2,
          py: 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '2px',
          },
        }}
      >
        {/* Sección: Workspace */}
        {!collapsed && (
          <Typography 
            variant="caption" 
            sx={{ 
              px: 1,
              py: 1,
              display: 'block',
              color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Workspace
          </Typography>
        )}

        <List sx={{ p: 0, mb: 2 }}>
          {menuItems.filter(item => item.available).map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Tooltip 
                key={item.path}
                title={collapsed ? item.title : ''}
                placement="right"
                arrow
              >
                <ListItem
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  sx={{
                    borderRadius: 2.5,
                    mb: 0.5,
                    py: collapsed ? 1.5 : 1.2,
                    px: collapsed ? 1.5 : 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive 
                      ? (darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)')
                      : 'transparent',
                    border: isActive 
                      ? `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: isActive
                        ? (darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)')
                        : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: collapsed ? 0 : 1.5,
                      width: '100%',
                      justifyContent: collapsed ? 'center' : 'flex-start'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        color: isActive 
                          ? (darkMode ? '#60a5fa' : '#2563eb')
                          : (darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'),
                      }}
                    >
                      {React.cloneElement(item.icon, { 
                        sx: { fontSize: '1.3rem' }
                      })}
                    </Box>
                    
                    {!collapsed && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.95rem',
                          color: isActive 
                            ? (darkMode ? '#ffffff' : '#1a1a1a')
                            : (darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'),
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {item.title}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              </Tooltip>
            );
          })}
        </List>

        {/* Sección: Acceso rápido */}
        {!collapsed && (
          <>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 1,
                py: 1,
                display: 'block',
                color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Acceso rápido
            </Typography>
            
            <List sx={{ p: 0 }}>
              <ListItem
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1,
                  px: 1.5,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Notifications sx={{ 
                    fontSize: '1.2rem', 
                    color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' 
                  }} />
                  <Typography variant="body2" sx={{ 
                    color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    fontWeight: 500
                  }}>
                    Notificaciones
                  </Typography>
                </Box>
              </ListItem>
              
              <ListItem
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1,
                  px: 1.5,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Help sx={{ 
                    fontSize: '1.2rem', 
                    color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' 
                  }} />
                  <Typography variant="body2" sx={{ 
                    color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    fontWeight: 500
                  }}>
                    Ayuda
                  </Typography>
                </Box>
              </ListItem>
            </List>
          </>
        )}
      </Box>

      {/* Footer con perfil de usuario - Estilo moderno */}
      <Box
        sx={{
          p: collapsed ? 1.5 : 2,
          borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 1.5,
            p: collapsed ? 1 : 1.5,
            borderRadius: 2.5,
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            justifyContent: collapsed ? 'center' : 'flex-start',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-1px)',
            }
          }}
        >
          <Avatar
            sx={{
              width: collapsed ? 32 : 36,
              height: collapsed ? 32 : 36,
              bgcolor: '#2563eb',
              fontSize: collapsed ? '0.9rem' : '1rem',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            {user?.nombre?.charAt(0) || 'A'}
          </Avatar>
          
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: darkMode ? '#ffffff' : '#1a1a1a',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.nombre || 'Usuario'}
              </Typography>
              <Chip
                label={user?.rol || 'administrador'}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  mt: 0.5,
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  textTransform: 'capitalize',
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default ModernSidebar;
