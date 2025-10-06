import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';

// Animación para el indicador
const slideIn = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

const ICCScale = ({ icc, sexo }) => {
  const theme = useTheme();
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);

  // Rangos del ICC según sexo
  const rangesMasculino = [
    { min: 0, max: 0.95, label: '<0.95', category: 'Bajo riesgo', color: '#10b981', lightColor: '#d1fae5' },
    { min: 0.95, max: 1.0, label: '0.95-1.0', category: 'Riesgo moderado', color: '#f59e0b', lightColor: '#fef3c7' },
    { min: 1.0, max: 2.0, label: '>1.0', category: 'Riesgo alto', color: '#ef4444', lightColor: '#fee2e2' }
  ];

  const rangesFemenino = [
    { min: 0, max: 0.80, label: '<0.80', category: 'Bajo riesgo', color: '#10b981', lightColor: '#d1fae5' },
    { min: 0.80, max: 0.85, label: '0.80-0.85', category: 'Riesgo moderado', color: '#f59e0b', lightColor: '#fef3c7' },
    { min: 0.85, max: 2.0, label: '>0.85', category: 'Riesgo alto', color: '#ef4444', lightColor: '#fee2e2' }
  ];

  const ranges = sexo === 'M' ? rangesMasculino : rangesFemenino;

  // Calcular la posición del indicador basado en el ICC
  useEffect(() => {
    if (icc && sexo) {
      let position = 0;
      const iccNum = parseFloat(icc);
      
      if (sexo === 'M') {
        if (iccNum < 0.95) {
          // Rango 0-0.95 ocupa 33.3% de la barra
          position = (iccNum / 0.95) * 33.3;
        } else if (iccNum < 1.0) {
          // Rango 0.95-1.0 ocupa el siguiente 33.3%
          position = 33.3 + ((iccNum - 0.95) / (1.0 - 0.95)) * 33.3;
        } else {
          // Más de 1.0 ocupa el último 33.3%
          position = 66.6 + Math.min(((iccNum - 1.0) / 0.2) * 33.3, 33.3);
        }
      } else {
        if (iccNum < 0.80) {
          // Rango 0-0.80 ocupa 33.3% de la barra
          position = (iccNum / 0.80) * 33.3;
        } else if (iccNum < 0.85) {
          // Rango 0.80-0.85 ocupa el siguiente 33.3%
          position = 33.3 + ((iccNum - 0.80) / (0.85 - 0.80)) * 33.3;
        } else {
          // Más de 0.85 ocupa el último 33.3%
          position = 66.6 + Math.min(((iccNum - 0.85) / 0.15) * 33.3, 33.3);
        }
      }
      
      // Limitar entre 0 y 100
      position = Math.max(0, Math.min(100, position));
      
      setIndicatorPosition(position);
      
      // Mostrar el indicador con un pequeño delay para la animación
      setTimeout(() => setShowIndicator(true), 100);
    }
  }, [icc, sexo]);

  // Encontrar la categoría actual
  const iccNum = parseFloat(icc);
  const currentCategory = ranges.find(r => iccNum >= r.min && iccNum < r.max) || ranges[ranges.length - 1];

  return (
    <Box sx={{ width: '100%', py: 3 }}>
      {/* Título con sexo */}
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 2, 
          textAlign: 'center',
          fontWeight: 600,
          color: 'text.secondary'
        }}
      >
        Valores de referencia para {sexo === 'M' ? 'hombres' : 'mujeres'}
      </Typography>

      {/* Escala de colores */}
      <Box
        sx={{
          position: 'relative',
          height: 40,
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {ranges.map((range, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              bgcolor: range.color,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scaleY(1.1)',
                zIndex: 1
              }
            }}
          />
        ))}

        {/* Indicador de posición */}
        {showIndicator && (
          <Box
            sx={{
              position: 'absolute',
              left: `${indicatorPosition}%`,
              top: 0,
              transform: 'translateX(-50%)',
              animation: `${slideIn} 0.5s ease-out`,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%'
            }}
          >
            {/* Línea vertical */}
            <Box
              sx={{
                width: 3,
                height: '100%',
                bgcolor: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a',
                boxShadow: '0 0 8px rgba(0,0,0,0.3)',
                animation: `${pulse} 2s ease-in-out infinite`,
                borderRadius: '4px'
              }}
            />
          </Box>
        )}
      </Box>

      {/* Etiquetas de rangos */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 2,
          px: 1
        }}
      >
        {ranges.map((range, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              textAlign: 'center',
              px: 0.5
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: currentCategory === range ? 700 : 500,
                color: currentCategory === range ? range.color : 'text.secondary',
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                lineHeight: 1.2
              }}
            >
              {range.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                color: 'text.secondary',
                mt: 0.5
              }}
            >
              {range.category}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Indicador de valor actual */}
      {showIndicator && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: currentCategory.lightColor,
            border: `2px solid ${currentCategory.color}`,
            textAlign: 'center',
            animation: `${slideIn} 0.6s ease-out`
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: currentCategory.color,
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            Tu ICC: {icc} - {currentCategory.category}
          </Typography>
        </Box>
      )}

      {/* Información adicional */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
          <strong>Sobre el ICC:</strong><br />
          El Índice Cintura/Cadera evalúa la distribución de grasa corporal y el riesgo de enfermedades cardiovasculares.
          Una mayor acumulación de grasa en la zona abdominal (forma de "manzana") representa mayor riesgo que la 
          acumulación en caderas y muslos (forma de "pera").
        </Typography>
      </Box>
    </Box>
  );
};

export default ICCScale;
