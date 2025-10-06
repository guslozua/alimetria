import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Dialog,
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { obtenerInfografias, obtenerCategorias, descargarInfografia } from '../../services/infografias.service';
import InfografiasDetalle from './InfografiasDetalle';
import InfografiasForm from './InfografiasForm';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const InfografiasGaleria = () => {
  const { user, isAdmin, isNutricionista } = useAuth();
  const navigate = useNavigate();
  
  const [infografias, setInfografias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  
  // Modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalForm, setModalForm] = useState(false);
  const [infografiaSeleccionada, setInfografiaSeleccionada] = useState(null);
  
  // Verificar permisos usando el contexto
  const puedeSubir = isAdmin() || isNutricionista();
  
  // Debug logs (remover después de probar)
  console.log('Usuario del contexto:', user);
  console.log('Es admin:', isAdmin());
  console.log('Es nutricionista:', isNutricionista());
  console.log('Puede subir infografías:', puedeSubir);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [infografiasRes, categoriasRes] = await Promise.all([
        obtenerInfografias(),
        obtenerCategorias()
      ]);
      
      setInfografias(infografiasRes.data || []);
      setCategorias(categoriasRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar las infografías');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      const filtros = {
        busqueda: busqueda || undefined,
        categoria_id: categoriaSeleccionada || undefined
      };
      
      const response = await obtenerInfografias(filtros);
      setInfografias(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al filtrar:', err);
      setError('Error al filtrar infografías');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaSeleccionada('');
    cargarDatos();
  };

  const handleVerDetalle = (infografia) => {
    setInfografiaSeleccionada(infografia);
    setModalDetalle(true);
  };

  const handleDescargar = async (infografia) => {
    try {
      await descargarInfografia(infografia.id, infografia.nombre_archivo);
    } catch (err) {
      console.error('Error al descargar:', err);
      setError('Error al descargar la infografía');
    }
  };

  const handleNuevaInfografia = () => {
    setInfografiaSeleccionada(null);
    setModalForm(true);
  };

  const handleGuardarExito = () => {
    setModalForm(false);
    cargarDatos();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box>
            <Typography variant="h4" gutterBottom>
              📚 Biblioteca de Infografías Educativas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Recursos educativos para compartir con tus pacientes
            </Typography>
          </Box>
          
          {/* Botón Administrar - Solo para admin y nutricionistas */}
          {puedeSubir && (
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/infografias/admin')}
              sx={{
                bgcolor: '#667eea',
                color: 'white',
                '&:hover': {
                  bgcolor: '#5568d3'
                },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5
              }}
            >
              Administrar
            </Button>
          )}
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Buscar por título, descripción o autor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                label="Categoría"
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.icono} {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={aplicarFiltros}
              >
                Filtrar
              </Button>
              <Button
                variant="outlined"
                onClick={limpiarFiltros}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Mensajes de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Grid de infografías */}
      {infografias.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron infografías
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {infografias.map((infografia) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={infografia.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                {/* Imagen/Preview */}
                <CardMedia
                  component="img"
                  height="200"
                  image={infografia.tipo_archivo === 'application/pdf'
                    ? '/pdf-icon.png' 
                    : infografia.ruta_archivo  // Usar directamente la ruta que viene del backend
                  }
                  alt={infografia.titulo}
                  sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
                  onError={(e) => {
                    console.error('Error cargando imagen:', infografia.ruta_archivo);
                    e.target.src = '/placeholder-image.png';
                  }}
                />
                
                {/* Contenido */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {infografia.titulo}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {infografia.descripcion}
                  </Typography>
                  
                  {/* Categoría */}
                  <Chip
                    label={infografia.categoria_nombre}
                    size="small"
                    sx={{
                      backgroundColor: infografia.categoria_color,
                      color: 'white',
                      mb: 1
                    }}
                  />
                  
                  {/* Tags */}
                  <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                    {infografia.tags?.slice(0, 3).map((tag, idx) => (
                      <Chip 
                        key={idx} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  
                  {/* Metadata */}
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    {infografia.autor && `Por ${infografia.autor} • `}
                    {infografia.descargas} descargas
                  </Typography>
                </CardContent>
                
                {/* Acciones */}
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleVerDetalle(infografia)}
                  >
                    Ver
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDescargar(infografia)}
                  >
                    Descargar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Botón flotante para agregar (solo admin/nutricionista) */}
      {puedeSubir && (
        <Fab
          color="primary"
          aria-label="agregar"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          onClick={handleNuevaInfografia}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Modal de detalle */}
      <Dialog
        open={modalDetalle}
        onClose={() => setModalDetalle(false)}
        maxWidth="md"
        fullWidth
      >
        {infografiaSeleccionada && (
          <InfografiasDetalle
            infografia={infografiaSeleccionada}
            onClose={() => setModalDetalle(false)}
            onDescargar={() => handleDescargar(infografiaSeleccionada)}
          />
        )}
      </Dialog>

      {/* Modal de formulario */}
      <Dialog
        open={modalForm}
        onClose={() => setModalForm(false)}
        maxWidth="md"
        fullWidth
      >
        <InfografiasForm
          infografia={infografiaSeleccionada}
          categorias={categorias}
          onClose={() => setModalForm(false)}
          onGuardar={handleGuardarExito}
        />
      </Dialog>
    </Container>
  );
};

export default InfografiasGaleria;
