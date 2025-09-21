import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  useTheme,
  alpha,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  LoginOutlined
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Importar los logos
import LogoOscuro from '../../assets/images/Logo-principal-fdo-oscuro.png';
import LogoPrincipalTransparente from '../../assets/images/Logo principal-fdo transparente.png';

const Login = () => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Seleccionar el logo apropiado según el tema
  const logoSrc = isDarkMode ? LogoOscuro : LogoPrincipalTransparente;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Activar estado de transición inmediatamente
    setIsTransitioning(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // 🚀 NAVEGACIÓN OPTIMISTA - Navegar inmediatamente después del login exitoso
        navigate('/', { replace: true });
        // No necesitamos setIsTransitioning(false) porque el componente se desmontará
      } else {
        // Si falla, quitar estado de transición
        setIsTransitioning(false);
        console.log('Error en login:', result.error);
      }
    } catch (err) {
      setIsTransitioning(false);
      console.log('Error inesperado:', err);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Si está en transición, mostrar pantalla de loading suave
  if (isTransitioning || isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDarkMode 
            ? `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                ${alpha(theme.palette.background.default, 0.98)} 100%)`
            : `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.05)} 0%, 
                ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Elementos decorativos de fondo */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            opacity: 0.5,
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        
        <Fade in={true} timeout={300}>
          <Box textAlign="center">
            <Box
              component="img"
              src={logoSrc}
              alt="Alimetria"
              sx={{
                height: 80,
                width: 'auto',
                mb: 3,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}
            />
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                mb: 3,
                color: 'primary.main'
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                letterSpacing: 0.5,
                color: 'primary.main',
                mb: 1
              }}
            >
              Accediendo al sistema
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 400
              }}
            >
              Preparando tu dashboard personalizado...
            </Typography>
          </Box>
        </Fade>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: isDarkMode 
          ? `linear-gradient(135deg, 
              ${alpha(theme.palette.background.default, 0.95)} 0%, 
              ${alpha(theme.palette.background.paper, 0.98)} 100%)`
          : `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.05)} 0%, 
              ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          opacity: 0.6,
          animation: 'float 8s ease-in-out infinite'
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.05)})`,
          opacity: 0.4,
          animation: 'float 10s ease-in-out infinite reverse'
        }}
      />

      <Container component="main" maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={0} sx={{ alignItems: 'center', minHeight: '100vh' }}>
          
          {/* Lado izquierdo - Información/Branding */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Fade in={true} timeout={800}>
              <Box sx={{ pr: 4 }}>
                <Box
                  component="img"
                  src={logoSrc}
                  alt="Alimetria"
                  sx={{
                    height: 120,
                    width: 'auto',
                    mb: 4,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                  }}
                />
                
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.7,
                      fontSize: '1.1rem',
                      mb: 2
                    }}
                  >
                    Gestiona tu consultorio de nutrición con tecnología avanzada:
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                    <Typography component="li" sx={{ mb: 1 }}>📊 Análisis automático InBody con OCR</Typography>
                    <Typography component="li" sx={{ mb: 1 }}>👥 Gestión completa de pacientes</Typography>
                    <Typography component="li" sx={{ mb: 1 }}>📅 Sistema de citas y recordatorios</Typography>
                    <Typography component="li" sx={{ mb: 1 }}>📈 Reportes detallados de evolución</Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Grid>

          {/* Lado derecho - Formulario de login */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: { xs: 2, sm: 4 }
              }}
            >
              <Fade in={true} timeout={1000}>
                <Paper 
                  elevation={isDarkMode ? 8 : 12}
                  sx={{ 
                    padding: { xs: 3, sm: 5 }, 
                    width: '100%',
                    maxWidth: 450,
                    borderRadius: 3,
                    background: isDarkMode 
                      ? `linear-gradient(135deg, 
                          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                          ${alpha(theme.palette.background.default, 0.98)} 100%)`
                      : 'background.paper',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    }
                  }}
                >
                  {/* Logo para móvil */}
                  <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
                    <Box
                      component="img"
                      src={logoSrc}
                      alt="Alimetria"
                      sx={{
                        height: 60,
                        width: 'auto'
                      }}
                    />
                  </Box>

                  <Box textAlign="center" mb={4}>
                    <Typography 
                      variant="h4" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 1,
                        display: { xs: 'block', md: 'none' }
                      }}
                    >
                      Alimetria
                    </Typography>
                    
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1
                      }}
                    >
                      Iniciar Sesión
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 400
                      }}
                    >
                      Accede a tu panel de control profesional
                    </Typography>
                  </Box>

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          fontSize: '1.2rem'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={formData.email}
                      onChange={handleChange}
                      error={!!validationErrors.email}
                      helperText={validationErrors.email}
                      disabled={isLoading}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            '& > fieldset': {
                              borderColor: alpha(theme.palette.primary.main, 0.5)
                            }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': {
                              borderWidth: 2
                            }
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!validationErrors.password}
                      helperText={validationErrors.password}
                      disabled={isLoading}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            '& > fieldset': {
                              borderColor: alpha(theme.palette.primary.main, 0.5)
                            }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': {
                              borderWidth: 2
                            }
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              sx={{ color: 'text.secondary' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ 
                        mt: 2, 
                        mb: 3, 
                        py: 1.8,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          background: 'action.disabled',
                          boxShadow: 'none',
                          transform: 'none'
                        }
                      }}
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginOutlined />}
                    >
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </Box>

                  <Paper 
                    elevation={0}
                    sx={{ 
                      mt: 3, 
                      p: 3, 
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontWeight: 500 }}>
                      <strong>Credenciales de demostración:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        📧 admin@alimetria.com
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        🔑 Admin123!
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'warning.main', mt: 2, display: 'block', fontWeight: 500 }}>
                      ⚠️ Recuerda cambiar la contraseña después del primer acceso
                    </Typography>
                  </Paper>
                </Paper>
              </Fade>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
      `}</style>
    </Box>
  );
};

export default Login;