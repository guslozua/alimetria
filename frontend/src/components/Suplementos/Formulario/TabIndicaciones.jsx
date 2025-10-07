import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TabIndicaciones = ({ indicaciones, onChange }) => {
  const agregarIndicacion = () => {
    onChange([
      ...indicaciones,
      {
        indicacion: '',
        perfil_paciente: '',
        nivel_recomendacion: 'media',
        notas_adicionales: ''
      }
    ]);
  };

  const eliminarIndicacion = (index) => {
    onChange(indicaciones.filter((_, i) => i !== index));
  };

  const actualizarIndicacion = (index, campo, valor) => {
    const nuevasIndicaciones = [...indicaciones];
    nuevasIndicaciones[index] = {
      ...nuevasIndicaciones[index],
      [campo]: valor
    };
    onChange(nuevasIndicaciones);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Indicaciones Terapéuticas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ¿Para qué pacientes está indicado este suplemento?
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={agregarIndicacion}
          sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}
        >
          Agregar Indicación
        </Button>
      </Box>

      {indicaciones.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography>No hay indicaciones agregadas</Typography>
          <Typography variant="body2">
            Haga clic en "Agregar Indicación" para comenzar
          </Typography>
        </Box>
      ) : (
        indicaciones.map((indicacion, index) => (
          <Card key={index} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Indicación {index + 1}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => eliminarIndicacion(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Indicación"
                    value={indicacion.indicacion}
                    onChange={(e) => actualizarIndicacion(index, 'indicacion', e.target.value)}
                    placeholder="Ej: Hipercolesterolemia, Diabetes tipo 2"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Perfil del Paciente"
                    value={indicacion.perfil_paciente}
                    onChange={(e) => actualizarIndicacion(index, 'perfil_paciente', e.target.value)}
                    placeholder="Ej: Adultos con colesterol LDL >160 mg/dL"
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Nivel de Recomendación</InputLabel>
                    <Select
                      value={indicacion.nivel_recomendacion}
                      onChange={(e) => actualizarIndicacion(index, 'nivel_recomendacion', e.target.value)}
                      label="Nivel de Recomendación"
                    >
                      <MenuItem value="alta">Alta - Fuertemente recomendado</MenuItem>
                      <MenuItem value="media">Media - Recomendado</MenuItem>
                      <MenuItem value="baja">Baja - Puede considerarse</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Notas Adicionales"
                    value={indicacion.notas_adicionales}
                    onChange={(e) => actualizarIndicacion(index, 'notas_adicionales', e.target.value)}
                    placeholder="Información complementaria"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default TabIndicaciones;
