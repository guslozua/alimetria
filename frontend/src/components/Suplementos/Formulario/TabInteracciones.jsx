import React from 'react';
import { Box, Typography, Button, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TabInteracciones = ({ interacciones, onChange }) => {
  const agregar = () => onChange([...interacciones, { tipo_interaccion: 'medicamento', nombre_interaccion: '', descripcion_interaccion: '', severidad: 'moderada', recomendacion: '' }]);
  const eliminar = (index) => onChange(interacciones.filter((_, i) => i !== index));
  const actualizar = (index, campo, valor) => {
    const nuevas = [...interacciones];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    onChange(nuevas);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Interacciones</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={agregar} sx={{ bgcolor: '#667eea' }}>Agregar</Button>
      </Box>
      {interacciones.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}><Typography>No hay interacciones agregadas</Typography></Box>
      ) : (
        interacciones.map((inter, index) => (
          <Card key={index} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" color="primary">Interacción {index + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => eliminar(index)}><DeleteIcon /></IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select value={inter.tipo_interaccion} onChange={(e) => actualizar(index, 'tipo_interaccion', e.target.value)} label="Tipo">
                      <MenuItem value="medicamento">Medicamento</MenuItem>
                      <MenuItem value="suplemento">Suplemento</MenuItem>
                      <MenuItem value="alimento">Alimento</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth required label="Nombre" value={inter.nombre_interaccion} onChange={(e) => actualizar(index, 'nombre_interaccion', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Severidad</InputLabel>
                    <Select value={inter.severidad} onChange={(e) => actualizar(index, 'severidad', e.target.value)} label="Severidad">
                      <MenuItem value="grave">Grave</MenuItem>
                      <MenuItem value="moderada">Moderada</MenuItem>
                      <MenuItem value="leve">Leve</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Descripción de la Interacción" value={inter.descripcion_interaccion} onChange={(e) => actualizar(index, 'descripcion_interaccion', e.target.value)} multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Recomendación" value={inter.recomendacion} onChange={(e) => actualizar(index, 'recomendacion', e.target.value)} multiline rows={2} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default TabInteracciones;
