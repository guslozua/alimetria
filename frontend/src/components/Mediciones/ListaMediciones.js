import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  CameraAlt as InBodyIcon
} from '@mui/icons-material';
import { SectionTitle, InfoText, MetaText } from '../Common/TypographyHelpers';
import { medicionesService } from '../../services/medicionesService';
import { formatearFecha, formatearNumero } from '../../utils/formatters';

const ListaMediciones = ({ pacienteId, pacienteNombre, soloLectura = false }) => {
  const navigate = useNavigate();
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pacienteId) {
      cargarMediciones();
    }
  }, [pacienteId]);

  const cargarMediciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicionesService.getMedicionesPorPaciente(pacienteId);
      setMediciones(response.data || []);
    } catch (error) {
      setError('Error al cargar las mediciones');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaMedicion = () => {
    navigate(`/mediciones/nueva/${pacienteId}`);
  };

  const handleMedicionInBody = () => {
    navigate(`/mediciones/inbody/${pacienteId}`);
  };

  const handleVerMedicion = (medicionId) => {
    navigate(`/mediciones/ver/${medicionId}`);
  };

  const handleEditarMedicion = (medicionId) => {
    navigate(`/mediciones/editar/${medicionId}`);
  };

  const handleEliminarMedicion = async (medicionId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta medición?')) {
      try {
        await medicionesService.eliminarMedicion(medicionId);
        await cargarMediciones(); // Recargar la lista
      } catch (error) {
        setError('Error al eliminar la medición');
        console.error('Error:', error);
      }
    }
  };

  const handleVerEvolucion = () => {
    navigate(`/mediciones/evolucion/${pacienteId}`);
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
    if (!imc) return '';
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  };

  const getIMCColor = (imc) => {
    if (!imc) return 'default';
    if (imc < 18.5) return 'info';
    if (imc < 25) return 'success';
    if (imc < 30) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Mediciones - {pacienteNombre}
          </Typography>
          <Box>
            {mediciones.length > 0 && (
              <Tooltip title="Ver evolución">
                <IconButton 
                  color="primary" 
                  onClick={handleVerEvolucion}
                  sx={{ mr: 1 }}
                >
                  <AssessmentIcon />
                </IconButton>
              </Tooltip>
            )}
            {!soloLectura && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<InBodyIcon />}
                  onClick={handleMedicionInBody}
                  color="success"
                  sx={{ mr: 1 }}
                >
                  Medición InBody
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNuevaMedicion}
                  color="primary"
                >
                  Nueva Medición
                </Button>
              </>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {mediciones.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              No hay mediciones registradas para este paciente
            </Typography>
            {!soloLectura && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<InBodyIcon />}
                  onClick={handleMedicionInBody}
                  color="success"
                  sx={{ mt: 2, mr: 2 }}
                >
                  Medición InBody
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleNuevaMedicion}
                  sx={{ mt: 2 }}
                >
                  Registrar Primera Medición
                </Button>
              </>
            )}
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Peso (kg)</TableCell>
                  <TableCell align="right">IMC</TableCell>
                  <TableCell align="right">% Grasa</TableCell>
                  <TableCell align="right">Músculo (kg)</TableCell>
                  <TableCell>Observaciones</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mediciones.map((medicion) => (
                  <TableRow key={medicion.id} hover>
                    <TableCell>
                      {formatearFecha(medicion.fecha_medicion)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={medicion.tipo}
                        color={getTipoChipColor(medicion.tipo)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatearNumero(medicion.peso)}
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography variant="body2">
                          {formatearNumero(medicion.imc)}
                        </Typography>
                        {medicion.imc && (
                          <Chip
                            label={getIMCCategoria(medicion.imc)}
                            color={getIMCColor(medicion.imc)}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatearNumero(medicion.grasa_corporal)}
                    </TableCell>
                    <TableCell align="right">
                      {formatearNumero(medicion.musculo)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {medicion.observaciones || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            size="small" 
                            onClick={() => handleVerMedicion(medicion.id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {!soloLectura && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditarMedicion(medicion.id)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Historial">
                              <IconButton 
                                size="small" 
                                onClick={() => navigate(`/mediciones/historial/${medicion.id}`)}
                              >
                                <HistoryIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleEliminarMedicion(medicion.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ListaMediciones;
