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

  const tabs = [
    { label: 'IMC', icon: <FitnessCenterIcon /> },
    { label: 'TMB/GET', icon: <SpeedIcon /> },
    { label: 'Agua Diaria', icon: <RestaurantIcon /> },
    { label: 'Más Herramientas', icon: <TrendingUpIcon /> }
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
                    
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
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
                          fontWeight: 600
                        }}
                      />
                    </Box>

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

        {/* Más Herramientas */}
        {activeTab === 3 && (
          <Grid item xs={12}>
            <Card sx={{ 
              bgcolor: darkMode ? '#1f2937' : '#ffffff',
              border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Próximamente
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ p: 3, border: '2px dashed #e5e7eb', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Calculadora de Macros
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distribución de macronutrientes
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ p: 3, border: '2px dashed #e5e7eb', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Índice Cintura/Cadera
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Evaluación de riesgo cardiovascular
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ p: 3, border: '2px dashed #e5e7eb', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Peso Ideal
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Múltiples fórmulas de referencia
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default CalculadorasPage;