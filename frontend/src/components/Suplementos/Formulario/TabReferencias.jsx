import React from 'react';
import { Box, Typography, Button, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TabReferencias = ({ referencias, onChange }) => {
  const agregar = () => onChange([...referencias, { titulo_estudio: '', autores: '', revista_publicacion: '', año_publicacion: '', tipo_estudio: 'observacional', url_referencia: '', resumen_hallazgos: '', calidad_evidencia: 'moderada' }]);
  const eliminar = (index) => onChange(referencias.filter((_, i) => i !== index));
  const actualizar = (index, campo, valor) => {
    const nuevas = [...referencias];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    onChange(nuevas);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Referencias Científicas</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={agregar} sx={{ bgcolor: '#667eea' }}>Agregar</Button>
      </Box>
      {referencias.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}><Typography>No hay referencias agregadas</Typography></Box>
      ) : (
        referencias.map((ref, index) => (
          <Card key={index} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" color="primary">Referencia {index + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => eliminar(index)}><DeleteIcon /></IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Título del Estudio" value={ref.titulo_estudio} onChange={(e) => actualizar(index, 'titulo_estudio', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Autores" value={ref.autores} onChange={(e) => actualizar(index, 'autores', e.target.value)} placeholder="Apellido A, Apellido B, et al." />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Revista" value={ref.revista_publicacion} onChange={(e) => actualizar(index, 'revista_publicacion', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth label="Año" type="number" value={ref.año_publicacion} onChange={(e) => actualizar(index, 'año_publicacion', e.target.value)} inputProps={{ min: 1900, max: new Date().getFullYear() }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Estudio</InputLabel>
                    <Select value={ref.tipo_estudio} onChange={(e) => actualizar(index, 'tipo_estudio', e.target.value)} label="Tipo de Estudio">
                      <MenuItem value="ensayo_clinico">Ensayo Clínico</MenuItem>
                      <MenuItem value="revision_sistematica">Revisión Sistemática</MenuItem>
                      <MenuItem value="meta_analisis">Meta-análisis</MenuItem>
                      <MenuItem value="observacional">Observacional</MenuItem>
                      <MenuItem value="caso_control">Caso Control</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Calidad de Evidencia</InputLabel>
                    <Select value={ref.calidad_evidencia} onChange={(e) => actualizar(index, 'calidad_evidencia', e.target.value)} label="Calidad de Evidencia">
                      <MenuItem value="alta">Alta</MenuItem>
                      <MenuItem value="moderada">Moderada</MenuItem>
                      <MenuItem value="baja">Baja</MenuItem>
                      <MenuItem value="muy_baja">Muy Baja</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="URL / Link" value={ref.url_referencia} onChange={(e) => actualizar(index, 'url_referencia', e.target.value)} placeholder="https://..." />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Resumen de Hallazgos" value={ref.resumen_hallazgos} onChange={(e) => actualizar(index, 'resumen_hallazgos', e.target.value)} multiline rows={3} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default TabReferencias;
