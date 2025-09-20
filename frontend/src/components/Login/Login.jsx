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
  Fade
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '60vh',
            justifyContent: 'center'
          }}
        >
          <Fade in={true} timeout={300}>
            <Box textAlign="center">
              <CircularProgress 
                size={60} 
                thickness={4}
                sx={{ 
                  mb: 3,
                  color: 'primary.main'
                }} 
              />
              <Typography 
                variant="h6" 
                color="primary" 
                sx={{ 
                  fontWeight: 500,
                  letterSpacing: 0.5
                }}
              >
                Accediendo al sistema...
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1 }}
              >
                Preparando tu dashboard
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
      <Fade in={true} timeout={500}>
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              Alimetria
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Consultorio de Nutrición
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
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
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Credenciales por defecto:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: admin@alimetria.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contraseña: Admin123!
            </Typography>
            <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
              Cambia la contraseña después del primer acceso
            </Typography>
          </Box>
        </Paper>
      </Fade>
      </Box>
    </Container>
  );
};

export default Login;
