import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fab,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  ViewList as ViewListIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import CalendarioView from './CalendarioView';
import ListaCitas from './ListaCitas';
import DashboardCitas from './DashboardCitas';
import FormularioCita from './FormularioCita';
import citasService from '../../services/citasService';
import dayjs from 'dayjs';
import esLocale from 'dayjs/locale/es';

// Configurar dayjs
dayjs.locale(esLocale);

const AgendaPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabActual, setTabActual] = useState(0);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [citaEditar, setCitaEditar] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar citas
  const cargarCitas = async (filtros = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando citas con filtros:', filtros);
      const response = await citasService.getCitas(filtros);
      console.log('✅ Respuesta del servicio:', response);
      
      const citasData = response.data || response || [];
      console.log('📊 Citas procesadas:', citasData);
      
      setCitas(citasData);
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);
      setError('Error al cargar las citas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar citas al montar el componente
  useEffect(() => {
    cargarCitas();
  }, []);

  // Cambiar pestaña
  const handleTabChange = (event, newValue) => {
    setTabActual(newValue);
  };

  // Abrir formulario para nueva cita
  const handleNuevaCita = () => {
    setCitaEditar(null);
    setModalFormulario(true);
  };

  // Abrir formulario para editar cita
  const handleEditarCita = (cita) => {
    setCitaEditar(cita);
    setModalFormulario(true);
  };

  // Cerrar formulario
  const handleCerrarFormulario = () => {
    setModalFormulario(false);
    setCitaEditar(null);
  };

  // Guardar cita (crear o actualizar)
  const handleGuardarCita = async (datosFormulario) => {
    try {
      setLoading(true);
      
      if (citaEditar) {
        // Actualizar cita existente
        await citasService.actualizarCita(citaEditar.id, datosFormulario);
      } else {
        // Crear nueva cita
        await citasService.crearCita(datosFormulario);
      }

      // Recargar citas
      await cargarCitas();
      
      // Cerrar formulario
      handleCerrarFormulario();
      
    } catch (error) {
      console.error('Error al guardar cita:', error);
      setError(error.response?.data?.message || 'Error al guardar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar cita
  const handleCancelarCita = async (citaId, motivo) => {
    try {
      setLoading(true);
      await citasService.cancelarCita(citaId, motivo);
      await cargarCitas();
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      setError(error.response?.data?.message || 'Error al cancelar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Completar cita
  const handleCompletarCita = async (citaId, notas) => {
    try {
      setLoading(true);
      await citasService.completarCita(citaId, notas);
      await cargarCitas();
    } catch (error) {
      console.error('Error al completar cita:', error);
      setError(error.response?.data?.message || 'Error al completar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Confirmar cita
  const handleConfirmarCita = async (citaId) => {
    try {
      setLoading(true);
      await citasService.confirmarCita(citaId);
      await cargarCitas();
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      setError(error.response?.data?.message || 'Error al confirmar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Configuración de pestañas
  const tabs = [
    { 
      label: 'Dashboard', 
      icon: <DashboardIcon />, 
      component: DashboardCitas 
    },
    { 
      label: 'Calendario', 
      icon: <EventIcon />, 
      component: CalendarioView 
    },
    { 
      label: 'Lista', 
      icon: <ViewListIcon />, 
      component: ListaCitas 
    }
  ];

  const TabActual = tabs[tabActual]?.component;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agenda de Citas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestión completa de citas y calendario
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabActual}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                '& .MuiSvgIcon-root': {
                  mr: 1
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ position: 'relative', minHeight: '60vh' }}>
        {TabActual && (
          <TabActual
            citas={citas}
            onEditarCita={handleEditarCita}
            onCancelarCita={handleCancelarCita}
            onCompletarCita={handleCompletarCita}
            onConfirmarCita={handleConfirmarCita}
            onRecargarCitas={cargarCitas}
            loading={loading}
          />
        )}
      </Box>

      {/* Floating Action Button para Nueva Cita */}
      <Fab
        color="primary"
        aria-label="Nueva cita"
        onClick={handleNuevaCita}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* Modal Formulario de Cita */}
      <FormularioCita
        open={modalFormulario}
        onClose={handleCerrarFormulario}
        onGuardar={handleGuardarCita}
        citaInicial={citaEditar}
        loading={loading}
      />
    </Container>
  );
};

export default AgendaPage;
