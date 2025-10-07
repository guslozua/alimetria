import React from 'react';
import { Box, Typography, Button, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TabEfectosSecundarios = ({ efectos, onChange }) => {
  const agregar = () => onChange([...efectos, { efecto_secundario: '', frecuencia: 'poco_común', descripcion: '', manejo_recomendado: '' }]);
  const eliminar = (index) => onChange(efectos.filter((_, i) => i !== index));
  const actualizar = (index, campo, valor) => {
    const nuevos = [...efectos];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    onChange(nuevos);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Efectos Secundarios</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={agregar} sx={{ bgcolor: '#667eea' }}>Agregar</Button>
      </Box>
      {efectos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}><Typography>No hay efectos secundarios agregados</Typography></Box>
      ) : (
        efectos.map((efecto, index) => (
          <Card key={index} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" color="primary">Efecto {index + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => eliminar(index)}><DeleteIcon /></IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Efecto Secundario" value={efecto.efecto_secundario} onChange={(e) => actualizar(index, 'efecto_secundario', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frecuencia</InputLabel>
                    <Select value={efecto.frecuencia} onChange={(e) => actualizar(index, 'frecuencia', e.target.value)} label="Frecuencia">
                      <MenuItem value="muy_común">Muy Común</MenuItem>
                      <MenuItem value="común">Común</MenuItem>
                      <MenuItem value="poco_común">Poco Común</MenuItem>
                      <MenuItem value="raro">Raro</MenuItem>
                      <MenuItem value="muy_raro">Muy Raro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Descripción" value={efecto.descripcion} onChange={(e) => actualizar(index, 'descripcion', e.target.value)} multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Manejo Recomendado" value={efecto.manejo_recomendado} onChange={(e) => actualizar(index, 'manejo_recomendado', e.target.value)} multiline rows={2} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default TabEfectosSecundarios;
