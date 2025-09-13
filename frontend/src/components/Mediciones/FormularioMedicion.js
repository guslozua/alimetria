import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  CameraAlt as InBodyIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { medicionesService } from '../../services/medicionesService';
import { pacientesService } from '../../services/pacientesService';

const FormularioMedicion = () => {
  const navigate = useNavigate();
  const { pacienteId, medicionId } = useParams();
  const esEdicion = Boolean(medicionId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paciente, setPaciente] = useState(null);
  
  const [formData, setFormData] = useState({
    paciente_id: pacienteId || '',
    fecha_medicion: new Date(),
    tipo: 'manual',
    peso: '',
    altura: '',
    imc: '',
    grasa_corporal: '',
    grasa_corporal_kg: '',
    musculo: '',
    musculo_porcentaje: '',
    agua_corporal: '',
    agua_corporal_porcentaje: '',
    masa_osea: '',
    perimetro_cintura: '',
    perimetro_cadera: '',
    perimetro_brazo_derecho: '',
    perimetro_brazo_izquierdo: '',
    perimetro_muslo_derecho: '',
    perimetro_muslo_izquierdo: '',
    perimetro_cuello: '',
    pliegue_bicipital: '',
    pliegue_tricipital: '',
    pliegue_subescapular: '',
    pliegue_suprailiaco: '',
    pliegue_abdominal: '',
    pliegue_muslo: '',
    grasa_visceral: '',
    metabolismo_basal: '',
    edad_metabolica: '',
    puntuacion_corporal: '',
    observaciones: ''
  });

  // Función para normalizar valores - convertir null/undefined a string vacío
  const normalizarValor = (valor) => {
    return valor === null || valor === undefined ? '' : String(valor);
  };

  useEffect(() => {
    if (pacienteId) {
      cargarPaciente();
    }
    if (esEdicion && medicionId) {
      cargarMedicion();
    }
  }, [pacienteId, medicionId]);

  // Calcular IMC automáticamente
  useEffect(() => {
    if (formData.peso && formData.altura) {
      const peso = parseFloat(formData.peso);
      const altura = parseFloat(formData.altura);
      
      if (peso > 0 && altura > 0) {
        const alturaMetros = altura > 10 ? altura / 100 : altura;
        const imc = peso / (alturaMetros * alturaMetros);
        setFormData(prev => ({
          ...prev,
          imc: imc.toFixed(2)
        }));
      }
    }
  }, [formData.peso, formData.altura]);

  const cargarPaciente = async () => {
    try {
      const response = await pacientesService.getPaciente(pacienteId);
      setPaciente(response.data);
    } catch (error) {
      setError('Error al cargar los datos del paciente');
    }
  };

  const cargarMedicion = async () => {
    try {
      setLoading(true);
      const response = await medicionesService.getMedicion(medicionId);
      const medicion = response.data;
      
      // Normalizar todos los valores para evitar null/undefined en inputs
      const medicionNormalizada = {
        paciente_id: normalizarValor(medicion.paciente_id),
        fecha_medicion: new Date(medicion.fecha_medicion),
        tipo: normalizarValor(medicion.tipo) || 'manual',
        peso: normalizarValor(medicion.peso),
        altura: normalizarValor(medicion.altura),
        imc: normalizarValor(medicion.imc),
        grasa_corporal: normalizarValor(medicion.grasa_corporal),
        grasa_corporal_kg: normalizarValor(medicion.grasa_corporal_kg),
        musculo: normalizarValor(medicion.musculo),
        musculo_porcentaje: normalizarValor(medicion.musculo_porcentaje),
        agua_corporal: normalizarValor(medicion.agua_corporal),
        agua_corporal_porcentaje: normalizarValor(medicion.agua_corporal_porcentaje),
        masa_osea: normalizarValor(medicion.masa_osea),
        perimetro_cintura: normalizarValor(medicion.perimetro_cintura),
        perimetro_cadera: normalizarValor(medicion.perimetro_cadera),
        perimetro_brazo_derecho: normalizarValor(medicion.perimetro_brazo_derecho),
        perimetro_brazo_izquierdo: normalizarValor(medicion.perimetro_brazo_izquierdo),
        perimetro_muslo_derecho: normalizarValor(medicion.perimetro_muslo_derecho),
        perimetro_muslo_izquierdo: normalizarValor(medicion.perimetro_muslo_izquierdo),
        perimetro_cuello: normalizarValor(medicion.perimetro_cuello),
        pliegue_bicipital: normalizarValor(medicion.pliegue_bicipital),
        pliegue_tricipital: normalizarValor(medicion.pliegue_tricipital),
        pliegue_subescapular: normalizarValor(medicion.pliegue_subescapular),
        pliegue_suprailiaco: normalizarValor(medicion.pliegue_suprailiaco),
        pliegue_abdominal: normalizarValor(medicion.pliegue_abdominal),
        pliegue_muslo: normalizarValor(medicion.pliegue_muslo),
        grasa_visceral: normalizarValor(medicion.grasa_visceral),
        metabolismo_basal: normalizarValor(medicion.metabolismo_basal),
        edad_metabolica: normalizarValor(medicion.edad_metabolica),
        puntuacion_corporal: normalizarValor(medicion.puntuacion_corporal),
        observaciones: normalizarValor(medicion.observaciones)
      };
      
      console.log('Medición cargada y normalizada:', medicionNormalizada);
      setFormData(medicionNormalizada);
    } catch (error) {
      console.error('Error al cargar medición:', error);
      setError('Error al cargar la medición');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      fecha_medicion: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const datosAEnviar = {
        ...formData,
        fecha_medicion: formData.fecha_medicion.toISOString(),
        usuario_id: 1
      };

      console.log('Enviando datos:', datosAEnviar);
      console.log('Es edición:', esEdicion);
      console.log('PacienteId param:', pacienteId);
      console.log('PacienteId formData:', formData.paciente_id);

      if (esEdicion) {
        await medicionesService.actualizarMedicion(medicionId, datosAEnviar);
        console.log('Medición actualizada exitosamente');
      } else {
        await medicionesService.crearMedicion(datosAEnviar);
        console.log('Medición creada exitosamente');
      }

      // CORREGIDO: Usar formData.paciente_id en lugar de pacienteId
      const idPacienteParaNavegar = formData.paciente_id || pacienteId;
      console.log('Navegando a paciente:', idPacienteParaNavegar);
      
      if (idPacienteParaNavegar) {
        navigate(`/pacientes/${idPacienteParaNavegar}`);
      } else {
        console.error('No se pudo determinar el ID del paciente para navegar');
        navigate('/pacientes'); // Fallback a lista de pacientes
      }
    } catch (error) {
      console.error('Error al guardar medición:', error);
      setError(error.response?.data?.message || 'Error al guardar la medición');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // CORREGIDO: Usar formData.paciente_id en lugar de pacienteId
    const idPacienteParaNavegar = formData.paciente_id || pacienteId;
    console.log('Cancelando - Navegando a paciente:', idPacienteParaNavegar);
    
    if (idPacienteParaNavegar) {
      navigate(`/pacientes/${idPacienteParaNavegar}`);
    } else {
      navigate('/pacientes'); // Fallback a lista de pacientes
    }
  };

  if (loading && esEdicion) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {esEdicion ? 'Editar Medición' : 'Nueva Medición'}
          {paciente && ` - ${paciente.nombre} ${paciente.apellido}`}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Información Básica */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Información Básica
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <DateTimePicker
                        label="Fecha y Hora de Medición"
                        value={formData.fecha_medicion}
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            fullWidth: true
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Medición</InputLabel>
                        <Select
                          name="tipo"
                          value={formData.tipo}
                          onChange={handleChange}
                          label="Tipo de Medición"
                        >
                          <MenuItem value="manual">Manual</MenuItem>
                          <MenuItem value="inbody">InBody</MenuItem>
                          <MenuItem value="mixta">Mixta</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Mediciones Básicas */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Mediciones Básicas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        name="peso"
                        label="Peso (kg)"
                        type="number"
                        value={formData.peso}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        name="altura"
                        label="Altura (cm)"
                        type="number"
                        value={formData.altura}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        name="imc"
                        label="IMC"
                        type="number"
                        value={formData.imc}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: 0.01 }}
                        helperText="Se calcula automáticamente"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Composición Corporal */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Composición Corporal</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="grasa_corporal"
                            label="Grasa Corporal (%)"
                            type="number"
                            value={formData.grasa_corporal}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="grasa_corporal_kg"
                            label="Grasa Corporal (kg)"
                            type="number"
                            value={formData.grasa_corporal_kg}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="musculo"
                            label="Músculo (kg)"
                            type="number"
                            value={formData.musculo}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="musculo_porcentaje"
                            label="Músculo (%)"
                            type="number"
                            value={formData.musculo_porcentaje}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="agua_corporal"
                            label="Agua Corporal (kg)"
                            type="number"
                            value={formData.agua_corporal}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="agua_corporal_porcentaje"
                            label="Agua Corporal (%)"
                            type="number"
                            value={formData.agua_corporal_porcentaje}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="masa_osea"
                            label="Masa Ósea (kg)"
                            type="number"
                            value={formData.masa_osea}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="grasa_visceral"
                            label="Grasa Visceral"
                            type="number"
                            value={formData.grasa_visceral}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Perímetros */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Perímetros (cm)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="perimetro_cintura"
                            label="Cintura"
                            type="number"
                            value={formData.perimetro_cintura}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="perimetro_cadera"
                            label="Cadera"
                            type="number"
                            value={formData.perimetro_cadera}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="perimetro_cuello"
                            label="Cuello"
                            type="number"
                            value={formData.perimetro_cuello}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="perimetro_brazo_derecho"
                            label="Brazo Derecho"
                            type="number"
                            value={formData.perimetro_brazo_derecho}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="perimetro_brazo_izquierdo"
                            label="Brazo Izquierdo"
                            type="number"
                            value={formData.perimetro_brazo_izquierdo}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="perimetro_muslo_derecho"
                            label="Muslo Derecho"
                            type="number"
                            value={formData.perimetro_muslo_derecho}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="perimetro_muslo_izquierdo"
                            label="Muslo Izquierdo"
                            type="number"
                            value={formData.perimetro_muslo_izquierdo}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Pliegues */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Pliegues (mm)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="pliegue_bicipital"
                            label="Bicipital"
                            type="number"
                            value={formData.pliegue_bicipital}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="pliegue_tricipital"
                            label="Tricipital"
                            type="number"
                            value={formData.pliegue_tricipital}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="pliegue_subescapular"
                            label="Subescapular"
                            type="number"
                            value={formData.pliegue_subescapular}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="pliegue_suprailiaco"
                            label="Suprailiaco"
                            type="number"
                            value={formData.pliegue_suprailiaco}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="pliegue_abdominal"
                            label="Abdominal"
                            type="number"
                            value={formData.pliegue_abdominal}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            name="pliegue_muslo"
                            label="Muslo"
                            type="number"
                            value={formData.pliegue_muslo}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ step: 0.1 }}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Otros Valores */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Otros Valores</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            name="metabolismo_basal"
                            label="Metabolismo Basal (kcal)"
                            type="number"
                            value={formData.metabolismo_basal}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            name="edad_metabolica"
                            label="Edad Metabólica"
                            type="number"
                            value={formData.edad_metabolica}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            name="puntuacion_corporal"
                            label="Puntuación Corporal"
                            type="number"
                            value={formData.puntuacion_corporal}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Observaciones */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Observaciones
                  </Typography>
                  <TextField
                    name="observaciones"
                    label="Observaciones"
                    multiline
                    rows={4}
                    value={formData.observaciones}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Comentarios, observaciones o notas adicionales..."
                  />
                </Grid>

                {/* Botones */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Guardar')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default FormularioMedicion;