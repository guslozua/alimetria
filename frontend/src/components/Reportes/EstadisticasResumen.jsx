import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip 
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat 
} from '@mui/icons-material';

const EstadisticasResumen = ({ estadisticas, paciente }) => {
  
  // Componente para mostrar una métrica individual
  const MetricaCard = ({ 
    titulo, 
    valorInicial, 
    valorActual, 
    cambio, 
    unidad, 
    color = 'primary',
    invertirTendencia = false // Para métricas donde disminuir es positivo (ej: grasa)
  }) => {
    
    const getTendenciaIcon = (cambioValor, invertir = false) => {
      if (Math.abs(cambioValor) < 0.1) return <TrendingFlat color="action" />;
      
      const esPositivo = cambioValor > 0;
      const esbueno = invertir ? !esPositivo : esPositivo;
      
      if (esPositivo) {
        return <TrendingUp color={esbueno ? "success" : "error"} />;
      } else {
        return <TrendingDown color={esbueno ? "error" : "success"} />;
      }
    };

    const getTendenciaColor = (cambioValor, invertir = false) => {
      if (Math.abs(cambioValor) < 0.1) return 'default';
      
      const esPositivo = cambioValor > 0;
      const esBueno = invertir ? !esPositivo : esPositivo;
      
      return esBueno ? 'success' : 'error';
    };

    if (!valorActual && !valorInicial) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              {titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sin datos disponibles
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color={`${color}.main`}>
            {titulo}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="h4" fontWeight="bold">
              {valorActual?.toFixed(1) || '-'}
            </Typography>
            <Typography variant="h6" color="text.secondary" ml={0.5}>
              {unidad}
            </Typography>
          </Box>

          {valorInicial && valorActual && (
            <>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {getTendenciaIcon(cambio, invertirTendencia)}
                <Chip 
                  label={`${cambio > 0 ? '+' : ''}${cambio.toFixed(1)}${unidad}`}
                  size="small"
                  color={getTendenciaColor(cambio, invertirTendencia)}
                  variant="outlined"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Inicial: {valorInicial.toFixed(1)}{unidad}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!estadisticas || Object.keys(estadisticas).length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Resumen Estadístico</Typography>
          <Typography variant="body2" color="text.secondary">
            No hay datos suficientes para mostrar estadísticas
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Resumen de Evolución
      </Typography>
      
      <Grid container spacing={3}>
        {/* Peso */}
        {estadisticas.peso && (
          <Grid item xs={12} sm={6} md={3}>
            <MetricaCard
              titulo="Peso"
              valorInicial={estadisticas.peso.inicial}
              valorActual={estadisticas.peso.actual}
              cambio={estadisticas.peso.cambio}
              unidad="kg"
              color="primary"
            />
          </Grid>
        )}

        {/* IMC */}
        {estadisticas.imc && (
          <Grid item xs={12} sm={6} md={3}>
            <MetricaCard
              titulo="IMC"
              valorInicial={estadisticas.imc.inicial}
              valorActual={estadisticas.imc.actual}
              cambio={estadisticas.imc.cambio}
              unidad=""
              color="secondary"
            />
          </Grid>
        )}

        {/* Grasa Corporal */}
        {estadisticas.grasa && (
          <Grid item xs={12} sm={6} md={3}>
            <MetricaCard
              titulo="Grasa Corporal"
              valorInicial={estadisticas.grasa.inicial}
              valorActual={estadisticas.grasa.actual}
              cambio={estadisticas.grasa.cambio}
              unidad="%"
              color="warning"
              invertirTendencia={true}
            />
          </Grid>
        )}

        {/* Masa Muscular */}
        {estadisticas.musculo && (
          <Grid item xs={12} sm={6} md={3}>
            <MetricaCard
              titulo="Masa Muscular"
              valorInicial={estadisticas.musculo.inicial}
              valorActual={estadisticas.musculo.actual}
              cambio={estadisticas.musculo.cambio}
              unidad="kg"
              color="success"
            />
          </Grid>
        )}
      </Grid>

      {/* Información adicional del paciente */}
      {paciente && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información del Paciente
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Nombre
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paciente.nombre} {paciente.apellido}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Edad
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paciente.edad} años
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Sexo
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paciente.sexo === 'M' ? 'Masculino' : 
                   paciente.sexo === 'F' ? 'Femenino' : 'Otro'}
                </Typography>
              </Grid>
              
              {paciente.objetivo && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Objetivo
                  </Typography>
                  <Typography variant="body1">
                    {paciente.objetivo}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EstadisticasResumen;