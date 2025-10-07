import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  IconButton,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Science as ScienceIcon,
  HealthAndSafety as HealthIcon,
  Healing as HealingIcon,
  Book as BookIcon
} from '@mui/icons-material';
import { useThemeMode } from '../../../context/ThemeContext';

// Importar los componentes de cada tab (los crearemos después)
import TabInformacionBasica from './TabInformacionBasica';
import TabIndicaciones from './TabIndicaciones';
import TabContraindicaciones from './TabContraindicaciones';
import TabEfectosSecundarios from './TabEfectosSecundarios';
import TabInteracciones from './TabInteracciones';
import TabReferencias from './TabReferencias';

const ModalFormularioSuplemento = ({ open, onClose, onGuardar, categorias, suplementoEditar = null }) => {
  const { darkMode } = useThemeMode();
  const [tabActual, setTabActual] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const esEdicion = Boolean(suplementoEditar);

  // Estados para cada sección del formulario
  const [informacionBasica, setInformacionBasica] = useState({
    nombre: '',
    nombre_cientifico: '',
    categoria_id: '',
    descripcion_corta: '',
    descripcion_detallada: '',
    para_que_sirve: '',
    beneficios_principales: [''],
    dosis_recomendada: '',
    dosis_minima: '',
    dosis_maxima: '',
    forma_presentacion: 'cápsula',
    frecuencia_recomendada: '',
    mejor_momento_toma: '',
    duracion_tratamiento_tipica: '',
    nivel_evidencia: 'media',
    destacado: false
  });

  const [indicaciones, setIndicaciones] = useState([]);
  const [contraindicaciones, setContraindicaciones] = useState([]);
  const [efectosSecundarios, setEfectosSecundarios] = useState([]);
  const [interacciones, setInteracciones] = useState([]);
  const [referencias, setReferencias] = useState([]);

  // Cargar datos si es edición
  useEffect(() => {
    if (suplementoEditar && open) {
      setInformacionBasica({
        nombre: suplementoEditar.nombre || '',
        nombre_cientifico: suplementoEditar.nombre_cientifico || '',
        categoria_id: suplementoEditar.categoria_id || '',
        descripcion_corta: suplementoEditar.descripcion_corta || '',
        descripcion_detallada: suplementoEditar.descripcion_detallada || '',
        para_que_sirve: suplementoEditar.para_que_sirve || '',
        beneficios_principales: suplementoEditar.beneficios_principales ? 
          (typeof suplementoEditar.beneficios_principales === 'string' ? 
            JSON.parse(suplementoEditar.beneficios_principales) : 
            suplementoEditar.beneficios_principales) : [''],
        dosis_recomendada: suplementoEditar.dosis_recomendada || '',
        dosis_minima: suplementoEditar.dosis_minima || '',
        dosis_maxima: suplementoEditar.dosis_maxima || '',
        forma_presentacion: suplementoEditar.forma_presentacion || 'cápsula',
        frecuencia_recomendada: suplementoEditar.frecuencia_recomendada || '',
        mejor_momento_toma: suplementoEditar.mejor_momento_toma || '',
        duracion_tratamiento_tipica: suplementoEditar.duracion_tratamiento_tipica || '',
        nivel_evidencia: suplementoEditar.nivel_evidencia || 'media',
        destacado: suplementoEditar.destacado || false
      });
      setIndicaciones(suplementoEditar.indicaciones || []);
      setContraindicaciones(suplementoEditar.contraindicaciones || []);
      setEfectosSecundarios(suplementoEditar.efectos_secundarios || []);
      setInteracciones(suplementoEditar.interacciones || []);
      setReferencias(suplementoEditar.referencias || []);
    }
  }, [suplementoEditar, open]);

  const tabs = [
    { label: 'Información Básica', icon: <InfoIcon />, required: true },
    { label: 'Indicaciones', icon: <HealthIcon /> },
    { label: 'Contraindicaciones', icon: <WarningIcon /> },
    { label: 'Efectos Secundarios', icon: <HealingIcon /> },
    { label: 'Interacciones', icon: <ScienceIcon /> },
    { label: 'Referencias', icon: <BookIcon /> }
  ];

  const handleTabChange = (event, newValue) => {
    setTabActual(newValue);
  };

  const validarFormulario = () => {
    if (!informacionBasica.nombre || !informacionBasica.categoria_id) {
      setError('El nombre y la categoría son obligatorios');
      setTabActual(0); // Volver al primer tab
      return false;
    }
    return true;
  };

  const handleGuardar = async () => {
    setError(null);
    
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      const datosCompletos = {
        ...informacionBasica,
        indicaciones,
        contraindicaciones,
        efectos_secundarios: efectosSecundarios,
        interacciones,
        referencias
      };

      await onGuardar(datosCompletos);
      handleCerrar();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.response?.data?.message || 'Error al guardar el suplemento');
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrar = () => {
    // Resetear el formulario
    setInformacionBasica({
      nombre: '',
      nombre_cientifico: '',
      categoria_id: '',
      descripcion_corta: '',
      descripcion_detallada: '',
      para_que_sirve: '',
      beneficios_principales: [''],
      dosis_recomendada: '',
      dosis_minima: '',
      dosis_maxima: '',
      forma_presentacion: 'cápsula',
      frecuencia_recomendada: '',
      mejor_momento_toma: '',
      duracion_tratamiento_tipica: '',
      nivel_evidencia: 'media',
      destacado: false
    });
    setIndicaciones([]);
    setContraindicaciones([]);
    setEfectosSecundarios([]);
    setInteracciones([]);
    setReferencias([]);
    setTabActual(0);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {esEdicion ? '✏️ Editar Suplemento' : '💊 Nuevo Suplemento'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {esEdicion ? 'Modifique la información del suplemento' : 'Complete la información del suplemento en cada pestaña'}
          </Typography>
        </Box>
        <IconButton onClick={handleCerrar} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Tabs de navegación */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs
          value={tabActual}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 64,
              fontWeight: 500
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
                  {tab.required && <Typography color="error" component="span">*</Typography>}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Contenido del formulario */}
      <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tab 0 - Información Básica */}
        {tabActual === 0 && (
          <TabInformacionBasica
            datos={informacionBasica}
            onChange={setInformacionBasica}
            categorias={categorias}
          />
        )}

        {/* Tab 1 - Indicaciones */}
        {tabActual === 1 && (
          <TabIndicaciones
            indicaciones={indicaciones}
            onChange={setIndicaciones}
          />
        )}

        {/* Tab 2 - Contraindicaciones */}
        {tabActual === 2 && (
          <TabContraindicaciones
            contraindicaciones={contraindicaciones}
            onChange={setContraindicaciones}
          />
        )}

        {/* Tab 3 - Efectos Secundarios */}
        {tabActual === 3 && (
          <TabEfectosSecundarios
            efectos={efectosSecundarios}
            onChange={setEfectosSecundarios}
          />
        )}

        {/* Tab 4 - Interacciones */}
        {tabActual === 4 && (
          <TabInteracciones
            interacciones={interacciones}
            onChange={setInteracciones}
          />
        )}

        {/* Tab 5 - Referencias */}
        {tabActual === 5 && (
          <TabReferencias
            referencias={referencias}
            onChange={setReferencias}
          />
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {tabActual > 0 && (
              <Button
                onClick={() => setTabActual(tabActual - 1)}
                variant="outlined"
              >
                Anterior
              </Button>
            )}
            {tabActual < tabs.length - 1 && (
              <Button
                onClick={() => setTabActual(tabActual + 1)}
                variant="outlined"
              >
                Siguiente
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              variant="contained"
              disabled={guardando}
              sx={{
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5568d3' }
              }}
            >
              {guardando ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Guardando...
                </>
              ) : (
                esEdicion ? 'Actualizar Suplemento' : 'Guardar Suplemento'
              )}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ModalFormularioSuplemento;
