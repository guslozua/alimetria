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

      // CORRECCIÓN: El interceptor ya devuelve response.data, no necesitamos response.data.success
      console.log('🔍 Respuesta recibida:', response);
      
      if (response.success) {
        setOcrResult(response.data);
        
        // Mostrar notificación de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Imagen procesada!',
          text: response.message || 'Imagen procesada correctamente',
          timer: 2000,
          showConfirmButton: false
        });

        if (onSuccess) onSuccess(response.data);
      } else {
        throw new Error(response.message || 'Error al procesar imagen');
      }

    } catch (err) {
      console.error('❌ Error en OCR:', err);
      const errorMessage = err.message || 'Error al procesar imagen';
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
      
      if (response.success) {
        setOcrResult(response.data);
        
        Swal.fire({
          icon: 'success',
          title: 'Imagen reprocesada',
          text: response.message || 'Imagen reprocesada correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al reprocesar imagen';
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
      
      if (response.success) {
        const { rawText, lines } = response.data;
        
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
                  icon={getConfianzaIcon(ocrResult.confianza || 0)}
                  label={`Confianza: ${ocrResult.confianza || 0}%`}
                  color={getConfianzaColor(ocrResult.confianza || 0)}
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
              {ocrResult.medicion && (
                <>
                  {ocrResult.medicion.peso && (
                    <Grid item xs={6} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Peso
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {ocrResult.medicion.peso} kg
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {ocrResult.medicion.musculo && (
                    <Grid item xs={6} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Masa Muscular
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {ocrResult.medicion.musculo} kg
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {ocrResult.medicion.grasa_corporal_kg && (
                    <Grid item xs={6} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Grasa Corporal
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {ocrResult.medicion.grasa_corporal_kg} kg
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {ocrResult.medicion.imc && (
                    <Grid item xs={6} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          IMC
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {ocrResult.medicion.imc} kg/m²
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {ocrResult.medicion.grasa_corporal && (
                    <Grid item xs={6} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          % Grasa Corporal
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {ocrResult.medicion.grasa_corporal}%
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {ocrResult.medicion.puntuacion_corporal && (
                    <Grid item xs={6} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Puntuación
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {ocrResult.medicion.puntuacion_corporal} pts
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {ocrResult.medicion.fecha_medicion && (
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Fecha y Hora de Medición
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {new Date(ocrResult.medicion.fecha_medicion).toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </>
              )}
            </Grid>

            {/* Alertas de confianza */}
            {(ocrResult.confianza || 0) < 70 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  La confianza del OCR es baja ({ocrResult.confianza || 0}%). 
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