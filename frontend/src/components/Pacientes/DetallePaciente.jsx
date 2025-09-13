import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  PhotoCamera as PhotoCameraIcon,
  Assignment as AssignmentIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import PacienteService from '../../services/pacienteService';
import { ListaMediciones } from '../Mediciones';
import FormularioPaciente from './FormularioPaciente';
import { formatearFecha, formatearEdad, formatearTelefono, formatearNombreCompleto, formatearSexo, getSexoColor } from '../../utils/formatters';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DetallePaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [ultimaMedicion, setUltimaMedicion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formularioDialog, setFormularioDialog] = useState({
    open: false,
    paciente: null
  });

  useEffect(() => {
    cargarPaciente();
  }, [id]);

  const cargarPaciente = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar que el ID esté presente
      if (!id || id === 'undefined') {
        setError('ID de paciente no válido');
        console.error('ID de paciente inválido:', id);
        return;
      }
      
      console.log('Cargando paciente con ID:', id);
      const response = await PacienteService.getById(id);
      
      // PacienteService.getById() devuelve directamente {paciente: {...}}
      setPaciente(response.paciente);
    } catch (error) {
      setError('Error al cargar los datos del paciente');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleVolver = () => {
    navigate('/pacientes');
  };

  const handleEditar = () => {
    // Abrir formulario modal con los datos del paciente actual
    setFormularioDialog({
      open: true,
      paciente: paciente
    });
  };
  
  const handleCerrarFormulario = () => {
    setFormularioDialog({ open: false, paciente: null });
  };
  
  const handleExitoFormulario = (pacienteActualizado) => {
    console.log('Callback onSuccess llamado con:', pacienteActualizado);
    setFormularioDialog({ open: false, paciente: null });
    // Recargar datos del paciente para mostrar cambios
    cargarPaciente();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!paciente) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          Paciente no encontrado
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleVolver}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4">
            {formatearNombreCompleto(paciente.nombre, paciente.apellido)}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={() => navigate(`/reportes/paciente/${id}`)}
            color="secondary"
          >
            Generar Reporte
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditar}
          >
            Editar Paciente
          </Button>
        </Box>
      </Box>

      {/* Información básica del paciente */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={2}>
              <Box display="flex" justifyContent="center">
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120,
                    fontSize: '2rem'
                  }}
                  src={paciente.foto_perfil}
                >
                  {paciente.nombre?.charAt(0)}{paciente.apellido?.charAt(0)}
                </Avatar>
              </Box>
            </Grid>
            <Grid item xs={12} md={10}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Nombre completo
                  </Typography>
                  <Typography variant="h6">
                    {formatearNombreCompleto(paciente.nombre, paciente.apellido)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    Sexo
                  </Typography>
                  <Chip 
                    label={formatearSexo(paciente.sexo)}
                    color={getSexoColor(paciente.sexo)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    Edad
                  </Typography>
                  <Typography variant="body1">
                    {formatearEdad(paciente.fecha_nacimiento)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {paciente.email || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1">
                    {formatearTelefono(paciente.telefono) || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Ocupación
                  </Typography>
                  <Typography variant="body1">
                    {paciente.ocupacion || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Fecha de nacimiento
                  </Typography>
                  <Typography variant="body1">
                    {formatearFecha(paciente.fecha_nacimiento, false)}
                  </Typography>
                </Grid>
                {paciente.direccion && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Dirección
                    </Typography>
                    <Typography variant="body1">
                      {paciente.direccion}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Datos físicos iniciales */}
      {(paciente.altura_inicial || paciente.peso_inicial || paciente.ultimo_peso) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Datos Físicos Iniciales
            </Typography>
            <Grid container spacing={3}>
              {paciente.altura_inicial && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">
                    Altura inicial
                  </Typography>
                  <Typography variant="h6">
                    {paciente.altura_inicial} cm
                  </Typography>
                </Grid>
              )}
              {paciente.peso_inicial && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">
                    Peso inicial
                  </Typography>
                  <Typography variant="h6">
                    {paciente.peso_inicial} kg
                  </Typography>
                </Grid>
              )}
              {paciente.ultimo_peso && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">
                    Peso actual
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {parseFloat(paciente.ultimo_peso).toFixed(1)} kg
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Información de Obra Social */}
      {(paciente.obra_social_nombre || paciente.numero_afiliado) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información de Obra Social
            </Typography>
            <Grid container spacing={3}>
              {paciente.obra_social_nombre && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Obra Social
                  </Typography>
                  <Typography variant="h6">
                    {paciente.obra_social_nombre}
                    {paciente.obra_social_codigo && ` (${paciente.obra_social_codigo})`}
                  </Typography>
                </Grid>
              )}
              {paciente.numero_afiliado && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Número de Afiliado
                  </Typography>
                  <Typography variant="h6">
                    {paciente.numero_afiliado}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Objetivo y observaciones */}
      {(paciente.objetivo || paciente.observaciones_generales) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Objetivo y Observaciones
            </Typography>
            {paciente.objetivo && (
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Objetivo del tratamiento
                </Typography>
                <Typography variant="body1">
                  {paciente.objetivo}
                </Typography>
              </Box>
            )}
            {paciente.observaciones_generales && (
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Observaciones generales
                </Typography>
                <Typography variant="body1">
                  {paciente.observaciones_generales}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs para diferentes secciones */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs del paciente">
            <Tab 
              icon={<AssessmentIcon />} 
              label="Mediciones" 
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<PhotoCameraIcon />} 
              label="Fotos de Evolución" 
              id="tab-1"
              aria-controls="tabpanel-1"
              disabled
            />
            <Tab 
              icon={<AssignmentIcon />} 
              label="Reportes" 
              id="tab-2"
              aria-controls="tabpanel-2"
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <ListaMediciones 
            pacienteId={id} 
            pacienteNombre={formatearNombreCompleto(paciente.nombre, paciente.apellido)}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" color="textSecondary">
            Módulo de fotos de evolución en desarrollo
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Reportes de Evolución
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Genere reportes detallados de la evolución nutricional de {paciente.nombre}.
            </Typography>
            
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                onClick={() => navigate(`/reportes/paciente/${id}`)}
                size="large"
              >
                Ir a Reportes Completos
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => navigate(`/mediciones/evolucion/${id}`)}
                size="large"
              >
                Ver Gráficos de Evolución
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Card>

      {/* Info de creación */}
      <Box mt={2}>
        <Typography variant="caption" color="textSecondary">
          Paciente registrado el {formatearFecha(paciente.fecha_creacion)}
          {paciente.creador_nombre && ` por ${paciente.creador_nombre}`}
        </Typography>
      </Box>
      
      {/* Formulario de edición */}
      <FormularioPaciente
        open={formularioDialog.open}
        onClose={handleCerrarFormulario}
        onSuccess={handleExitoFormulario}
        paciente={formularioDialog.paciente}
      />
    </Container>
  );
};

export default DetallePaciente;
