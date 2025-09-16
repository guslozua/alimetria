import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import InBodyUploader from './InBodyUploader';
import FormularioRevisionOCR from './FormularioRevisionOCR';

const MedicionInBodyOCR = ({ 
  pacienteId, 
  onMedicionCreada, 
  onCancel,
  pacienteInfo = null 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [ocrData, setOcrData] = useState(null);
  const [error, setError] = useState(null);

  const steps = [
    'Subir imagen InBody',
    'Revisar y corregir datos',
    'Medición guardada'
  ];

  // Manejar éxito del OCR
  const handleOCRSuccess = (data) => {
    setOcrData(data);
    setError(null);
    setActiveStep(1); // Ir al paso de revisión
  };

  // Manejar error del OCR
  const handleOCRError = (errors) => {
    setError(errors.join(', '));
  };

  // Manejar guardado de medición
  const handleMedicionGuardada = (medicionData) => {
    setActiveStep(2); // Ir al paso final
    
    // Notificar al componente padre después de un breve delay
    setTimeout(() => {
      if (onMedicionCreada) {
        onMedicionCreada(medicionData);
      }
    }, 2000);
  };

  // Reiniciar proceso
  const reiniciarProceso = () => {
    setActiveStep(0);
    setOcrData(null);
    setError(null);
  };

  // Cancelar proceso
  const cancelarProceso = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Renderizar contenido del paso actual
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <InBodyUploader
            pacienteId={pacienteId}
            onSuccess={handleOCRSuccess}
            onError={handleOCRError}
          />
        );
        
      case 1:
        return (
          <FormularioRevisionOCR
            ocrData={ocrData}
            pacienteId={pacienteId}
            onSave={handleMedicionGuardada}
            onCancel={() => setActiveStep(0)}
          />
        );
        
      case 2:
        return (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SaveIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            
            <Typography variant="h5" gutterBottom color="success.main">
              ¡Medición InBody guardada exitosamente!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              La medición se ha procesado y guardado en el historial del paciente.
            </Typography>
            
            {pacienteInfo && (
              <Typography variant="body2" color="text.secondary">
                Paciente: {pacienteInfo.nombre} {pacienteInfo.apellido}
              </Typography>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={reiniciarProceso}
                startIcon={<UploadIcon />}
              >
                Procesar otra imagen
              </Button>
              
              <Button
                variant="contained"
                onClick={cancelarProceso}
              >
                Finalizar
              </Button>
            </Box>
          </Paper>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Medición InBody H30 con OCR
        </Typography>
        
        {pacienteInfo && (
          <Typography variant="subtitle1" color="text.secondary">
            Paciente: {pacienteInfo.nombre} {pacienteInfo.apellido}
          </Typography>
        )}
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Contenido del paso */}
      <Box>
        {renderStepContent()}
      </Box>

      {/* Información adicional para el primer paso */}
      {activeStep === 0 && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            💡 Consejos para mejores resultados de OCR:
          </Typography>
          
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Asegúrate de que la imagen esté bien iluminada</li>
            <li>Evita sombras o reflejos en la pantalla de la balanza</li>
            <li>Toma la foto desde un ángulo perpendicular</li>
            <li>Verifica que todos los números sean legibles</li>
            <li>Usa resolución alta (mínimo 1080p)</li>
          </ul>
        </Paper>
      )}
    </Box>
  );
};

export default MedicionInBodyOCR;