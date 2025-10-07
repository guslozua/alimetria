import React from 'react';
import { Box, Typography, Button, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TabContraindicaciones = ({ contraindicaciones, onChange }) => {
  const agregar = () => {
    onChange([...contraindicaciones, { tipo: 'precaucion', descripcion: '', poblacion_afectada: '', severidad: 'media' }]);
  };

  const eliminar = (index) => onChange(contraindicaciones.filter((_, i) => i !== index));

  const actualizar = (index, campo, valor) => {
    const nuevas = [...contraindicaciones];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    onChange(nuevas);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Contraindicaciones y Precauciones</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={agregar} sx={{ bgcolor: '#667eea' }}>Agregar</Button>
      </Box>

      {contraindicaciones.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography>No hay contraindicaciones agregadas</Typography>
        </Box>
      ) : (
        contraindicaciones.map((item, index) => (
          <Card key={index} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" color="primary">Contraindicación {index + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => eliminar(index)}><DeleteIcon /></IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select value={item.tipo} onChange={(e) => actualizar(index, 'tipo', e.target.value)} label="Tipo">
                      <MenuItem value="contraindicacion">Contraindicación</MenuItem>
                      <MenuItem value="precaucion">Precaución</MenuItem>
                      <MenuItem value="advertencia">Advertencia</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Severidad</InputLabel>
                    <Select value={item.severidad} onChange={(e) => actualizar(index, 'severidad', e.target.value)} label="Severidad">
                      <MenuItem value="alta">Alta</MenuItem>
                      <MenuItem value="media">Media</MenuItem>
                      <MenuItem value="baja">Baja</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Población Afectada" value={item.poblacion_afectada} onChange={(e) => actualizar(index, 'poblacion_afectada', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth required label="Descripción" value={item.descripcion} onChange={(e) => actualizar(index, 'descripcion', e.target.value)} multiline rows={3} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default TabContraindicaciones;
