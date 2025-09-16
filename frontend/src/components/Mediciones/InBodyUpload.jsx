// Componente React para subir archivos InBody
// Ubicación: frontend/src/components/Mediciones/InBodyUpload.jsx

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  Visibility,
  Check,
  Warning,
  Error as ErrorIcon,
  Info
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { api } from '../../services/api';

const InBodyUpload = ({ pacienteId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Configuración de dropzone
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log('📁 Archivo seleccionado:', file.name);

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      onError?.('Solo se permiten archivos JPEG, PNG o PDF');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError?.('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    // Mostrar vista previa primero
    await handlePreview(file);
  }, [pacienteId, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: loading
  });

  // Vista previa de los datos extraídos
  const handlePreview = async (file) => {
    setLoading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('inbody_file', file);

      setUploadProgress(50);

      const response = await api.post('/mediciones/inbody/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        }
      });

      setPreviewData({
        ...response.data,
        originalFile: file
      });
      setShowPreview(true);
      setUploadProgress(100);

    } catch (error) {
      console.error('Error en vista previa:', error);
      onError?.(error.response?.data?.message || 'Error procesando archivo');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Confirmar y guardar medición
  const handleConfirm = async () => {
    if (!previewData?.originalFile) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('inbody_file', previewData.originalFile);
      formData.append('paciente_id', pacienteId);

      const response = await api.post('/mediciones/inbody', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onSuccess?.(response.data);
      setShowPreview(false);
      setPreviewData(null);

    } catch (error) {
      console.error('Error guardando medición:', error);
      onError?.(error.response?.data?.message || 'Error guardando medición');
    } finally {
      setLoading(false);
    }
  };

  // Formatear valor para mostrar
  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined) return '---';
    return `${value}${unit}`;
  };

  // Obtener color según el tipo de validación
  const getValidationColor = (hasWarnings, hasErrors) => {
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'success';
  };

  return (
    <Box>
      {/* Área de subida */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Suelta el archivo aquí' : 'Subir archivo InBody H30'}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Arrastra y suelta un archivo o haz clic para seleccionar
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Formatos soportados: JPEG, PNG, PDF (máximo 10MB)
            </Typography>
          </Box>

          {/* Barra de progreso */}
          {loading && uploadProgress > 0 && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="textSecondary">
                {uploadProgress < 100 ? 'Procesando archivo...' : 'Extrayendo datos...'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de vista previa */}
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Visibility />
            Vista previa de datos extraídos
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {previewData && (
            <Box>
              {/* Alertas de validación */}
              {previewData.data.validation && (
                <Box mb={2}>
                  {previewData.data.validation.errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">Errores encontrados:</Typography>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {previewData.data.validation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                  
                  {previewData.data.validation.warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">Advertencias:</Typography>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {previewData.data.validation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                  
                  {previewData.data.validation.errors.length === 0 && (
                    <Alert severity="success">
                      Datos extraídos correctamente
                    </Alert>
                  )}
                </Box>
              )}

              {/* Tabla de datos extraídos */}
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Campo</strong></TableCell>
                      <TableCell><strong>Valor Extraído</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { label: 'Peso', value: previewData.data.extracted_data.peso, unit: ' kg' },
                      { label: 'IMC', value: previewData.data.extracted_data.imc, unit: ' kg/m²' },
                      { label: 'Masa Muscular', value: previewData.data.extracted_data.masa_muscular, unit: ' kg' },
                      { label: 'Grasa Corporal', value: previewData.data.extracted_data.grasa_corporal_kg, unit: ' kg' },
                      { label: '% Grasa Corporal', value: previewData.data.extracted_data.porcentaje_grasa, unit: '%' },
                      { label: 'Agua Corporal', value: previewData.data.extracted_data.agua_corporal, unit: ' kg' },
                      { label: 'Metabolismo Basal', value: previewData.data.extracted_data.metabolismo_basal, unit: ' kcal' },
                      { label: 'Puntuación', value: previewData.data.extracted_data.puntuacion_corporal, unit: ' pts' },
                      { label: 'Fecha Medición', value: previewData.data.extracted_data.fecha_medicion },
                      { label: 'Usuario', value: previewData.data.extracted_data.usuario_nombre }
                    ].map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{formatValue(item.value, item.unit)}</TableCell>
                        <TableCell>
                          {item.value !== null && item.value !== undefined ? (
                            <Chip 
                              icon={<Check />} 
                              label="Extraído" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              icon={<Warning />} 
                              label="Manual" 
                              color="warning" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Información adicional */}
              <Box mt={2}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Confianza:</strong> {previewData.data.suggestions?.confidence || 'media'}
                    <br />
                    <strong>Revisión manual necesaria:</strong> {
                      previewData.data.suggestions?.needs_manual_review ? 'Sí' : 'No'
                    }
                  </Typography>
                </Alert>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowPreview(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained" 
            disabled={loading || previewData?.data.validation?.errors.length > 0}
            startIcon={loading ? null : <Check />}
          >
            {loading ? 'Guardando...' : 'Confirmar y Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InBodyUpload;