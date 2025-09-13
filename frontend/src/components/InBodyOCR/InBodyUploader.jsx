import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { medicionesService } from '../../services/medicionesService';
import Swal from 'sweetalert2';

const InBodyUploader = ({ pacienteId, onSuccess, onError }) => {
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Configuración de react-dropzone
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validar archivo antes de subir
    const validacion = medicionesService.validarImagenInBody(file);
    if (!validacion.esValido) {
      setError(validacion.errores.join(', '));
      if (onError) onError(validacion.errores);
      return;
    }

    await procesarArchivo(file);
  }, [pacienteId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Procesar archivo con OCR
  const procesarArchivo = async (file) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      console.log('🔄 Iniciando procesamiento OCR para:', file.name);

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await medicionesService.procesarImagenInBody(file, pacienteId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        setOcrResult(response.data.data);
        
        // Mostrar notificación de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Imagen procesada!',
          text: `Confianza del OCR: ${response.data.data.confianza}%`,
          timer: 2000,
          showConfirmButton: false
        });

        if (onSuccess) onSuccess(response.data.data);
      } else {
        throw new Error(response.data.message || 'Error al procesar imagen');
      }

    } catch (err) {
      console.error('❌ Error en OCR:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al procesar imagen';
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar imagen',
        text: errorMessage
      });

      if (onError) onError([errorMessage]);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Reprocesar imagen
  const reprocesarImagen = async () => {
    if (!ocrResult?.archivo) return;

    setUploading(true);
    setError(null);

    try {
      const response = await medicionesService.reprocesarImagenOCR(ocrResult.archivo, pacienteId);
      
      if (response.data.success) {
        setOcrResult(response.data.data);
        
        Swal.fire({
          icon: 'success',
          title: 'Imagen reprocesada',
          text: `Nueva confianza: ${response.data.data.confianza}%`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al reprocesar imagen';
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al reprocesar',
        text: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  // Ver texto OCR sin procesar
  const verTextoOCR = async () => {
    if (!ocrResult?.archivo) return;

    try {
      const response = await medicionesService.obtenerTextoOCR(ocrResult.archivo);
      
      if (response.data.success) {
        const { rawText, lines } = response.data.data;
        
        Swal.fire({
          title: 'Texto OCR Extraído',
          html: `
            <div style="text-align: left; max-height: 400px; overflow-y: auto;">
              <h4>Texto completo:</h4>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">${rawText}</pre>
              <h4>Líneas detectadas:</h4>
              <ul style="text-align: left;">
                ${lines.map(line => `<li>${line}</li>`).join('')}
              </ul>
            </div>
          `,
          width: '80%',
          confirmButtonText: 'Cerrar'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el texto OCR'
      });
    }
  };

  // Obtener color del chip de confianza
  const getConfianzaColor = (confianza) => {
    if (confianza >= 80) return 'success';
    if (confianza >= 60) return 'warning';
    return 'error';
  };

  // Obtener ícono de confianza
  const getConfianzaIcon = (confianza) => {
    if (confianza >= 80) return <CheckIcon />;
    if (confianza >= 60) return <WarningIcon />;
    return <ErrorIcon />;
  };

  return (
    <Box>
      {/* Área de subida */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        
        <UploadIcon 
          sx={{ 
            fontSize: 48, 
            color: 'primary.main', 
            mb: 2 
          }} 
        />
        
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Suelta la imagen aquí' : 'Subir imagen InBody H30'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Arrastra y suelta una imagen o haz clic para seleccionar
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Formatos: JPEG, PNG, BMP, TIFF, PDF • Máximo 10MB
        </Typography>
      </Paper>

      {/* Barra de progreso */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Procesando imagen con OCR... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Resultado del OCR */}
      {ocrResult && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Resultado del OCR
              </Typography>
              
              <Box display="flex" gap={1}>
                <Chip
                  icon={getConfianzaIcon(ocrResult.confianza)}
                  label={`Confianza: ${ocrResult.confianza}%`}
                  color={getConfianzaColor(ocrResult.confianza)}
                  size="small"
                />
                
                <Tooltip title="Ver texto OCR completo">
                  <IconButton size="small" onClick={verTextoOCR}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Reprocesar imagen">
                  <IconButton size="small" onClick={reprocesarImagen} disabled={uploading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Datos extraídos */}
            <Grid container spacing={2}>
              {ocrResult.ocrData.peso && (
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Peso
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ocrResult.ocrData.peso} kg
                      {ocrResult.ocrData.cambio_peso && (
                        <Chip 
                          label={`${ocrResult.ocrData.cambio_peso > 0 ? '+' : ''}${ocrResult.ocrData.cambio_peso}`}
                          size="small"
                          color={ocrResult.ocrData.cambio_peso > 0 ? 'error' : 'success'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {ocrResult.ocrData.masa_muscular && (
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Masa Muscular
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ocrResult.ocrData.masa_muscular} kg
                      {ocrResult.ocrData.cambio_masa_muscular && (
                        <Chip 
                          label={`${ocrResult.ocrData.cambio_masa_muscular > 0 ? '+' : ''}${ocrResult.ocrData.cambio_masa_muscular}`}
                          size="small"
                          color={ocrResult.ocrData.cambio_masa_muscular > 0 ? 'success' : 'error'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {ocrResult.ocrData.grasa_corporal_kg && (
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Grasa Corporal
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ocrResult.ocrData.grasa_corporal_kg} kg
                      {ocrResult.ocrData.cambio_grasa_corporal && (
                        <Chip 
                          label={`${ocrResult.ocrData.cambio_grasa_corporal > 0 ? '+' : ''}${ocrResult.ocrData.cambio_grasa_corporal}`}
                          size="small"
                          color={ocrResult.ocrData.cambio_grasa_corporal < 0 ? 'success' : 'error'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {ocrResult.ocrData.imc && (
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      IMC
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ocrResult.ocrData.imc} kg/m²
                      {ocrResult.ocrData.cambio_imc && (
                        <Chip 
                          label={`${ocrResult.ocrData.cambio_imc > 0 ? '+' : ''}${ocrResult.ocrData.cambio_imc}`}
                          size="small"
                          color={ocrResult.ocrData.cambio_imc < 0 ? 'success' : 'error'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {ocrResult.ocrData.grasa_corporal_porcentaje && (
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      % Grasa Corporal
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ocrResult.ocrData.grasa_corporal_porcentaje}%
                      {ocrResult.ocrData.cambio_grasa_porcentaje && (
                        <Chip 
                          label={`${ocrResult.ocrData.cambio_grasa_porcentaje > 0 ? '+' : ''}${ocrResult.ocrData.cambio_grasa_porcentaje}`}
                          size="small"
                          color={ocrResult.ocrData.cambio_grasa_porcentaje < 0 ? 'success' : 'error'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {ocrResult.ocrData.puntuacion_corporal && (
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Puntuación
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ocrResult.ocrData.puntuacion_corporal} pts
                    </Typography>
                  </Box>
                </Grid>
              )}

              {ocrResult.ocrData.percentil && (
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Percentil
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ocrResult.ocrData.percentil}%
                    </Typography>
                  </Box>
                </Grid>
              )}

              {ocrResult.ocrData.fecha_medicion && (
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fecha y Hora de Medición
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {new Date(ocrResult.ocrData.fecha_hora_completa || ocrResult.ocrData.fecha_medicion).toLocaleString('es-ES')}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Alertas de confianza */}
            {ocrResult.confianza < 70 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  La confianza del OCR es baja ({ocrResult.confianza}%). 
                  Te recomendamos revisar y corregir los datos antes de guardar la medición.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default InBodyUploader;