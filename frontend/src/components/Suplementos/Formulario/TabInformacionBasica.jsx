import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TabInformacionBasica = ({ datos, onChange, categorias }) => {
  const handleChange = (field) => (event) => {
    onChange({
      ...datos,
      [field]: event.target.value
    });
  };

  const handleBeneficioChange = (index, valor) => {
    const nuevosBeneficios = [...datos.beneficios_principales];
    nuevosBeneficios[index] = valor;
    onChange({
      ...datos,
      beneficios_principales: nuevosBeneficios
    });
  };

  const agregarBeneficio = () => {
    onChange({
      ...datos,
      beneficios_principales: [...datos.beneficios_principales, '']
    });
  };

  const eliminarBeneficio = (index) => {
    const nuevosBeneficios = datos.beneficios_principales.filter((_, i) => i !== index);
    onChange({
      ...datos,
      beneficios_principales: nuevosBeneficios.length > 0 ? nuevosBeneficios : ['']
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Información General del Suplemento
      </Typography>

      <Grid container spacing={3}>
        {/* Nombre - OBLIGATORIO */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Nombre del Suplemento"
            value={datos.nombre}
            onChange={handleChange('nombre')}
            placeholder="Ej: Omega 3, Vitamina D3"
          />
        </Grid>

        {/* Nombre Científico */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nombre Científico"
            value={datos.nombre_cientifico}
            onChange={handleChange('nombre_cientifico')}
            placeholder="Ej: Cholecalciferol, Ascorbic Acid"
          />
        </Grid>

        {/* Categoría - OBLIGATORIA */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={datos.categoria_id}
              onChange={handleChange('categoria_id')}
              label="Categoría"
            >
              {categorias?.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Forma de Presentación */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Forma de Presentación</InputLabel>
            <Select
              value={datos.forma_presentacion}
              onChange={handleChange('forma_presentacion')}
              label="Forma de Presentación"
            >
              <MenuItem value="cápsula">Cápsula</MenuItem>
              <MenuItem value="tableta">Tableta</MenuItem>
              <MenuItem value="polvo">Polvo</MenuItem>
              <MenuItem value="líquido">Líquido</MenuItem>
              <MenuItem value="goma">Goma</MenuItem>
              <MenuItem value="inyectable">Inyectable</MenuItem>
              <MenuItem value="tópico">Tópico</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Descripción Corta */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción Corta"
            value={datos.descripcion_corta}
            onChange={handleChange('descripcion_corta')}
            placeholder="Breve descripción del suplemento (máx. 255 caracteres)"
            multiline
            rows={2}
            inputProps={{ maxLength: 255 }}
            helperText={`${datos.descripcion_corta.length}/255 caracteres`}
          />
        </Grid>

        {/* Descripción Detallada */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción Detallada"
            value={datos.descripcion_detallada}
            onChange={handleChange('descripcion_detallada')}
            placeholder="Descripción completa sobre qué es el suplemento, cómo funciona, etc."
            multiline
            rows={4}
          />
        </Grid>

        {/* Para Qué Sirve */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="¿Para Qué Sirve?"
            value={datos.para_que_sirve}
            onChange={handleChange('para_que_sirve')}
            placeholder="Perfil de pacientes que pueden beneficiarse"
            multiline
            rows={3}
          />
        </Grid>

        {/* Beneficios Principales */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Beneficios Principales
            </Typography>
            <IconButton color="primary" size="small" onClick={agregarBeneficio}>
              <AddIcon />
            </IconButton>
          </Box>
          {datos.beneficios_principales.map((beneficio, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder={`Beneficio ${index + 1}`}
                value={beneficio}
                onChange={(e) => handleBeneficioChange(index, e.target.value)}
              />
              {datos.beneficios_principales.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => eliminarBeneficio(index)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
        </Grid>

        {/* Dosis */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Información de Dosis
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Dosis Mínima"
            value={datos.dosis_minima}
            onChange={handleChange('dosis_minima')}
            placeholder="Ej: 1 gramo"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Dosis Recomendada"
            value={datos.dosis_recomendada}
            onChange={handleChange('dosis_recomendada')}
            placeholder="Ej: 2-3 gramos por día"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Dosis Máxima"
            value={datos.dosis_maxima}
            onChange={handleChange('dosis_maxima')}
            placeholder="Ej: 5 gramos"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Frecuencia Recomendada"
            value={datos.frecuencia_recomendada}
            onChange={handleChange('frecuencia_recomendada')}
            placeholder="Ej: 1-2 veces al día"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Mejor Momento de Toma"
            value={datos.mejor_momento_toma}
            onChange={handleChange('mejor_momento_toma')}
            placeholder="Ej: Con las comidas principales"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Duración Típica del Tratamiento"
            value={datos.duracion_tratamiento_tipica}
            onChange={handleChange('duracion_tratamiento_tipica')}
            placeholder="Ej: Uso continuo, 3-6 meses"
          />
        </Grid>

        {/* Nivel de Evidencia */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Nivel de Evidencia Científica</InputLabel>
            <Select
              value={datos.nivel_evidencia}
              onChange={handleChange('nivel_evidencia')}
              label="Nivel de Evidencia Científica"
            >
              <MenuItem value="alta">Alta - Múltiples estudios de calidad</MenuItem>
              <MenuItem value="media">Media - Algunos estudios</MenuItem>
              <MenuItem value="baja">Baja - Evidencia limitada</MenuItem>
              <MenuItem value="experimental">Experimental - En investigación</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Destacado */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={datos.destacado}
                onChange={(e) => onChange({ ...datos, destacado: e.target.checked })}
              />
            }
            label="Marcar como destacado"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TabInformacionBasica;
