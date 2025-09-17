import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { configuracionService } from '../../services/administracion';
import { useSnackbar } from 'notistack';

const ConfiguracionSistema = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [configuraciones, setConfiguraciones] = useState([]);
  const [configuracionesOriginales, setConfiguracionesOriginales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [expandedPanels, setExpandedPanels] = useState({});

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true);
      const [configRes, categoriasRes] = await Promise.all([
        configuracionService.obtenerConfiguraciones(),
        configuracionService.obtenerCategorias()
      ]);
      
      setConfiguraciones(configRes.data || []);
      setConfiguracionesOriginales(JSON.parse(JSON.stringify(configRes.data || [])));
      setCategorias(categoriasRes.data || []);
      
      // Expandir primera categoría por defecto
      if (configRes.data && configRes.data.length > 0) {
        const primeraCategoria = configRes.data[0].categoria;
        setExpandedPanels({ [primeraCategoria]: true });
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      enqueueSnackbar('Error cargando configuraciones', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const agruparPorCategoria = (configs) => {
    const filtradas = filtroCategoria 
      ? configs.filter(config => config.categoria === filtroCategoria)
      : configs;
      
    return filtradas.reduce((grupos, config) => {
      const categoria = config.categoria || 'general';
      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }
      grupos[categoria].push(config);
      return grupos;
    }, {});
  };

  const handleConfiguracionChange = (id, valor) => {
    setConfiguraciones(prev => 
      prev.map(config => 
        config.id === id ? { ...config, valor } : config
      )
    );
  };

  const handleAccordionChange = (categoria) => (event, isExpanded) => {
    setExpandedPanels(prev => ({
      ...prev,
      [categoria]: isExpanded
    }));
  };

  const hayCambios = () => {
    return JSON.stringify(configuraciones) !== JSON.stringify(configuracionesOriginales);
  };

  const guardarCambios = async () => {
    try {
      setGuardando(true);
      
      // Identificar configuraciones modificadas
      const cambios = configuraciones.filter((config, index) => {
        const original = configuracionesOriginales[index];
        return original && JSON.stringify(config.valor) !== JSON.stringify(original.valor);
      }).map(config => ({
        clave: config.clave,
        valor: config.valor
      }));
      
      if (cambios.length === 0) {
        enqueueSnackbar('No hay cambios para guardar', { variant: 'info' });
        return;
      }
      
      await configuracionService.actualizarMultiples(cambios);
      
      // Actualizar configuraciones originales
      setConfiguracionesOriginales(JSON.parse(JSON.stringify(configuraciones)));
      
      enqueueSnackbar(`${cambios.length} configuración(es) actualizada(s)`, { variant: 'success' });
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error guardando configuraciones',
        { variant: 'error' }
      );
    } finally {
      setGuardando(false);
    }
  };

  const renderCampoConfiguracion = (config) => {
    const { id, clave, valor, tipo, descripcion } = config;
    
    switch (tipo) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={valor === true || valor === 'true'}
                onChange={(e) => handleConfiguracionChange(id, e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {clave}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {descripcion}
                </Typography>
              </Box>
            }
          />
        );
        
      case 'number':
        return (
          <TextField
            fullWidth
            label={clave}
            type="number"
            value={valor || ''}
            onChange={(e) => handleConfiguracionChange(id, parseFloat(e.target.value) || 0)}
            helperText={descripcion}
            variant="outlined"
            size="small"
          />
        );
        
      case 'json':
        return (
          <TextField
            fullWidth
            label={clave}
            multiline
            rows={4}
            value={JSON.stringify(valor, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleConfiguracionChange(id, parsed);
              } catch (error) {
                // Mantener el valor como string hasta que sea JSON válido
                console.warn('JSON inválido:', error);
              }
            }}
            helperText={descripcion}
            variant="outlined"
            size="small"
          />
        );
        
      default:
        return (
          <TextField
            fullWidth
            label={clave}
            value={valor || ''}
            onChange={(e) => handleConfiguracionChange(id, e.target.value)}
            helperText={descripcion}
            variant="outlined"
            size="small"
          />
        );
    }
  };

  const obtenerNombreCategoria = (categoria) => {
    const nombres = {
      'general': 'General',
      'sistema': 'Sistema',
      'notificaciones': 'Notificaciones',
      'archivos': 'Archivos y Uploads',
      'interfaz': 'Interfaz de Usuario',
      'seguridad': 'Seguridad',
      'backup': 'Respaldo y Mantenimiento'
    };
    return nombres[categoria] || categoria;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const configsPorCategoria = agruparPorCategoria(configuraciones);

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Configuración del Sistema
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Administra las configuraciones globales del sistema Alimetria
        </Typography>
      </Box>

      {/* Controles superiores */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por categoría</InputLabel>
                <Select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  label="Filtrar por categoría"
                >
                  <MenuItem value="">Todas las categorías</MenuItem>
                  {categorias.map(categoria => (
                    <MenuItem key={categoria} value={categoria}>
                      {obtenerNombreCategoria(categoria)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={cargarConfiguraciones}
                >
                  Recargar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={guardarCambios}
                  disabled={!hayCambios() || guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Alerta de cambios no guardados */}
      {hayCambios() && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Tienes cambios sin guardar. No olvides hacer clic en "Guardar Cambios" para aplicarlos.
        </Alert>
      )}

      {/* Configuraciones por categoría */}
      <Box>
        {Object.entries(configsPorCategoria).map(([categoria, configs]) => (
          <Accordion
            key={categoria}
            expanded={expandedPanels[categoria] || false}
            onChange={handleAccordionChange(categoria)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">
                  {obtenerNombreCategoria(categoria)}
                </Typography>
                <Chip 
                  label={`${configs.length} configuración${configs.length !== 1 ? 'es' : ''}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {configs.map((config) => (
                  <Grid item xs={12} sm={6} md={4} key={config.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Typography variant="body2" color="textSecondary">
                            {config.clave}
                          </Typography>
                          {config.es_publica && (
                            <Chip 
                              label="Público" 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {renderCampoConfiguracion(config)}
                        <Box mt={1}>
                          <Typography variant="caption" color="textSecondary">
                            Tipo: {config.tipo} | Última actualización: {' '}
                            {new Date(config.fecha_actualizacion).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Mensaje si no hay configuraciones */}
      {Object.keys(configsPorCategoria).length === 0 && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No se encontraron configuraciones
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {filtroCategoria 
                  ? `No hay configuraciones en la categoría "${obtenerNombreCategoria(filtroCategoria)}"`
                  : 'No hay configuraciones disponibles'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ConfiguracionSistema;
