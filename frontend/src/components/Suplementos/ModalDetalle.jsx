import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Alert,
  Button,
  Stack,
  Avatar,
  LinearProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Science as ScienceIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Healing as HealingIcon,
  Biotech as BiotechIcon
} from '@mui/icons-material';
import suplementosService from '../../services/suplementosService';

const ModalDetalle = ({ suplemento, abierto, onCerrar, darkMode }) => {
  const [tabActual, setTabActual] = useState(0);
  const [detalleCompleto, setDetalleCompleto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar detalle completo cuando se abre el modal
  useEffect(() => {
    if (abierto && suplemento?.id) {
      cargarDetalleCompleto();
    }
  }, [abierto, suplemento?.id]);

  const cargarDetalleCompleto = async () => {
    try {
      setLoading(true);
      const response = await suplementosService.obtenerDetalle(suplemento.id);
      setDetalleCompleto(response.data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!suplemento) return null;

  const handleTabChange = (event, newValue) => {
    setTabActual(newValue);
  };

  // Colores según severidad
  const severidadColors = {
    alta: '#ef4444',
    grave: '#ef4444',
    media: '#f59e0b',
    moderada: '#f59e0b',
    baja: '#10b981',
    leve: '#10b981'
  };

  // Colores según evidencia
  const evidenciaColors = {
    alta: '#10b981',
    media: '#f59e0b',
    baja: '#ef4444',
    experimental: '#8b5cf6'
  };

  // Iconos según forma de presentación
  const formaIconos = {
    'cápsula': '💊',
    'tableta': '⚪',
    'polvo': '🥄',
    'líquido': '🧪',
    'goma': '🍬',
    'inyectable': '💉',
    'tópico': '🧴'
  };

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: darkMode ? '#1e293b' : '#ffffff',
          backgroundImage: 'none',
          maxHeight: '90vh',
          border: darkMode ? '1px solid #374151' : 'none'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: suplemento.categoria_color || '#667eea',
                width: 48,
                height: 48,
                fontSize: '1.2rem'
              }}
            >
              {formaIconos[suplemento.forma_presentacion] || '💊'}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {suplemento.nombre}
              </Typography>
              {detalleCompleto?.nombre_cientifico && (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  {detalleCompleto.nombre_cientifico}
                </Typography>
              )}
            </Box>
          </Box>
          
          <IconButton onClick={onCerrar} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Badges informativos */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
          <Chip
            label={suplemento.categoria_nombre}
            sx={{
              bgcolor: suplemento.categoria_color + '20',
              color: suplemento.categoria_color,
              fontWeight: 600
            }}
          />
          <Chip
            label={`Evidencia ${suplemento.nivel_evidencia || 'media'}`}
            sx={{
              bgcolor: evidenciaColors[suplemento.nivel_evidencia || 'media'] + '20',
              color: evidenciaColors[suplemento.nivel_evidencia || 'media']
            }}
          />
          {suplemento.destacado ? (
            <Chip 
              label="⭐ Destacado" 
              sx={{ bgcolor: '#fef3c7', color: '#92400e' }} 
            />
          ) : null}
          {(suplemento.popularidad_uso && suplemento.popularidad_uso > 0) && (
            <Chip 
              label={`${suplemento.popularidad_uso} consultas`} 
              variant="outlined" 
            />
          )}
        </Stack>
      </DialogTitle>

      {/* Loading */}
      {loading && <LinearProgress />}

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 2 }}>
        {/* Tabs */}
        <Tabs
          value={tabActual}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 'auto',
              px: 2
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<InfoIcon />} label="General" />
          <Tab icon={<CheckCircleIcon />} label="Indicaciones" />
          <Tab icon={<WarningIcon />} label="Contraindicaciones" />
          <Tab icon={<BiotechIcon />} label="Interacciones" />
          <Tab icon={<ScienceIcon />} label="Evidencia" />
        </Tabs>

        {/* Tab Panels */}
        {tabActual === 0 && (
          <Box>
            {/* Información básica */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HealingIcon color="primary" /> ¿Para qué sirve?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {detalleCompleto?.para_que_sirve || suplemento.descripcion_corta}
            </Typography>

            {/* Dosificación */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalPharmacyIcon color="primary" /> Dosificación y Administración
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Dosis recomendada
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {detalleCompleto?.dosis_recomendada || suplemento.dosis_recomendada || 'Consultar con profesional'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Forma de presentación
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{formaIconos[suplemento.forma_presentacion]}</span>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                      {suplemento.forma_presentacion}
                    </Typography>
                  </Box>
                </Grid>

                {detalleCompleto?.mejor_momento_toma && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      <ScheduleIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                      Mejor momento para tomar
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {detalleCompleto.mejor_momento_toma}
                    </Typography>
                  </Grid>
                )}

                {detalleCompleto?.frecuencia_recomendada && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Frecuencia
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {detalleCompleto.frecuencia_recomendada}
                    </Typography>
                  </Grid>
                )}

                {detalleCompleto?.duracion_tratamiento_tipica && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Duración típica del tratamiento
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {detalleCompleto.duracion_tratamiento_tipica}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Beneficios principales */}
            {detalleCompleto?.beneficios_principales && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  ✨ Beneficios Principales
                </Typography>
                <Grid container spacing={1}>
                  {(typeof detalleCompleto.beneficios_principales === 'string' 
                    ? JSON.parse(detalleCompleto.beneficios_principales) 
                    : detalleCompleto.beneficios_principales
                  ).map((beneficio, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        p: 2, 
                        bgcolor: darkMode ? '#0f172a' : '#f0fdf4',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: darkMode ? '#374151' : '#bbf7d0'
                      }}>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem', flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {beneficio}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Descripción detallada */}
            {detalleCompleto?.descripcion_detallada && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  📖 Descripción Detallada
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6, textAlign: 'justify' }}>
                  {detalleCompleto.descripcion_detallada}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {tabActual === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" /> Indicaciones y Usos Terapéuticos
            </Typography>
            
            {detalleCompleto?.indicaciones?.length > 0 ? (
              <Stack spacing={2}>
                {detalleCompleto.indicaciones.map((indicacion, index) => (
                  <Card
                    key={indicacion.id || index}
                    sx={{
                      bgcolor: darkMode ? '#0f172a' : '#ffffff',
                      border: '1px solid',
                      borderColor: darkMode ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                          {indicacion.indicacion}
                        </Typography>
                        <Chip
                          label={indicacion.nivel_recomendacion || 'Media'}
                          size="small"
                          sx={{
                            bgcolor: indicacion.nivel_recomendacion === 'alta' ? '#dcfce7' : 
                                     indicacion.nivel_recomendacion === 'media' ? '#fef3c7' : '#fee2e2',
                            color: indicacion.nivel_recomendacion === 'alta' ? '#166534' : 
                                   indicacion.nivel_recomendacion === 'media' ? '#92400e' : '#dc2626',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      
                      {indicacion.perfil_paciente && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GroupIcon sx={{ fontSize: '1rem' }} />
                            Perfil del paciente:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {indicacion.perfil_paciente}
                          </Typography>
                        </Box>
                      )}

                      {indicacion.notas_adicionales && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            {indicacion.notas_adicionales}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">
                <Typography variant="body1">
                  No hay indicaciones específicas registradas para este suplemento. 
                  Consulte siempre con un profesional de la salud antes de iniciar cualquier suplementación.
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {tabActual === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" /> Contraindicaciones y Precauciones
            </Typography>
            
            {detalleCompleto?.contraindicaciones?.length > 0 ? (
              <Stack spacing={2}>
                {detalleCompleto.contraindicaciones.map((contraindicacion, index) => (
                  <Alert
                    key={contraindicacion.id || index}
                    severity={
                      contraindicacion.tipo === 'contraindicacion' ? 'error' :
                      contraindicacion.tipo === 'precaucion' ? 'warning' : 'info'
                    }
                    sx={{ 
                      textAlign: 'left',
                      '& .MuiAlert-message': { width: '100%' }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {contraindicacion.tipo === 'contraindicacion' ? '🚫 Contraindicación Absoluta' :
                         contraindicacion.tipo === 'precaucion' ? '⚡ Precaución' : '💡 Advertencia'}
                        {contraindicacion.severidad && (
                          <Chip
                            label={contraindicacion.severidad}
                            size="small"
                            sx={{
                              ml: 1,
                              bgcolor: severidadColors[contraindicacion.severidad] + '20',
                              color: severidadColors[contraindicacion.severidad],
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {contraindicacion.descripcion}
                      </Typography>
                      
                      {contraindicacion.poblacion_afectada && (
                        <Typography variant="body2" sx={{ 
                          fontStyle: 'italic', 
                          color: 'text.secondary',
                          mt: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          <GroupIcon sx={{ fontSize: '0.9rem' }} />
                          Población afectada: {contraindicacion.poblacion_afectada}
                        </Typography>
                      )}
                    </Box>
                  </Alert>
                ))}
              </Stack>
            ) : (
              <Alert severity="success">
                <Typography variant="body1">
                  No se han registrado contraindicaciones específicas para este suplemento.
                  Sin embargo, siempre consulte con un profesional de la salud antes de iniciar cualquier suplementación,
                  especialmente si tiene condiciones médicas preexistentes o está tomando medicamentos.
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {tabActual === 3 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BiotechIcon color="primary" /> Interacciones Medicamentosas y Nutricionales
            </Typography>
            
            {detalleCompleto?.interacciones?.length > 0 ? (
              <Stack spacing={3}>
                {detalleCompleto.interacciones.map((interaccion, index) => (
                  <Card
                    key={interaccion.id || index}
                    sx={{
                      bgcolor: darkMode ? '#0f172a' : '#ffffff',
                      border: `2px solid ${severidadColors[interaccion.severidad] || '#e5e7eb'}20`,
                      borderLeftColor: severidadColors[interaccion.severidad] || '#e5e7eb',
                      borderLeftWidth: 4
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {interaccion.nombre_interaccion}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={interaccion.severidad || 'Media'}
                            size="small"
                            sx={{
                              bgcolor: severidadColors[interaccion.severidad] + '20',
                              color: severidadColors[interaccion.severidad],
                              fontWeight: 600
                            }}
                          />
                          <Chip
                            label={interaccion.tipo_interaccion}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {interaccion.descripcion_interaccion}
                      </Typography>
                      
                      {interaccion.recomendacion && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            💡 Recomendación:
                          </Typography>
                          <Typography variant="body2">
                            {interaccion.recomendacion}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">
                <Typography variant="body1">
                  No se han registrado interacciones específicas para este suplemento.
                  No obstante, informe siempre a su médico o farmacéutico sobre todos los suplementos que está tomando.
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {tabActual === 4 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScienceIcon color="primary" /> Evidencia Científica y Referencias
            </Typography>
            
            {/* Nivel de evidencia general */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: evidenciaColors[detalleCompleto?.nivel_evidencia || 'media'] + '20',
                    color: evidenciaColors[detalleCompleto?.nivel_evidencia || 'media'],
                    width: 48,
                    height: 48
                  }}
                >
                  <ScienceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Nivel de Evidencia: {(detalleCompleto?.nivel_evidencia || 'media').toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {detalleCompleto?.nivel_evidencia === 'alta' && 'Múltiples estudios clínicos controlados'}
                    {detalleCompleto?.nivel_evidencia === 'media' && 'Algunos estudios clínicos y observacionales'}
                    {detalleCompleto?.nivel_evidencia === 'baja' && 'Evidencia limitada o estudios preliminares'}
                    {detalleCompleto?.nivel_evidencia === 'experimental' && 'Investigación en etapas tempranas'}
                    {!detalleCompleto?.nivel_evidencia && 'Evidencia científica moderada'}
                  </Typography>
                </Box>
              </Box>
              
              {(detalleCompleto?.popularidad_uso && detalleCompleto.popularidad_uso > 0) && (
                <Typography variant="body2" color="textSecondary">
                  Popularidad de uso en consultas: {detalleCompleto.popularidad_uso} veces
                </Typography>
              )}
            </Paper>

            {/* Referencias científicas */}
            {detalleCompleto?.referencias?.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  📚 Referencias Científicas
                </Typography>
                <Stack spacing={2}>
                  {detalleCompleto.referencias.map((referencia, index) => (
                    <Card
                      key={referencia.id || index}
                      sx={{
                        bgcolor: darkMode ? '#0f172a' : '#ffffff',
                        border: '1px solid',
                        borderColor: darkMode ? '#374151' : '#e5e7eb'
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, pr: 2 }}>
                            {referencia.titulo_estudio}
                          </Typography>
                          <Chip
                            label={referencia.calidad_evidencia || 'Moderada'}
                            size="small"
                            sx={{
                              bgcolor: evidenciaColors[referencia.calidad_evidencia] + '20',
                              color: evidenciaColors[referencia.calidad_evidencia],
                              fontWeight: 600
                            }}
                          />
                        </Box>

                        {referencia.autores && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            <strong>Autores:</strong> {referencia.autores}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          {referencia.revista_publicacion && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Revista:</strong> {referencia.revista_publicacion}
                            </Typography>
                          )}
                          {referencia.año_publicacion && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Año:</strong> {referencia.año_publicacion}
                            </Typography>
                          )}
                          {referencia.tipo_estudio && (
                            <Chip
                              label={referencia.tipo_estudio.replace('_', ' ')}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          )}
                        </Box>

                        {referencia.resumen_hallazgos && (
                          <Typography variant="body2" sx={{ 
                            bgcolor: darkMode ? '#1e293b' : '#f8fafc',
                            p: 2,
                            borderRadius: 1,
                            fontStyle: 'italic'
                          }}>
                            {referencia.resumen_hallazgos}
                          </Typography>
                        )}

                        {referencia.url_referencia && (
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              href={referencia.url_referencia}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: 'none' }}
                            >
                              Ver publicación completa
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            ) : (
              <Alert severity="info">
                <Typography variant="body1">
                  No hay referencias científicas específicas registradas para este suplemento.
                  La información presentada se basa en conocimiento general disponible en la literatura científica.
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onCerrar}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDetalle;