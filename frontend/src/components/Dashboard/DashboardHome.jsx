import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Stack,
  Chip,
  alpha,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PersonAdd,
  EventNote,
  Assessment as AssessmentIcon,
  ArrowUpward,
  ArrowDownward,
  Circle
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';
import { dashboardService } from '../../services';

const DashboardHome = () => {
  const { darkMode } = useThemeMode();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsCards, setStatsCards] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('🔄 Cargando datos del dashboard...');
        setLoading(true);
        setError(null);

        // Obtener estadísticas y actividad reciente en paralelo
        console.log('📊 Obteniendo estadísticas...');
        const [statsResponse, activityResponse] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(4)
        ]);

        console.log('📈 Respuesta de estadísticas:', statsResponse);
        console.log('📋 Respuesta de actividad:', activityResponse);
        console.log('🔍 Estructura de statsResponse:', Object.keys(statsResponse));
        console.log('🔍 statsResponse.success:', statsResponse.success);
        console.log('🔍 statsResponse.data:', statsResponse.data);

        // El interceptor de api.js devuelve response.data directamente
        if (statsResponse && statsResponse.statsCards) {
          console.log('✅ Estadísticas cargadas:', statsResponse.statsCards);
          setStatsCards(statsResponse.statsCards);
        } else {
          console.log('❌ Error en estadísticas:', statsResponse);
        }

        if (activityResponse && Array.isArray(activityResponse)) {
          console.log('✅ Actividad cargada:', activityResponse);
          setRecentActivities(activityResponse);
        } else {
          console.log('❌ Error en actividad:', activityResponse);
        }

      } catch (error) {
        console.error('💥 Error al cargar datos del dashboard:', error);
        setError('Error al cargar los datos del dashboard. Por favor, intenta de nuevo.');
        
        // En caso de error, usar datos por defecto
        setStatsCards([
          {
            title: 'Total Pacientes',
            value: '0',
            change: '+0.0%',
            trend: 'up',
            color: '#3b82f6'
          },
          {
            title: 'Citas Hoy',
            value: '0',
            change: '+0.0%',
            trend: 'up',
            color: '#10b981'
          },
          {
            title: 'Pendientes',
            value: '0',
            change: '+0.0%',
            trend: 'up',
            color: '#f59e0b'
          },
          {
            title: 'Completadas',
            value: '0',
            change: '+0.0%',
            trend: 'up',
            color: '#8b5cf6'
          }
        ]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
        console.log('🏁 Carga completada');
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            fontSize: '1.875rem',
            color: darkMode ? '#ffffff' : '#111827',
            mb: 1,
            letterSpacing: '-0.025em',
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        >
          Panel de Control
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
            fontSize: '1rem',
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        >
          Gestiona tu consultorio de nutrición desde aquí
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  transform: 'translateY(-1px)',
                  boxShadow: darkMode 
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                  }}
                >
                  {stat.title}
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: stat.color
                  }}
                />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  fontSize: '2rem',
                  color: darkMode ? '#ffffff' : '#111827',
                  mb: 1,
                  letterSpacing: '-0.02em',
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }}
              >
                {stat.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {stat.trend === 'up' ? (
                  <ArrowUpward sx={{ fontSize: '0.875rem', color: '#10b981' }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: '0.875rem', color: '#ef4444' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                  }}
                >
                  {stat.change}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                    fontSize: '0.875rem',
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                  }}
                >
                  vs mes anterior
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        
        {/* Recent Activity */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
              bgcolor: darkMode ? '#1f2937' : '#ffffff',
              height: 'fit-content'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  color: darkMode ? '#ffffff' : '#111827',
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }}
              >
                Actividad Reciente
              </Typography>
              <Button
                size="small"
                sx={{
                  textTransform: 'none',
                  color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                  }
                }}
              >
                Ver todo
              </Button>
            </Box>
            
            {recentActivities.length > 0 ? (
              <Stack spacing={2}>
                {recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 3,
                      borderRadius: 2,
                      bgcolor: darkMode ? '#111827' : '#f8fafc',
                      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: darkMode ? '#1f2937' : '#f1f5f9'
                      }
                    }}
                  >
                    <Circle
                      sx={{
                        fontSize: '0.5rem',
                        color: activity.type === 'medicion' ? '#3b82f6' : '#10b981',
                        mr: 3
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          color: darkMode ? '#ffffff' : '#111827',
                          mb: 0.5,
                          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                        }}
                      >
                        {activity.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                          fontSize: '0.8125rem',
                          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                        }}
                      >
                        {activity.action}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: darkMode ? 'rgba(107, 114, 128, 1)' : 'rgba(156, 163, 175, 1)',
                        fontSize: '0.75rem',
                        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                      }}
                    >
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)'
              }}>
                <Typography variant="body2">
                  No hay actividad reciente para mostrar
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            
            {/* Quick Actions */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                bgcolor: darkMode ? '#1f2937' : '#ffffff'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  color: darkMode ? '#ffffff' : '#111827',
                  mb: 4,
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }}
              >
                Acciones Rápidas
              </Typography>
              
              <Stack spacing={2}>
                {[
                  { icon: <PersonAdd />, label: 'Nuevo Paciente', color: '#3b82f6', path: '/pacientes/nuevo' },
                  { icon: <EventNote />, label: 'Agendar Cita', color: '#10b981', path: '/agenda' },
                  { icon: <AssessmentIcon />, label: 'Ver Reportes', color: '#8b5cf6', path: '/reportes' }
                ].map((action, index) => (
                  <Button
                    key={index}
                    fullWidth
                    variant="outlined"
                    startIcon={action.icon}
                    onClick={() => navigate(action.path)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.5,
                      px: 3,
                      borderColor: darkMode ? '#374151' : '#e5e7eb',
                      color: darkMode ? '#ffffff' : '#374151',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      borderRadius: 2,
                      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      '&:hover': {
                        borderColor: action.color,
                        bgcolor: alpha(action.color, 0.05),
                        '& .MuiSvgIcon-root': {
                          color: action.color
                        }
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </Paper>

            {/* System Status */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                bgcolor: darkMode ? '#1f2937' : '#ffffff'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  color: darkMode ? '#ffffff' : '#111827',
                  mb: 4,
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }}
              >
                Estado del Sistema
              </Typography>
              
              <Stack spacing={3}>
                {[
                  { label: 'Servidor', status: 'Operativo', color: '#10b981' },
                  { label: 'Base de Datos', status: 'Operativo', color: '#10b981' },
                  { label: 'API Externa', status: 'Operativo', color: '#10b981' }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                        fontSize: '0.875rem',
                        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        bgcolor: alpha(item.color, 0.1),
                        color: item.color,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        height: 24,
                        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
