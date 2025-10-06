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

const IMCScale = ({ imc }) => {
  const theme = useTheme();
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);

  // Rangos del IMC
  const ranges = [
    { min: 0, max: 18.5, label: '<18.5', category: 'Bajo peso', color: '#3b82f6', lightColor: '#dbeafe' },
    { min: 18.5, max: 25, label: '18.5-24.9', category: 'Normal', color: '#10b981', lightColor: '#d1fae5' },
    { min: 25, max: 30, label: '25-29.9', category: 'Sobrepeso', color: '#f59e0b', lightColor: '#fef3c7' },
    { min: 30, max: 35, label: '30-34.9', category: 'Obesidad', color: '#f97316', lightColor: '#ffedd5' },
    { min: 35, max: 100, label: '>35', category: 'Obesidad extrema', color: '#ef4444', lightColor: '#fee2e2' }
  ];

  // Calcular la posición del indicador basado en el IMC
  useEffect(() => {
    if (imc) {
      // Calcular posición porcentual
      let position = 0;
      
      if (imc < 18.5) {
        // Rango 0-18.5 ocupa 20% de la barra
        position = (imc / 18.5) * 20;
      } else if (imc < 25) {
        // Rango 18.5-25 ocupa el siguiente 20%
        position = 20 + ((imc - 18.5) / (25 - 18.5)) * 20;
      } else if (imc < 30) {
        // Rango 25-30 ocupa el siguiente 20%
        position = 40 + ((imc - 25) / (30 - 25)) * 20;
      } else if (imc < 35) {
        // Rango 30-35 ocupa el siguiente 20%
        position = 60 + ((imc - 30) / (35 - 30)) * 20;
      } else {
        // Más de 35 ocupa el último 20%
        position = 80 + Math.min(((imc - 35) / 10) * 20, 20);
      }
      
      // Limitar entre 0 y 100
      position = Math.max(0, Math.min(100, position));
      
      setIndicatorPosition(position);
      
      // Mostrar el indicador con un pequeño delay para la animación
      setTimeout(() => setShowIndicator(true), 100);
    }
  }, [imc]);

  // Encontrar la categoría actual
  const currentCategory = ranges.find(r => imc >= r.min && imc < r.max) || ranges[ranges.length - 1];

  return (
    <Box sx={{ width: '100%', py: 3 }}>
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
            Tu IMC: {imc.toFixed(1)} - {currentCategory.category}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default IMCScale;
