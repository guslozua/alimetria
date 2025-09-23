import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Tab,
  Tabs,
  Chip,
  InputAdornment,
  IconButton,
  Fab
} from '@mui/material';
import {
  Description as DocumentIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  FileCopy as ProtocolIcon,
  Assignment as TemplateIcon
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

const PlantillasPage = () => {
  const { darkMode } = useThemeMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Datos de ejemplo para plantillas
  const categorias = [
    'Todas',
    'Evaluación Inicial',
    'Planes Alimentarios',
    'Protocolos Clínicos',
    'Formatos de Seguimiento',
    'Consentimientos',
    'Reportes'
  ];

  const plantillas = [
    {
      id: 1,
      nombre: 'Evaluación Nutricional Inicial',
      categoria: 'Evaluación Inicial',
      tipo: 'formulario',
      descripcion: 'Formulario completo para primera consulta nutricional con anamnesis alimentaria',
      formato: 'PDF',
      ultimaActualizacion: '15 Sept 2025',
      downloads: 245,
      popular: true
    },
    {
      id: 2,
      nombre: 'Plan Alimentario Semanal',
      categoria: 'Planes Alimentarios',
      tipo: 'plantilla',
      descripcion: 'Formato estándar para planes alimentarios de 7 días con distribución de macronutrientes',
      formato: 'DOCX',
      ultimaActualizacion: '12 Sept 2025',
      downloads: 189,
      popular: true
    },
    {
      id: 3,
      nombre: 'Protocolo Diabetes Tipo 2',
      categoria: 'Protocolos Clínicos',
      tipo: 'protocolo',
      descripcion: 'Protocolo de atención nutricional para pacientes con diabetes mellitus tipo 2',
      formato: 'PDF',
      ultimaActualizacion: '10 Sept 2025',
      downloads: 156,
      popular: false
    },
    {
      id: 4,
      nombre: 'Seguimiento Antropométrico',
      categoria: 'Formatos de Seguimiento',
      tipo: 'formulario',
      descripcion: 'Hoja de registro para mediciones antropométricas y evolución del paciente',
      formato: 'Excel',
      ultimaActualizacion: '8 Sept 2025',
      downloads: 134,
      popular: false
    },
    {
      id: 5,
      nombre: 'Consentimiento Informado',
      categoria: 'Consentimientos',
      tipo: 'legal',
      descripcion: 'Documento de consentimiento informado para tratamiento nutricional',
      formato: 'DOCX',
      ultimaActualizacion: '5 Sept 2025',
      downloads: 98,
      popular: false
    },
    {
      id: 6,
      nombre: 'Reporte de Evolución Mensual',
      categoria: 'Reportes',
      tipo: 'reporte',
      descripcion: 'Plantilla para reportes mensuales de evolución nutricional del paciente',
      formato: 'PDF',
      ultimaActualizacion: '3 Sept 2025',
      downloads: 87,
      popular: false
    }
  ];

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const filteredPlantillas = plantillas.filter(plantilla => {
    const matchesSearch = plantilla.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plantilla.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 0 || 
                           plantilla.categoria === categorias[selectedCategory];
    return matchesSearch && matchesCategory;
  });

  const getColorByType = (tipo) => {
    switch (tipo) {
      case 'formulario': return 'primary';
      case 'plantilla': return 'success';
      case 'protocolo': return 'warning';
      case 'reporte': return 'info';
      case 'legal': return 'error';
      default: return 'default';
    }
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'formulario': return <TemplateIcon />;
      case 'plantilla': return <DocumentIcon />;
      case 'protocolo': return <ProtocolIcon />;
      case 'reporte': return <DocumentIcon />;
      case 'legal': return <DocumentIcon />;
      default: return <DocumentIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DocumentIcon sx={{ 
            fontSize: 40, 
            color: '#667eea', 
            mr: 2 
          }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: darkMode ? '#ffffff' : '#1a1a1a'
            }}
          >
            Plantillas y Protocolos
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Documentos estandarizados y protocolos para optimizar tu práctica nutricional
        </Typography>

        {/* Búsqueda */}
        <TextField
          fullWidth
          placeholder="Buscar plantillas por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>

      {/* Filtros por categoría */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#667eea',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
              '&.Mui-selected': {
                color: '#667eea',
                fontWeight: 600
              }
            }
          }}
        >
          {categorias.map((categoria, index) => (
            <Tab key={index} label={categoria} />
          ))}
        </Tabs>
      </Box>

      {/* Grid de plantillas */}
      <Grid container spacing={3}>
        {filteredPlantillas.map((plantilla) => (
          <Grid item xs={12} sm={6} lg={4} key={plantilla.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: darkMode 
                    ? '0 20px 25px rgba(0, 0, 0, 0.4)' 
                    : '0 20px 25px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ mr: 2, color: '#667eea' }}>
                    {getIconByType(plantilla.tipo)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {plantilla.nombre}
                    </Typography>
                    <Chip 
                      label={plantilla.categoria} 
                      size="small" 
                      color={getColorByType(plantilla.tipo)}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {plantilla.descripcion}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Actualizado: {plantilla.ultimaActualizacion}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<ViewIcon />}
                    sx={{ flex: 1 }}
                  >
                    Ver
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<DownloadIcon />}
                    sx={{ flex: 1 }}
                  >
                    Descargar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mensaje si no hay resultados */}
      {filteredPlantillas.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <DocumentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron plantillas
          </Typography>
        </Box>
      )}

      {/* FAB para agregar nueva plantilla */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#667eea',
          '&:hover': { bgcolor: '#5a67d8' }
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default PlantillasPage;