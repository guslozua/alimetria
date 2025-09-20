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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

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

  const enviarEmailPrueba = async () => {
    if (!testEmailAddress) {
      enqueueSnackbar('Por favor ingresa una dirección de email', { variant: 'warning' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailAddress)) {
      enqueueSnackbar('Por favor ingresa un email válido', { variant: 'warning' });
      return;
    }
    
    try {
      setSendingTestEmail(true);
      const response = await configuracionService.probarEmail(testEmailAddress);
      
      if (response.success) {
        enqueueSnackbar('✅ Email de prueba enviado exitosamente', { variant: 'success' });
        setTestEmailDialog(false);
        setTestEmailAddress('');
      } else if (response.disabled) {
        enqueueSnackbar('⚠️ Los emails están deshabilitados en la configuración', { variant: 'warning' });
        // Cerrar modal incluso si está deshabilitado
        setTestEmailDialog(false);
        setTestEmailAddress('');
      } else {
        enqueueSnackbar(`❌ Error: ${response.message}`, { variant: 'error' });
        // Cerrar modal en caso de error
        setTestEmailDialog(false);
        setTestEmailAddress('');
      }
    } catch (error) {
      console.error('Error enviando email de prueba:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error enviando email de prueba',
        { variant: 'error' }
      );
      // Cerrar modal en caso de excepción
      setTestEmailDialog(false);
      setTestEmailAddress('');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const renderCampoConfiguracion = (config) => {
    const { id, clave, valor, tipo, descripcion } = config;
    
    // Configuraciones especiales con alertas
    const configuracionesEspeciales = {
      'email_habilitado': {
        icon: '📧',
        alert: valor ? 
          { severity: 'success', text: 'Emails habilitados - El sistema puede enviar notificaciones' } :
          { severity: 'warning', text: 'Emails deshabilitados - No se envían notificaciones automáticas' }
      },
      'backup_automatico': {
        icon: '💾',
        alert: valor ? 
          { severity: 'info', text: 'Respaldos automáticos activados' } :
          { severity: 'warning', text: 'Respaldos automáticos desactivados - Recuerda hacer respaldos manuales' }
      },
      'mostrar_demo': {
        icon: '🧪',
        alert: valor ? 
          { severity: 'info', text: 'Datos de demostración visibles para pruebas' } :
          { severity: 'success', text: 'Modo producción - Solo datos reales' }
      }
    };
    
    const configEspecial = configuracionesEspeciales[clave];
    
    let campo;
    
    switch (tipo) {
      case 'boolean':
        campo = (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={valor === true || valor === 'true'}
                  onChange={(e) => handleConfiguracionChange(id, e.target.checked)}
                  color="primary"
                  size="medium"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {configEspecial?.icon} {clave}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {descripcion}
                  </Typography>
                </Box>
              }
            />
            {configEspecial?.alert && (
              <Alert 
                severity={configEspecial.alert.severity} 
                sx={{ mt: 1, fontSize: '0.75rem' }}
                variant="outlined"
              >
                {configEspecial.alert.text}
              </Alert>
            )}
          </Box>
        );
        break;
        
      case 'number':
        campo = (
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
        break;
        
      case 'json':
        campo = (
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
        break;
        
      default:
        // Para campos de tipo string, agregar validaciones especiales
        const isPasswordField = clave.includes('password') || clave.includes('contraseña');
        const isEmailField = clave.includes('email') && !clave.includes('habilitado');
        
        campo = (
          <TextField
            fullWidth
            label={clave}
            type={isPasswordField ? 'password' : 'text'}
            value={valor || ''}
            onChange={(e) => handleConfiguracionChange(id, e.target.value)}
            helperText={descripcion}
            variant="outlined"
            size="small"
            error={isEmailField && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)}
          />
        );
        break;
    }
    
    return campo;
  };

  const obtenerNombreCategoria = (categoria) => {
    const nombres = {
      'general': '🏢 General',
      'sistema': '⚙️ Sistema',
      'notificaciones': '📧 Notificaciones y Email',
      'archivos': '📁 Archivos y Uploads',
      'interfaz': '🎨 Interfaz de Usuario',
      'seguridad': '🔒 Seguridad',
      'reportes': '📊 Reportes',
      'citas': '📅 Citas y Agenda',
      'backup': '💾 Respaldo y Mantenimiento'
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

      {/* Estado del Sistema */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📡 Estado del Sistema
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="textSecondary">
                  📧 Emails:
                </Typography>
                <Chip 
                  label={configuraciones.find(c => c.clave === 'email_habilitado')?.valor ? 'Habilitado' : 'Deshabilitado'}
                  color={configuraciones.find(c => c.clave === 'email_habilitado')?.valor ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="textSecondary">
                  💾 Respaldos:
                </Typography>
                <Chip 
                  label={configuraciones.find(c => c.clave === 'backup_automatico')?.valor ? 'Automático' : 'Manual'}
                  color={configuraciones.find(c => c.clave === 'backup_automatico')?.valor ? 'info' : 'warning'}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="textSecondary">
                  🧪 Modo:
                </Typography>
                <Chip 
                  label={configuraciones.find(c => c.clave === 'mostrar_demo')?.valor ? 'Demo' : 'Producción'}
                  color={configuraciones.find(c => c.clave === 'mostrar_demo')?.valor ? 'warning' : 'success'}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="textSecondary">
                  ⚙️ Versión:
                </Typography>
                <Chip 
                  label={configuraciones.find(c => c.clave === 'sistema_version')?.valor || '1.0.0'}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
                {/* Botón especial para probar email */}
                {configuraciones.find(c => c.clave === 'email_habilitado')?.valor && (
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<AddIcon />}
                    onClick={() => setTestEmailDialog(true)}
                  >
                    Probar Email
                  </Button>
                )}
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
      
      {/* Diálogo para probar email */}
      <Dialog open={testEmailDialog} onClose={() => setTestEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          🧪 Probar Configuración de Email
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Envía un email de prueba para verificar que la configuración sea correcta.
            </Typography>
            
            <TextField
              fullWidth
              label="Email de destino"
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              helperText="Ingresa el email donde quieres recibir la prueba"
              sx={{ mt: 2 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  enviarEmailPrueba();
                }
              }}
            />
            
            {configuraciones.find(c => c.clave === 'email_habilitado')?.valor ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                ✅ Envío de emails habilitado
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ⚠️ Envío de emails deshabilitado - No se enviará el email
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTestEmailDialog(false);
            setTestEmailAddress('');
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={enviarEmailPrueba}
            variant="contained"
            disabled={sendingTestEmail || !testEmailAddress}
            startIcon={sendingTestEmail ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {sendingTestEmail ? 'Enviando...' : 'Enviar Prueba'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfiguracionSistema;
