import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Chip,
  Button,
  InputAdornment,
  Tab,
  Tabs,
  IconButton,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  MenuBook as RecipeIcon,
  AccessTime as TimeIcon,
  People as ServingIcon,
  Star as StarIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

const RecetarioPage = () => {
  const { darkMode } = useThemeMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Datos de ejemplo para recetas
  const categorias = [
    'Todas',
    'Desayunos',
    'Almuerzos',
    'Cenas',
    'Snacks Saludables',
    'Batidos y Smoothies',
    'Postres Saludables'
  ];

  const recetas = [
    {
      id: 1,
      nombre: 'Bowl de Avena con Frutos Rojos',
      categoria: 'Desayunos',
      tiempoPreparacion: '10 min',
      porciones: '1 porción',
      calorias: '350 kcal',
      imagen: '/api/placeholder/300/200',
      descripcion: 'Desayuno nutritivo rico en fibra y antioxidantes',
      ingredientes: ['1 taza de avena', '1/2 taza de frutos rojos', '1 cdta de miel', '1/4 taza de nueces'],
      preparacion: 'Cocinar la avena con agua o leche. Agregar los frutos rojos y endulzar con miel.',
      valorNutricional: {
        proteinas: '12g',
        carbohidratos: '65g',
        grasas: '8g',
        fibra: '10g'
      },
      favorito: false,
      popularidad: 4.5
    },
    {
      id: 2,
      nombre: 'Ensalada Mediterránea con Quinoa',
      categoria: 'Almuerzos',
      tiempoPreparacion: '15 min',
      porciones: '2 porciones',
      calorias: '420 kcal',
      imagen: '/api/placeholder/300/200',
      descripcion: 'Ensalada completa con proteína vegetal y grasas saludables',
      ingredientes: ['1 taza de quinoa cocida', 'Tomates cherry', 'Pepino', 'Aceitunas', 'Queso feta', 'Aceite de oliva'],
      preparacion: 'Mezclar todos los ingredientes y aliñar con aceite de oliva, limón y hierbas.',
      valorNutricional: {
        proteinas: '18g',
        carbohidratos: '45g',
        grasas: '15g',
        fibra: '8g'
      },
      favorito: true,
      popularidad: 4.8
    },
    {
      id: 3,
      nombre: 'Smoothie Verde Energizante',
      categoria: 'Batidos y Smoothies',
      tiempoPreparacion: '5 min',
      porciones: '1 porción',
      calorias: '180 kcal',
      imagen: '/api/placeholder/300/200',
      descripcion: 'Batido rico en vitaminas y minerales para empezar el día',
      ingredientes: ['1 taza de espinacas', '1 plátano', '1/2 manzana verde', '1 taza de agua de coco', '1 cdta de chía'],
      preparacion: 'Licuar todos los ingredientes hasta obtener una consistencia suave.',
      valorNutricional: {
        proteinas: '4g',
        carbohidratos: '35g',
        grasas: '3g',
        fibra: '7g'
      },
      favorito: false,
      popularidad: 4.3
    }
  ];

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const filteredRecetas = recetas.filter(receta => {
    const matchesSearch = receta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receta.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 0 || 
                           receta.categoria === categorias[selectedCategory];
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <RecipeIcon sx={{ 
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
            Recetario Nutricional
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Colección de recetas saludables y balanceadas para compartir con tus pacientes
        </Typography>

        {/* Búsqueda */}
        <TextField
          fullWidth
          placeholder="Buscar recetas por nombre o ingredientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>

      {/* Filtros por categoría */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
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
          {categorias.map((categoria, index) => (
            <Tab key={index} label={categoria} />
          ))}
        </Tabs>
      </Box>

      {/* Grid de recetas */}
      <Grid container spacing={3}>
        {filteredRecetas.map((receta) => (
          <Grid item xs={12} md={6} lg={4} key={receta.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: darkMode ? '#1f2937' : '#ffffff',
                border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: darkMode 
                    ? '0 20px 25px rgba(0, 0, 0, 0.4)' 
                    : '0 20px 25px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={receta.imagen}
                alt={receta.nombre}
                sx={{ bgcolor: '#f3f4f6' }}
              />
              
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1, mr: 1 }}>
                    {receta.nombre}
                  </Typography>
                  <IconButton 
                    size="small"
                    sx={{ color: receta.favorito ? '#ef4444' : 'text.secondary' }}
                  >
                    {receta.favorito ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>

                <Chip 
                  label={receta.categoria}
                  size="small"
                  sx={{ 
                    mb: 2,
                    bgcolor: '#667eea',
                    color: 'white',
                    fontWeight: 500
                  }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {receta.descripcion}
                </Typography>

                {/* Información nutricional rápida */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {receta.tiempoPreparacion}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ServingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {receta.porciones}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#10b981' }}>
                    {receta.calorias}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ flex: 1 }}
                  >
                    Ver Receta
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ 
                      flex: 1,
                      bgcolor: '#667eea',
                      '&:hover': { bgcolor: '#5a67d8' }
                    }}
                  >
                    Compartir
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mensaje si no hay resultados */}
      {filteredRecetas.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <RecipeIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron recetas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Prueba con otros términos de búsqueda o categorías
          </Typography>
        </Box>
      )}

      {/* FAB para agregar nueva receta */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#667eea',
          '&:hover': { bgcolor: '#5a67d8' }
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default RecetarioPage;