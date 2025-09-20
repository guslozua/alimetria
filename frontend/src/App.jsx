import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeContext';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import { CircularProgress, Box, Fade } from '@mui/material';

// Componente optimizado que solo maneja la redirección inicial
const AuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Solo manejar redirecciones cuando no estamos cargando
    if (!isLoading) {
      // Solo redirigir si NO está autenticado y NO está en login
      // La navegación post-login la maneja directamente el componente Login
      if (!isAuthenticated && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  return null; // Este componente no renderiza nada
};

// Componente de loading mejorado
const AuthLoadingScreen = () => (
  <Box 
    display="flex" 
    flexDirection="column"
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    bgcolor="background.default"
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
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              typography: 'h6',
              color: 'primary.main',
              fontWeight: 500,
              letterSpacing: 0.5,
              mb: 1
            }}
          >
            Alimetria
          </Box>
          <Box
            sx={{
              typography: 'body2',
              color: 'text.secondary'
            }}
          >
            Cargando sistema...
          </Box>
        </Box>
      </Box>
    </Fade>
  </Box>
);

// Componente que protege las rutas (optimizado)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <AuthLoadingScreen />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente principal que maneja las rutas
const AppContent = () => {
  const { isLoading } = useAuth();

  // Mostrar loading solo durante la verificación inicial
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <>
      <AuthRedirect />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeModeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
