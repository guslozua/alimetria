import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const MedicionesHome = () => {
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate('/');
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleVolver}
          sx={{ mr: 2 }}
        >
          Volver al Dashboard
        </Button>
        <Typography variant="h4">
          Módulo de Mediciones
        </Typography>
      </Box>

      {/* Información */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: '#e3f2fd' }}>
        <Typography variant="h6" gutterBottom>
          Gestión de Mediciones
        </Typography>
        <Typography variant="body1">
          Para acceder a las mediciones, ve al detalle de un paciente y selecciona la pestaña "Mediciones".
        </Typography>
      </Paper>

      {/* Instrucciones */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssessmentIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h6">Ver Mediciones</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Para ver las mediciones de un paciente, ve a la lista de pacientes y selecciona "Ver detalle".
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/pacientes')}
                fullWidth
              >
                Ir a Pacientes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AddIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h6">Nueva Medición</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Para crear una nueva medición, primero selecciona un paciente y luego usa el botón "Nueva Medición".
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/pacientes')}
                fullWidth
              >
                Seleccionar Paciente
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Flujo de trabajo */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Flujo de Trabajo
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography variant="body2" gutterBottom>
            1. Ve a <strong>Pacientes</strong> → Selecciona un paciente → <strong>Ver detalle</strong>
          </Typography>
          <Typography variant="body2" gutterBottom>
            2. En el detalle del paciente, selecciona la pestaña <strong>"Mediciones"</strong>
          </Typography>
          <Typography variant="body2" gutterBottom>
            3. Desde ahí podrás:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">• Crear nuevas mediciones</Typography>
            <Typography variant="body2">• Ver mediciones existentes</Typography>
            <Typography variant="body2">• Editar mediciones</Typography>
            <Typography variant="body2">• Ver gráficos de evolución</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MedicionesHome;
