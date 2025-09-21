import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Tooltip,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { formatearFecha } from '../../utils/formatters';

const FotosEvolucion = ({ pacienteId, pacienteNombre }) => {
  const [fotos, setFotos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogSubir, setDialogSubir] = useState(false);
  const [dialogVer, setDialogVer] = useState({ open: false, foto: null });
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    archivo: null,
    tipo_foto: 'frontal',
    descripcion: '',
    peso_momento: ''
  });

  useEffect(() => {
    cargarFotos();
  }, [pacienteId]);

  const cargarFotos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/pacientes/${pacienteId}/fotos-evolucion`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setFotos(data.data.fotos || []);
        setEstadisticas(data.data.estadisticas);
      } else {
        throw new Error(data.message || 'Error al cargar las fotos');
      }
      
    } catch (error) {
      setError('Error al cargar las fotos de evolución');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubirFoto = async () => {
    if (!formData.archivo) {
      setError('Debe seleccionar una imagen');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('foto_evolucion', formData.archivo);
      formDataToSend.append('pacienteId', pacienteId);
      formDataToSend.append('tipo_foto', formData.tipo_foto);
      formDataToSend.append('descripcion', formData.descripcion);
      if (formData.peso_momento) {
        formDataToSend.append('peso_momento', formData.peso_momento);
      }

      const response = await fetch('/api/pacientes/subir-foto-evolucion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        setDialogSubir(false);
        resetFormData();
        cargarFotos(); // Recargar la lista
      } else {
        throw new Error(data.message || 'Error al subir la foto');
      }

    } catch (error) {
      setError(error.message || 'Error al subir la foto');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEliminarFoto = async (fotoId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta foto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pacientes/fotos-evolucion/${fotoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        cargarFotos(); // Recargar la lista
      } else {
        throw new Error(data.message || 'Error al eliminar la foto');
      }

    } catch (error) {
      setError('Error al eliminar la foto');
      console.error('Error:', error);
    }
  };

  const resetFormData = () => {
    setFormData({
      archivo: null,
      tipo_foto: 'frontal',
      descripcion: '',
      peso_momento: ''
    });
  };

  const handleArchivoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        archivo: file
      }));
    }
  };

  const getTipoFotoLabel = (tipo) => {
    const tipos = {
      frontal: 'Frontal',
      lateral: 'Lateral',
      posterior: 'Posterior',
      detalle: 'Detalle'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoFotoColor = (tipo) => {
    const colores = {
      frontal: 'primary',
      lateral: 'secondary',
      posterior: 'warning',
      detalle: 'info'
    };
    return colores[tipo] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con estadísticas */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoCameraIcon color="primary" />
          Fotos de Evolución - {pacienteNombre}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogSubir(true)}
        >
          Nueva Foto
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon color="primary" />
            Resumen
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">{estadisticas.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total Fotos</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6">{estadisticas.frontales}</Typography>
                <Typography variant="body2" color="text.secondary">Frontales</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6">{estadisticas.laterales}</Typography>
                <Typography variant="body2" color="text.secondary">Laterales</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6">{estadisticas.posteriores}</Typography>
                <Typography variant="body2" color="text.secondary">Posteriores</Typography>
              </Box>
            </Grid>
          </Grid>
          {estadisticas.primera_foto && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Primera foto: {formatearFecha(estadisticas.primera_foto)}
              {estadisticas.ultima_foto && estadisticas.ultima_foto !== estadisticas.primera_foto && 
                ` • Última foto: ${formatearFecha(estadisticas.ultima_foto)}`
              }
            </Typography>
          )}
        </Paper>
      )}

      {/* Lista de fotos */}
      {fotos.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay fotos de evolución
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Comienza subiendo la primera foto del paciente para hacer seguimiento de su evolución
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogSubir(true)}
          >
            Subir Primera Foto
          </Button>
        </Paper>
      ) : (
        <ImageList cols={3} gap={16}>
          {fotos.map((foto) => (
            <ImageListItem key={foto.id}>
              <img
                src={foto.ruta_imagen}
                alt={foto.descripcion || `Foto ${getTipoFotoLabel(foto.tipo_foto)}`}
                loading="lazy"
                style={{
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
                onClick={() => setDialogVer({ open: true, foto })}
              />
              <ImageListItemBar
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={getTipoFotoLabel(foto.tipo_foto)} 
                      size="small" 
                      color={getTipoFotoColor(foto.tipo_foto)}
                    />
                    {foto.peso_momento && (
                      <Chip 
                        label={`${foto.peso_momento} kg`} 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                subtitle={formatearFecha(foto.fecha)}
                actionIcon={
                  <Box>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDialogVer({ open: true, foto });
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarFoto(foto.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Dialog Subir Foto */}
      <Dialog open={dialogSubir} onClose={() => setDialogSubir(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Foto de Evolución</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<PhotoCameraIcon />}
                  sx={{ mb: 2, height: 56 }}
                >
                  {formData.archivo ? formData.archivo.name : 'Seleccionar Imagen'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleArchivoChange}
                  />
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Foto</InputLabel>
                  <Select
                    value={formData.tipo_foto}
                    label="Tipo de Foto"
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_foto: e.target.value }))}
                  >
                    <MenuItem value="frontal">Frontal</MenuItem>
                    <MenuItem value="lateral">Lateral</MenuItem>
                    <MenuItem value="posterior">Posterior</MenuItem>
                    <MenuItem value="detalle">Detalle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Peso actual (kg)"
                  type="number"
                  value={formData.peso_momento}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso_momento: e.target.value }))}
                  placeholder="Ej: 75.5"
                  inputProps={{ step: 0.1, min: 0 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción (opcional)"
                  multiline
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Ej: Foto después de 3 meses de tratamiento..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogSubir(false)} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubirFoto}
            variant="contained"
            disabled={uploading || !formData.archivo}
            startIcon={uploading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {uploading ? 'Subiendo...' : 'Subir Foto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Ver Foto */}
      <Dialog
        open={dialogVer.open}
        onClose={() => setDialogVer({ open: false, foto: null })}
        maxWidth="md"
        fullWidth
      >
        {dialogVer.foto && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={getTipoFotoLabel(dialogVer.foto.tipo_foto)} 
                  color={getTipoFotoColor(dialogVer.foto.tipo_foto)}
                />
                {dialogVer.foto.peso_momento && (
                  <Chip 
                    label={`${dialogVer.foto.peso_momento} kg`} 
                    variant="outlined"
                  />
                )}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box textAlign="center" sx={{ mb: 2 }}>
                <img
                  src={dialogVer.foto.ruta_imagen}
                  alt={dialogVer.foto.descripcion || 'Foto de evolución'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 8
                  }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Fecha:</strong> {formatearFecha(dialogVer.foto.fecha)}
              </Typography>
              
              {dialogVer.foto.usuario_nombre && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Subida por:</strong> {dialogVer.foto.usuario_nombre}
                </Typography>
              )}
              
              {dialogVer.foto.descripcion && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Descripción:</Typography>
                  <Typography variant="body2">{dialogVer.foto.descripcion}</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogVer({ open: false, foto: null })}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default FotosEvolucion;