import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Stack,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';
import useSupplementos from '../hooks/useSupplementos';
import TarjetaSuplemento from '../components/Suplementos/TarjetaSuplemento';
import ModalDetalle from '../components/Suplementos/ModalDetalle';

const SuplementosPage = () => {
  const { darkMode } = useThemeMode();
  
  // Estados locales
  const [vistaActual, setVistaActual] = useState('grid'); // 'grid' o 'lista'
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  
  // Estados para el modal
  const [suplementoSeleccionado, setSuplementoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Hook personalizado
  const {
    suplementos,
    categorias,
    loading,
    error,
    busquedaLocal,
    setBusquedaLocal,
    buscar,
    filtrarPorCategoria,
    limpiarFiltros,
    hayFiltrosActivos,
    estadisticas
  } = useSupplementos();

  // Manejar búsqueda
  const handleBusqueda = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      buscar(busquedaLocal);
    }
  };

  // Manejar cambio de categoría
  const handleCategoriaChange = (event, nuevaCategoria) => {
    setCategoriaSeleccionada(nuevaCategoria);
    filtrarPorCategoria(nuevaCategoria);
  };

  // Manejar click en suplemento - ABRIR MODAL
  const handleSupplementoClick = (suplemento) => {
    console.log('Abriendo detalle de:', suplemento.nombre);
    setSuplementoSeleccionado(suplemento);
    setModalAbierto(true);
  };

  // Cerrar modal
  const handleCerrarModal = () => {
    setModalAbierto(false);
    setSuplementoSeleccionado(null);
  };

  // Manejar favoritos (simulado por ahora)
  const handleFavorito = (id, esFavorito) => {
    console.log(`Suplemento ${id} ${esFavorito ? 'agregado a' : 'removido de'} favoritos`);
    // TODO: Implementar lógica de favoritos
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#1a1a1a', mb: 2 }}>
          💊 Centro de Suplementos
        </Typography>
        
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Base de conocimiento completa con información detallada sobre suplementos nutricionales
        </Typography>

        {/* Estadísticas rápidas */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          <Chip 
            label={`${estadisticas.totalSupplementos} suplementos`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`${estadisticas.totalCategorias} categorías`} 
            color="secondary" 
            variant="outlined" 
          />
          {estadisticas.suplementosDestacados > 0 && (
            <Chip 
              label={`${estadisticas.suplementosDestacados} destacados`} 
              sx={{ bgcolor: '#fef3c7', color: '#92400e' }}
            />
          )}
        </Stack>
      </Box>

      {/* Barra de búsqueda y controles */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          bgcolor: darkMode ? '#1e293b' : '#ffffff',
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Búsqueda */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar suplementos, indicaciones, síntomas..."
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              onKeyPress={handleBusqueda}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: busquedaLocal && (
                  <InputAdornment position="end">
                    <Button onClick={handleBusqueda} size="small">
                      Buscar
                    </Button>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: darkMode ? '#0f172a' : '#fafbfc'
                }
              }}
            />
          </Grid>
          
          {/* Controles de vista */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {hayFiltrosActivos && (
                <Button 
                  onClick={limpiarFiltros}
                  variant="outlined"
                  size="small"
                >
                  Limpiar Filtros
                </Button>
              )}
              
              <Box sx={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 1 }}>
                <Button
                  onClick={() => setVistaActual('grid')}
                  variant={vistaActual === 'grid' ? 'contained' : 'outlined'}
                  sx={{ minWidth: 'auto', borderRadius: '4px 0 0 4px' }}
                  size="small"
                >
                  <GridViewIcon />
                </Button>
                <Button
                  onClick={() => setVistaActual('lista')}
                  variant={vistaActual === 'lista' ? 'contained' : 'outlined'}
                  sx={{ minWidth: 'auto', borderRadius: '0 4px 4px 0' }}
                  size="small"
                >
                  <ListViewIcon />
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs de categorías */}
      {categorias.length > 0 && (
        <Paper 
          sx={{ 
            mb: 3,
            bgcolor: darkMode ? '#1e293b' : '#ffffff',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
          }}
        >
          <Tabs
            value={categoriaSeleccionada}
            onChange={handleCategoriaChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 48,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
                '&.Mui-selected': {
                  color: darkMode ? '#ffffff' : '#1a1a1a',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#667eea',
                height: 2
              }
            }}
          >
            <Tab value="all" label="📚 Todas las categorías" />
            {categorias.map((categoria) => (
              <Tab
                key={categoria.id}
                value={categoria.id.toString()}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{categoria.icono}</span>
                    {categoria.nombre}
                    <Chip 
                      label={categoria.total_suplementos} 
                      size="small" 
                      sx={{ 
                        bgcolor: categoria.color + '20',
                        color: categoria.color,
                        fontSize: '0.75rem',
                        height: 20
                      }} 
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>
      )}

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Estado de error */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Resultados */}
      {!loading && !error && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="textSecondary">
              {suplementos.length} suplementos encontrados
              {busquedaLocal && ` para "${busquedaLocal}"`}
            </Typography>
          </Box>

          {/* Grid/Lista de suplementos */}
          {vistaActual === 'grid' ? (
            <Grid container spacing={3}>
              {suplementos.map((suplemento) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={suplemento.id}>
                  <TarjetaSuplemento
                    suplemento={suplemento}
                    vista="grid"
                    onClick={() => handleSupplementoClick(suplemento)}
                    onFavorito={handleFavorito}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={2}>
              {suplementos.map((suplemento) => (
                <TarjetaSuplemento
                  key={suplemento.id}
                  suplemento={suplemento}
                  vista="lista"
                  onClick={() => handleSupplementoClick(suplemento)}
                  onFavorito={handleFavorito}
                />
              ))}
                />
              ))}
            </Stack>
          )}

          {/* Estado vacío */}
          {suplementos.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                No se encontraron suplementos
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Intenta con otros términos de búsqueda o limpia los filtros
              </Typography>
              {hayFiltrosActivos && (
                <Button variant="contained" onClick={limpiarFiltros}>
                  Limpiar Filtros
                </Button>
              )}
            </Box>
          )}
        </>
      )}

      {/* Modal de Detalle */}
      <ModalDetalle
        suplemento={suplementoSeleccionado}
        abierto={modalAbierto}
        onCerrar={handleCerrarModal}
        darkMode={darkMode}
      />
    </Container>
  );
};

export default SuplementosPage;