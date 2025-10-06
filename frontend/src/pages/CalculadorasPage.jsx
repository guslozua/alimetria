import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  FitnessCenter as FitnessCenterIcon,
  Restaurant as RestaurantIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';
import { IMCScale, ICCScale } from '../components/Calculadoras';

const CalculadorasPage = () => {
  const { darkMode } = useThemeMode();
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para IMC
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultadoIMC, setResultadoIMC] = useState(null);
  
  // Estados para TMB/GET
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [actividadFisica, setActividadFisica] = useState('');
  const [resultadoTMB, setResultadoTMB] = useState(null);
  
  // Estados para agua diaria
  const [pesoAgua, setPesoAgua] = useState('');
  const [nivelActividad, setNivelActividad] = useState('');
  const [resultadoAgua, setResultadoAgua] = useState(null);
  
  // Estados para ICC (Índice Cintura/Cadera)
  const [cintura, setCintura] = useState('');
  const [cadera, setCadera] = useState('');
  const [sexoICC, setSexoICC] = useState('');
  const [resultadoICC, setResultadoICC] = useState(null);
  
  // Estados para Calculadora de Macros
  const [pesoMacros, setPesoMacros] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [resultadoMacros, setResultadoMacros] = useState(null);
  
  // Estados para Peso Ideal
  const [alturaPesoIdeal, setAlturaPesoIdeal] = useState('');
  const [sexoPesoIdeal, setSexoPesoIdeal] = useState('');
  const [resultadoPesoIdeal, setResultadoPesoIdeal] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculadora IMC
  const calcularIMC = () => {
    if (peso && altura) {
      const alturaEnMetros = altura / 100;
      const imc = peso / (alturaEnMetros * alturaEnMetros);
      
      let categoria = '';
      let color = '';
      if (imc < 18.5) {
        categoria = 'Bajo peso';
        color = '#3b82f6';
      } else if (imc < 25) {
        categoria = 'Peso normal';
        color = '#10b981';
      } else if (imc < 30) {
        categoria = 'Sobrepeso';
        color = '#f59e0b';
      } else {
        categoria = 'Obesidad';
        color = '#ef4444';
      }
      
      setResultadoIMC({
        valor: imc.toFixed(1),
        categoria,
        color
      });
    }
  };

  // Calculadora TMB/GET
  const calcularTMB = () => {
    if (peso && altura && edad && sexo) {
      let tmb;
      if (sexo === 'M') {
        tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
      } else {
        tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad);
      }
      
      const factoresActividad = {
        'sedentario': 1.2,
        'ligero': 1.375,
        'moderado': 1.55,
        'intenso': 1.725,
        'muy_intenso': 1.9
      };
      
      const get = tmb * (factoresActividad[actividadFisica] || 1.2);
      
      setResultadoTMB({
        tmb: Math.round(tmb),
        get: Math.round(get)
      });
    }
  };

  // Calculadora agua diaria
  const calcularAgua = () => {
    if (pesoAgua) {
      let aguaBase = pesoAgua * 35; // 35ml por kg de peso
      
      const factoresActividad = {
        'bajo': 1,
        'moderado': 1.2,
        'alto': 1.5
      };
      
      const aguaTotal = aguaBase * (factoresActividad[nivelActividad] || 1);
      
      setResultadoAgua({
        litros: (aguaTotal / 1000).toFixed(1),
        ml: Math.round(aguaTotal)
      });
    }
  };
  
  // Calculadora ICC (Índice Cintura/Cadera)
  const calcularICC = () => {
    if (cintura && cadera && sexoICC) {
      const icc = (cintura / cadera).toFixed(2);
      
      let categoria = '';
      let riesgo = '';
      let color = '';
      
      if (sexoICC === 'M') {
        if (icc < 0.95) {
          categoria = 'Bajo';
          riesgo = 'Riesgo bajo';
          color = '#10b981';
        } else if (icc < 1.0) {
          categoria = 'Moderado';
          riesgo = 'Riesgo moderado';
          color = '#f59e0b';
        } else {
          categoria = 'Alto';
          riesgo = 'Riesgo alto';
          color = '#ef4444';
        }
      } else {
        if (icc < 0.80) {
          categoria = 'Bajo';
          riesgo = 'Riesgo bajo';
          color = '#10b981';
        } else if (icc < 0.85) {
          categoria = 'Moderado';
          riesgo = 'Riesgo moderado';
          color = '#f59e0b';
        } else {
          categoria = 'Alto';
          riesgo = 'Riesgo alto';
          color = '#ef4444';
        }
      }
      
      setResultadoICC({
        valor: icc,
        categoria,
        riesgo,
        color
      });
    }
  };
  
  // Calculadora de Macros
  const calcularMacros = () => {
    if (pesoMacros && altura && edad && sexo && objetivo) {
      // Calcular TMB primero
      let tmb;
      if (sexo === 'M') {
        tmb = 88.362 + (13.397 * pesoMacros) + (4.799 * altura) - (5.677 * edad);
      } else {
        tmb = 447.593 + (9.247 * pesoMacros) + (3.098 * altura) - (4.330 * edad);
      }
      
      // Ajustar calorías según objetivo
      let calorias;
      let proteinasGrKg, grasasPorc, carbsPorc;
      
      switch(objetivo) {
        case 'perder':
          calorias = tmb * 1.2 * 0.8; // Déficit 20%
          proteinasGrKg = 2.0;
          grasasPorc = 25;
          carbsPorc = 45;
          break;
        case 'mantener':
          calorias = tmb * 1.375;
          proteinasGrKg = 1.6;
          grasasPorc = 25;
          carbsPorc = 50;
          break;
        case 'ganar':
          calorias = tmb * 1.55 * 1.1; // Superávit 10%
          proteinasGrKg = 2.2;
          grasasPorc = 25;
          carbsPorc = 50;
          break;
        default:
          calorias = tmb * 1.375;
          proteinasGrKg = 1.6;
          grasasPorc = 25;
          carbsPorc = 50;
      }
      
      const proteinas = Math.round(pesoMacros * proteinasGrKg);
      const grasas = Math.round((calorias * (grasasPorc / 100)) / 9);
      const carbohidratos = Math.round((calorias - (proteinas * 4) - (grasas * 9)) / 4);
      
      setResultadoMacros({
        calorias: Math.round(calorias),
        proteinas,
        carbohidratos,
        grasas,
        proteinasPorc: Math.round((proteinas * 4 / calorias) * 100),
        carbsPorc: Math.round((carbohidratos * 4 / calorias) * 100),
        grasasPorc: Math.round((grasas * 9 / calorias) * 100)
      });
    }
  };
  
  // Calculadora de Peso Ideal
  const calcularPesoIdeal = () => {
    if (alturaPesoIdeal && sexoPesoIdeal) {
      const alturaCm = parseFloat(alturaPesoIdeal);
      const alturaM = alturaCm / 100;
      const alturaPulgadas = alturaCm / 2.54;
      
      let devine, robinson, miller, hamwi;
      
      if (sexoPesoIdeal === 'M') {
        // Fórmulas para hombres
        devine = 50 + 2.3 * ((alturaPulgadas - 60));
        robinson = 52 + 1.9 * ((alturaPulgadas - 60));
        miller = 56.2 + 1.41 * ((alturaPulgadas - 60));
        hamwi = 48 + 2.7 * ((alturaPulgadas - 60));
      } else {
        // Fórmulas para mujeres
        devine = 45.5 + 2.3 * ((alturaPulgadas - 60));
        robinson = 49 + 1.7 * ((alturaPulgadas - 60));
        miller = 53.1 + 1.36 * ((alturaPulgadas - 60));
        hamwi = 45.5 + 2.2 * ((alturaPulgadas - 60));
      }
      
      // IMC rango saludable (18.5-24.9)
      const pesoMinSaludable = 18.5 * alturaM * alturaM;
      const pesoMaxSaludable = 24.9 * alturaM * alturaM;
      
      const promedio = (devine + robinson + miller + hamwi) / 4;
      
      setResultadoPesoIdeal({
        devine: Math.round(devine * 10) / 10,
        robinson: Math.round(robinson * 10) / 10,
        miller: Math.round(miller * 10) / 10,
        hamwi: Math.round(hamwi * 10) / 10,
        promedio: Math.round(promedio * 10) / 10,
        rangoSaludable: {
          min: Math.round(pesoMinSaludable * 10) / 10,
          max: Math.round(pesoMaxSaludable * 10) / 10
        }
      });
    }
  };

  const tabs = [
    { label: 'IMC', icon: <FitnessCenterIcon /> },
    { label: 'TMB/GET', icon: <SpeedIcon /> },
    { label: 'Agua Diaria', icon: <RestaurantIcon /> },
    { label: 'ICC', icon: <CalculateIcon /> },
    { label: 'Macros', icon: <RestaurantIcon /> },
    { label: 'Peso Ideal', icon: <TrendingUpIcon /> }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalculateIcon sx={{ 
            fontSize: 40, 
            color: '#667eea', 
            mr: 2 
          }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: darkMode ? '#ffffff' : '#1a1a1a'
            }}
          >
            Calculadoras Nutricionales
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Herramientas de cálculo para evaluación nutricional y planificación dietética
        </Typography>
      </Box>

      {/* Tabs de navegación */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#667eea',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
              '&.Mui-selected': {
                color: '#667eea',
                fontWeight: 600
              }
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Contenido según tab activo */}
      <Grid container spacing={4}>
        
        {/* Calculadora IMC */}
        {activeTab === 0 && (
          <>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Calculadora de IMC
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Peso (kg)"
                        type="number"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Altura (cm)"
                        type="number"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={calcularIMC}
                        sx={{
                          bgcolor: '#667eea',
                          '&:hover': { bgcolor: '#5a67d8' }
                        }}
                      >
                        Calcular IMC
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {resultadoIMC && (
                <Card sx={{ 
                  bgcolor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Resultado IMC
                    </Typography>
                    
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: resultadoIMC.color,
                          mb: 1 
                        }}
                      >
                        {resultadoIMC.valor}
                      </Typography>
                      <Chip 
                        label={resultadoIMC.categoria}
                        sx={{ 
                          bgcolor: resultadoIMC.color,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          px: 2,
                          py: 0.5
                        }}
                      />
                    </Box>

                    {/* Escala visual del IMC */}
                    <IMCScale imc={parseFloat(resultadoIMC.valor)} />

                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                      <strong>Categorías IMC:</strong><br />
                      • Bajo peso: &lt; 18.5<br />
                      • Peso normal: 18.5 - 24.9<br />
                      • Sobrepeso: 25.0 - 29.9<br />
                      • Obesidad: ≥ 30.0
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </>
        )}

        {/* Calculadora TMB/GET */}
        {activeTab === 1 && (
          <>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Calculadora TMB/GET
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Peso (kg)"
                        type="number"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Altura (cm)"
                        type="number"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Edad (años)"
                        type="number"
                        value={edad}
                        onChange={(e) => setEdad(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Sexo</InputLabel>
                        <Select
                          value={sexo}
                          label="Sexo"
                          onChange={(e) => setSexo(e.target.value)}
                        >
                          <MenuItem value="M">Masculino</MenuItem>
                          <MenuItem value="F">Femenino</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Nivel de Actividad Física</InputLabel>
                        <Select
                          value={actividadFisica}
                          label="Nivel de Actividad Física"
                          onChange={(e) => setActividadFisica(e.target.value)}
                        >
                          <MenuItem value="sedentario">Sedentario (sin ejercicio)</MenuItem>
                          <MenuItem value="ligero">Ligero (1-3 días/semana)</MenuItem>
                          <MenuItem value="moderado">Moderado (3-5 días/semana)</MenuItem>
                          <MenuItem value="intenso">Intenso (6-7 días/semana)</MenuItem>
                          <MenuItem value="muy_intenso">Muy intenso (2 veces/día)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={calcularTMB}
                        sx={{
                          bgcolor: '#667eea',
                          '&:hover': { bgcolor: '#5a67d8' }
                        }}
                      >
                        Calcular TMB/GET
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {resultadoTMB && (
                <Card sx={{ 
                  bgcolor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Resultado TMB/GET
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Tasa Metabólica Basal (TMB)
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                            {resultadoTMB.tmb} kcal/día
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Gasto Energético Total (GET)
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                            {resultadoTMB.get} kcal/día
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ mt: 3 }}>
                      El GET incluye la actividad física seleccionada. Usar para planificar dietas de mantenimiento.
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </>
        )}

        {/* Calculadora Agua Diaria */}
        {activeTab === 2 && (
          <>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Calculadora de Agua Diaria
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Peso (kg)"
                        type="number"
                        value={pesoAgua}
                        onChange={(e) => setPesoAgua(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Nivel de Actividad</InputLabel>
                        <Select
                          value={nivelActividad}
                          label="Nivel de Actividad"
                          onChange={(e) => setNivelActividad(e.target.value)}
                        >
                          <MenuItem value="bajo">Bajo (sedentario)</MenuItem>
                          <MenuItem value="moderado">Moderado (ejercicio regular)</MenuItem>
                          <MenuItem value="alto">Alto (ejercicio intenso)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={calcularAgua}
                        sx={{
                          bgcolor: '#667eea',
                          '&:hover': { bgcolor: '#5a67d8' }
                        }}
                      >
                        Calcular Agua Diaria
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {resultadoAgua && (
                <Card sx={{ 
                  bgcolor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Resultado Agua Diaria
                    </Typography>
                    
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#06b6d4',
                          mb: 1 
                        }}
                      >
                        {resultadoAgua.litros}L
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        ({resultadoAgua.ml} ml)
                      </Typography>
                    </Box>

                    <Alert severity="info">
                      Esta cantidad incluye agua de bebidas y alimentos. Incrementar en caso de fiebre, calor o ejercicio prolongado.
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </>
        )}

        {/* Calculadora ICC */}
        {activeTab === 3 && (
          <>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Índice Cintura/Cadera (ICC)
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Cintura (cm)"
                        type="number"
                        value={cintura}
                        onChange={(e) => setCintura(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Cadera (cm)"
                        type="number"
                        value={cadera}
                        onChange={(e) => setCadera(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Sexo</InputLabel>
                        <Select
                          value={sexoICC}
                          label="Sexo"
                          onChange={(e) => setSexoICC(e.target.value)}
                        >
                          <MenuItem value="M">Masculino</MenuItem>
                          <MenuItem value="F">Femenino</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={calcularICC}
                        sx={{
                          bgcolor: '#667eea',
                          '&:hover': { bgcolor: '#5a67d8' }
                        }}
                      >
                        Calcular ICC
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Cómo medir:</strong><br />
                      • <strong>Cintura:</strong> En el punto más estrecho del abdomen<br />
                      • <strong>Cadera:</strong> En la parte más ancha de las caderas
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {resultadoICC && (
                <Card sx={{ 
                  bgcolor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Resultado ICC
                    </Typography>
                    
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: resultadoICC.color,
                          mb: 1 
                        }}
                      >
                        {resultadoICC.valor}
                      </Typography>
                      <Chip 
                        label={resultadoICC.riesgo}
                        sx={{ 
                          bgcolor: resultadoICC.color,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          px: 2,
                          py: 0.5
                        }}
                      />
                    </Box>

                    {/* Escala visual del ICC */}
                    <ICCScale icc={resultadoICC.valor} sexo={sexoICC} />
                  </CardContent>
                </Card>
              )}
            </Grid>
          </>
        )}

        {/* Calculadora de Macros */}
        {activeTab === 4 && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Calculadora de Macronutrientes
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Datos para Macros
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Peso (kg)"
                        type="number"
                        value={pesoMacros}
                        onChange={(e) => setPesoMacros(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Altura (cm)"
                        type="number"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Edad (años)"
                        type="number"
                        value={edad}
                        onChange={(e) => setEdad(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Sexo</InputLabel>
                        <Select
                          value={sexo}
                          label="Sexo"
                          onChange={(e) => setSexo(e.target.value)}
                        >
                          <MenuItem value="M">Masculino</MenuItem>
                          <MenuItem value="F">Femenino</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Objetivo</InputLabel>
                        <Select
                          value={objetivo}
                          label="Objetivo"
                          onChange={(e) => setObjetivo(e.target.value)}
                        >
                          <MenuItem value="perder">Perder peso (déficit calórico)</MenuItem>
                          <MenuItem value="mantener">Mantener peso</MenuItem>
                          <MenuItem value="ganar">Ganar masa muscular (superávit)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={calcularMacros}
                        sx={{
                          bgcolor: '#667eea',
                          '&:hover': { bgcolor: '#5a67d8' }
                        }}
                      >
                        Calcular Macros
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {resultadoMacros && (
                <Card sx={{ 
                  bgcolor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Distribución de Macros
                    </Typography>
                    
                    {/* Calorías Totales */}
                    <Box sx={{ textAlign: 'center', mb: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Calorías Diarias Recomendadas
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#667eea' }}>
                        {resultadoMacros.calorias} kcal
                      </Typography>
                    </Box>

                    {/* Macronutrientes */}
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2, bgcolor: '#dbeafe', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Proteínas
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                            {resultadoMacros.proteinas}g ({resultadoMacros.proteinasPorc}%)
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Carbohidratos
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                            {resultadoMacros.carbohidratos}g ({resultadoMacros.carbsPorc}%)
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2, bgcolor: '#fee2e2', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Grasas
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ef4444' }}>
                            {resultadoMacros.grasas}g ({resultadoMacros.grasasPorc}%)
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ mt: 3 }}>
                      Ajusta las porciones de tus comidas para alcanzar estos valores diarios.
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </Grid>

          </>
        )}

        {/* Calculadora de Peso Ideal */}
        {activeTab === 5 && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Calculadora de Peso Ideal
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Datos para Peso Ideal
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Altura (cm)"
                        type="number"
                        value={alturaPesoIdeal}
                        onChange={(e) => setAlturaPesoIdeal(e.target.value)}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Sexo</InputLabel>
                        <Select
                          value={sexoPesoIdeal}
                          label="Sexo"
                          onChange={(e) => setSexoPesoIdeal(e.target.value)}
                        >
                          <MenuItem value="M">Masculino</MenuItem>
                          <MenuItem value="F">Femenino</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={calcularPesoIdeal}
                        sx={{
                          bgcolor: '#667eea',
                          '&:hover': { bgcolor: '#5a67d8' }
                        }}
                      >
                        Calcular Peso Ideal
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Nota:</strong> El peso ideal es una referencia. 
                      Cada persona tiene una composición corporal única.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {resultadoPesoIdeal && (
                <Card sx={{ 
                  bgcolor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Resultados - Peso Ideal
                    </Typography>
                    
                    {/* Promedio destacado */}
                    <Box sx={{ textAlign: 'center', mb: 3, p: 3, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Peso Ideal Promedio
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#10b981' }}>
                        {resultadoPesoIdeal.promedio} kg
                      </Typography>
                    </Box>

                    {/* Rango saludable según IMC */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#dbeafe', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Rango Saludable (IMC 18.5-24.9)
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                        {resultadoPesoIdeal.rangoSaludable.min} - {resultadoPesoIdeal.rangoSaludable.max} kg
                      </Typography>
                    </Box>

                    {/* Fórmulas individuales */}
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Según diferentes fórmulas:
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Fórmula Devine
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {resultadoPesoIdeal.devine} kg
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Fórmula Robinson
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {resultadoPesoIdeal.robinson} kg
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Fórmula Miller
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {resultadoPesoIdeal.miller} kg
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Fórmula Hamwi
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {resultadoPesoIdeal.hamwi} kg
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default CalculadorasPage;