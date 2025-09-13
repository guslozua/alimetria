import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  ArrowBack, 
  Person, 
  Assessment,
  Home
} from '@mui/icons-material';

import FiltrosReporte from '../components/Reportes/FiltrosReporte';
import EstadisticasResumen from '../components/Reportes/EstadisticasResumen';
import GraficoEvolucion from '../components/Reportes/GraficoEvolucion';
import ReportesService from '../services/reportes';
import PacienteService from '../services/pacienteService';

const Reportes = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  
  const [tabActual, setTabActual] = useState(pacienteId ? 0 : 1); // 0: Individual, 1: Consolidado
  const [paciente, setPaciente] = useState(null);
  const [datosReporte, setDatosReporte] = useState(null);
  const [filtrosActuales, setFiltrosActuales] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos del paciente si viene de URL con ID
  useEffect(() => {
    if (pacienteId) {
      cargarPaciente();
    }
  }, [pacienteId]);

  const cargarPaciente = async () => {
    try {
      setCargando(true);
      const response = await PacienteService.getById(pacienteId);
      setPaciente(response.paciente);
    } catch (error) {
      setError('Error al cargar datos del paciente');
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambio de tab
  const handleTabChange = (event, newValue) => {
    setTabActual(newValue);
    setDatosReporte(null);
    setFiltrosActuales(null);
    setError('');
  };

  // Callback cuando se obtienen datos del reporte
  const handleDatosObtenidos = (datos, filtros) => {
    console.log('📄 Datos de reporte obtenidos:', datos);
    console.log('📊 Estructura de datos:', {
      paciente: datos?.paciente,
      mediciones: datos?.mediciones?.length || 0,
      estadisticas: datos?.estadisticas,
      totalMediciones: datos?.totalMediciones
    });
    
    setDatosReporte(datos);
    setFiltrosActuales(filtros);
    setError('');
  };

  // Formatear datos para gráficos
  const formatearDatosGraficos = (mediciones, campo) => {
    return ReportesService.formatearParaGraficos(mediciones, campo);
  };

  if (cargando && !datosReporte) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Inicio
        </Link>
        {pacienteId && (
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/pacientes')}
          >
            Pacientes
          </Link>
        )}
        <Typography color="text.primary">Reportes</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              📊 Sistema de Reportes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Genere reportes detallados de evolución nutricional y estadísticas del consultorio
            </Typography>
          </Box>
          
          {pacienteId && (
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/pacientes/${pacienteId}`)}
            >
              Volver al Paciente
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Tabs value={tabActual} onChange={handleTabChange}>
          <Tab 
            icon={<Person />} 
            label="Reporte Individual" 
            disabled={!pacienteId && tabActual !== 0}
          />
          <Tab 
            icon={<Assessment />} 
            label="Reporte Consolidado" 
          />
        </Tabs>
      </Paper>

      {/* Error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Contenido según tab */}
      {tabActual === 0 && (
        <ReporteIndividual
          paciente={paciente}
          pacienteId={pacienteId}
          datosReporte={datosReporte}
          onDatosObtenidos={handleDatosObtenidos}
          formatearDatosGraficos={formatearDatosGraficos}
        />
      )}

      {tabActual === 1 && (
        <ReporteConsolidado
          datosReporte={datosReporte}
          onDatosObtenidos={handleDatosObtenidos}
        />
      )}
    </Container>
  );
};

// Componente para reporte individual
const ReporteIndividual = ({ 
  paciente, 
  pacienteId, 
  datosReporte, 
  onDatosObtenidos, 
  formatearDatosGraficos 
}) => {
  
  if (!pacienteId) {
    return (
      <Alert severity="info">
        Para generar un reporte individual, seleccione un paciente desde la lista de pacientes.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Filtros */}
      <Grid item xs={12}>
        <FiltrosReporte
          pacienteId={pacienteId}
          tipo="individual"
          pacienteNombre={paciente ? `${paciente.nombre} ${paciente.apellido}` : ''}
          onDatosObtenidos={onDatosObtenidos}
        />
      </Grid>

      {/* Contenido del reporte */}
      {datosReporte && (
        <>
          {/* DEBUG: Mostrar datos recibidos */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                📄 <strong>Debug:</strong> Datos recibidos - 
                Paciente: {datosReporte.paciente?.nombre || 'No encontrado'} | 
                Mediciones: {datosReporte.mediciones?.length || 0} | 
                Estadísticas: {Object.keys(datosReporte.estadisticas || {}).length} métricas
              </Typography>
            </Alert>
          </Grid>

          {/* Estadísticas resumen */}
          <Grid item xs={12}>
            <EstadisticasResumen
              estadisticas={datosReporte.estadisticas}
              paciente={datosReporte.paciente}
            />
          </Grid>

          {/* Gráficos de evolución */}
          {datosReporte.mediciones && datosReporte.mediciones.length > 1 && (
            <>
              {/* Gráfico de Peso */}
              <Grid item xs={12} md={6}>
                <GraficoEvolucion
                  datos={formatearDatosGraficos(datosReporte.mediciones, 'peso')}
                  titulo="Evolución del Peso"
                  campo="Peso"
                  unidad="kg"
                  color="#2196f3"
                />
              </Grid>

              {/* Gráfico de IMC */}
              <Grid item xs={12} md={6}>
                <GraficoEvolucion
                  datos={formatearDatosGraficos(datosReporte.mediciones, 'imc')}
                  titulo="Evolución del IMC"
                  campo="IMC"
                  unidad=""
                  color="#ff9800"
                />
              </Grid>

              {/* Gráfico de Grasa Corporal */}
              <Grid item xs={12} md={6}>
                <GraficoEvolucion
                  datos={formatearDatosGraficos(datosReporte.mediciones, 'grasa_corporal')}
                  titulo="Evolución de Grasa Corporal"
                  campo="Grasa"
                  unidad="%"
                  color="#f44336"
                />
              </Grid>

              {/* Gráfico de Masa Muscular */}
              <Grid item xs={12} md={6}>
                <GraficoEvolucion
                  datos={formatearDatosGraficos(datosReporte.mediciones, 'musculo')}
                  titulo="Evolución de Masa Muscular"
                  campo="Músculo"
                  unidad="kg"
                  color="#4caf50"
                />
              </Grid>
            </>
          )}

          {/* Tabla de mediciones */}
          {datosReporte.mediciones && datosReporte.mediciones.length > 0 && (
            <Grid item xs={12}>
              <TablaMediciones mediciones={datosReporte.mediciones} />
            </Grid>
          )}

          {/* Sin datos */}
          {(!datosReporte.mediciones || datosReporte.mediciones.length === 0) && (
            <Grid item xs={12}>
              <Alert severity="warning">
                No se encontraron mediciones para el paciente en el rango de fechas seleccionado.
              </Alert>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

// Componente para reporte consolidado
const ReporteConsolidado = ({ datosReporte, onDatosObtenidos }) => {
  return (
    <Grid container spacing={3}>
      {/* Filtros */}
      <Grid item xs={12}>
        <FiltrosReporte
          tipo="consolidado"
          onDatosObtenidos={onDatosObtenidos}
        />
      </Grid>

      {/* Contenido del reporte consolidado */}
      {datosReporte && (
        <>
          {/* Estadísticas generales */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Estadísticas del Consultorio
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary">
                      {datosReporte.totalPacientes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Pacientes
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="secondary">
                      {datosReporte.estadisticas?.total_mediciones || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Mediciones
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="success.main">
                      {datosReporte.estadisticas?.peso_promedio?.toFixed(1) || '-'}kg
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Peso Promedio
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="warning.main">
                      {datosReporte.estadisticas?.imc_promedio?.toFixed(1) || '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      IMC Promedio
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Distribución por IMC */}
          {datosReporte.distribucionIMC && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Distribución por Categoría de IMC
                </Typography>
                
                <Grid container spacing={2}>
                  {datosReporte.distribucionIMC.map((categoria, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Box textAlign="center" p={2} border={1} borderColor="grey.300" borderRadius={1}>
                        <Typography variant="h4" color="primary">
                          {categoria.cantidad_pacientes}
                        </Typography>
                        <Typography variant="body1">
                          {categoria.categoria_imc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

// Componente para tabla de mediciones
const TablaMediciones = ({ mediciones }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Historial de Mediciones
      </Typography>
      
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Fecha</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Peso (kg)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>IMC</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Grasa (%)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Músculo (kg)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {mediciones.map((medicion, index) => (
              <tr key={medicion.id} style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {new Date(medicion.fecha_medicion).toLocaleDateString('es-ES')}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {medicion.peso || '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {medicion.imc || '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {medicion.grasa_corporal || '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {medicion.musculo || '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {medicion.observaciones || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

export default Reportes;