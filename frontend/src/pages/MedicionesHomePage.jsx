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
import { PageTitle, SectionTitle, InfoText, MetaText } from '../components/Common/TypographyHelpers';

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
        <PageTitle 
          icon={<AssessmentIcon />}
          subtitle="Gestiona las mediciones de tus pacientes de forma eficiente"
        >
          Módulo de Mediciones
        </PageTitle>
      </Box>

      {/* Información */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: '#e3f2fd' }}>
        <SectionTitle level="h6">Gestión de Mediciones</SectionTitle>
        <InfoText>
          Para acceder a las mediciones, ve al detalle de un paciente y selecciona la pestaña "Mediciones".
        </InfoText>
      </Paper>

      {/* Instrucciones */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssessmentIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <SectionTitle level="h6" sx={{ mb: 0 }}>Ver Mediciones</SectionTitle>
              </Box>
              <MetaText sx={{ mb: 3 }}>
                Para ver las mediciones de un paciente, ve a la lista de pacientes y selecciona "Ver detalle".
              </MetaText>
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
                <SectionTitle level="h6" sx={{ mb: 0 }}>Nueva Medición</SectionTitle>
              </Box>
              <MetaText sx={{ mb: 3 }}>
                Para crear una nueva medición, primero selecciona un paciente y luego usa el botón "Nueva Medición".
              </MetaText>
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
        <SectionTitle level="h6">Flujo de Trabajo</SectionTitle>
        <Box sx={{ pl: 2 }}>
          <InfoText gutterBottom>
            1. Ve a <strong>Pacientes</strong> → Selecciona un paciente → <strong>Ver detalle</strong>
          </InfoText>
          <InfoText gutterBottom>
            2. En el detalle del paciente, selecciona la pestaña <strong>"Mediciones"</strong>
          </InfoText>
          <InfoText gutterBottom>
            3. Desde ahí podrás:
          </InfoText>
          <Box sx={{ pl: 2 }}>
            <MetaText>• Crear nuevas mediciones</MetaText>
            <MetaText>• Ver mediciones existentes</MetaText>
            <MetaText>• Editar mediciones</MetaText>
            <MetaText>• Ver gráficos de evolución</MetaText>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MedicionesHome;
