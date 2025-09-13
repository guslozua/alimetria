import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { medicionesService } from '../../services/medicionesService';
import { formatearFecha, formatearNumero } from '../../utils/formatters';

const VerMedicion = () => {
  const { medicionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicion, setMedicion] = useState(null);
  const [recomendaciones, setRecomendaciones] = useState([]);

  useEffect(() => {
    cargarMedicion();
  }, [medicionId]);

  const cargarMedicion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicionesService.getMedicion(medicionId);
      const medicionData = response.data;
      setMedicion(medicionData);

      // Generar recomendaciones si hay datos del paciente
      if (medicionData.paciente_sexo) {
        const pacienteInfo = {
          sexo: medicionData.paciente_sexo,
          fecha_nacimiento: medicionData.paciente_fecha_nacimiento
        };
        const recs = medicionesService.getRecomendaciones(medicionData, pacienteInfo);
        setRecomendaciones(recs);
      }
    } catch (error) {
      setError('Error al cargar la medición');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoChipColor = (tipo) => {
    switch (tipo) {
      case 'manual':
        return 'primary';
      case 'inbody':
        return 'success';
      case 'mixta':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getIMCCategoria = (imc) => {
    if (!imc) return { categoria: '', color: 'default' };
    if (imc < 18.5) return { categoria: 'Bajo peso', color: 'info' };
    if (imc < 25) return { categoria: 'Normal', color: 'success' };
    if (imc < 30) return { categoria: 'Sobrepeso', color: 'warning' };
    return { categoria: 'Obesidad', color: 'error' };
  };

  const handleVolver = () => {
    navigate(`/pacientes/${medicion.paciente_id}`);
  };

  const handleEditar = () => {
    navigate(`/mediciones/editar/${medicionId}`);
  };

  const handleVerHistorial = () => {
    navigate(`/mediciones/historial/${medicionId}`);
  };

  const handleVerEvolucion = () => {
    navigate(`/mediciones/evolucion/${medicion.paciente_id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!medicion) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Medición no encontrada
      </Alert>
    );
  }

  const imcInfo = getIMCCategoria(medicion.imc);

  return (
    <Box>
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
          <Typography variant="h5">
            Medición - {medicion.paciente_nombre} {medicion.paciente_apellido}
          </Typography>
        </Box>
        <Box>
          <Button
            startIcon={<AssessmentIcon />}
            onClick={handleVerEvolucion}
            sx={{ mr: 1 }}
          >
            Evolución
          </Button>
          <Button
            startIcon={<HistoryIcon />}
            onClick={handleVerHistorial}
            sx={{ mr: 1 }}
          >
            Historial
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditar}
          >
            Editar
          </Button>
        </Box>
      </Box>

      {/* Información básica */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Información General
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Fecha y hora
              </Typography>
              <Typography variant="body1">
                {formatearFecha(medicion.fecha_medicion)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Tipo de medición
              </Typography>
              <Chip 
                label={medicion.tipo}
                color={getTipoChipColor(medicion.tipo)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Versión
              </Typography>
              <Typography variant="body1">
                v{medicion.version}
              </Typography>
            </Grid>
            {medicion.usuario_nombre && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Registrado por
                </Typography>
                <Typography variant="body1">
                  {medicion.usuario_nombre} {medicion.usuario_apellido}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      {recomendaciones.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recomendaciones
            </Typography>
            {recomendaciones.map((rec, index) => (
              <Alert 
                key={index} 
                severity={rec.tipo} 
                sx={{ mb: index < recomendaciones.length - 1 ? 1 : 0 }}
              >
                {rec.mensaje}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Medidas básicas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medidas Básicas
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Peso</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.peso)} kg
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Altura</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.altura)} cm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>IMC</strong></TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {formatearNumero(medicion.imc)}
                          </Typography>
                          {imcInfo.categoria && (
                            <Chip
                              label={imcInfo.categoria}
                              color={imcInfo.color}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Composición corporal */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Composición Corporal
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Grasa corporal</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.grasa_corporal)}%
                        {medicion.grasa_corporal_kg && (
                          <Typography variant="caption" display="block">
                            ({formatearNumero(medicion.grasa_corporal_kg)} kg)
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Masa muscular</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.musculo)} kg
                        {medicion.musculo_porcentaje && (
                          <Typography variant="caption" display="block">
                            ({formatearNumero(medicion.musculo_porcentaje)}%)
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Agua corporal</strong></TableCell>
                      <TableCell align="right">
                        {medicion.agua_corporal ? `${formatearNumero(medicion.agua_corporal)} kg` : '-'}
                        {medicion.agua_corporal_porcentaje && (
                          <Typography variant="caption" display="block">
                            ({formatearNumero(medicion.agua_corporal_porcentaje)}%)
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Masa ósea</strong></TableCell>
                      <TableCell align="right">
                        {medicion.masa_osea ? `${formatearNumero(medicion.masa_osea)} kg` : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Grasa visceral</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.grasa_visceral)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Perímetros */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Perímetros (cm)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Cintura</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.perimetro_cintura)} cm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Cadera</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.perimetro_cadera)} cm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Brazo derecho</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.perimetro_brazo_derecho)} cm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Brazo izquierdo</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.perimetro_brazo_izquierdo)} cm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Muslo derecho</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.perimetro_muslo_derecho)} cm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Muslo izquierdo</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.perimetro_muslo_izquierdo)} cm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Cuello</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.perimetro_cuello)} cm
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pliegues cutáneos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pliegues Cutáneos (mm)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Bicipital</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.pliegue_bicipital)} mm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Tricipital</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.pliegue_tricipital)} mm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Subescapular</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.pliegue_subescapular)} mm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Suprailíaco</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.pliegue_suprailiaco)} mm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Abdominal</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.pliegue_abdominal)} mm
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Muslo</strong></TableCell>
                      <TableCell align="right">
                        {formatearNumero(medicion.pliegue_muslo)} mm
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Datos adicionales */}
        {(medicion.metabolismo_basal || medicion.edad_metabolica || medicion.puntuacion_corporal) && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Datos Adicionales
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {medicion.metabolismo_basal && (
                        <TableRow>
                          <TableCell><strong>Metabolismo basal</strong></TableCell>
                          <TableCell align="right">
                            {medicion.metabolismo_basal} kcal
                          </TableCell>
                        </TableRow>
                      )}
                      {medicion.edad_metabolica && (
                        <TableRow>
                          <TableCell><strong>Edad metabólica</strong></TableCell>
                          <TableCell align="right">
                            {medicion.edad_metabolica} años
                          </TableCell>
                        </TableRow>
                      )}
                      {medicion.puntuacion_corporal && (
                        <TableRow>
                          <TableCell><strong>Puntuación corporal</strong></TableCell>
                          <TableCell align="right">
                            {medicion.puntuacion_corporal} puntos
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Observaciones */}
        {medicion.observaciones && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Observaciones
                </Typography>
                <Typography variant="body1">
                  {medicion.observaciones}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default VerMedicion;
