// src/components/Common/TypographyHelpers.jsx
import React from 'react';
import { Typography, Box, styled } from '@mui/material';

// Título principal de página
export const PageTitle = ({ children, icon, subtitle, ...props }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: subtitle ? 1 : 0 }}>
      {icon && <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'text.primary'
        }}
        {...props}
      >
        {children}
      </Typography>
    </Box>
    {subtitle && (
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ ml: icon ? 7 : 0 }}
      >
        {subtitle}
      </Typography>
    )}
  </Box>
);

// Título de sección
export const SectionTitle = ({ children, level = 'h6', action, ...props }) => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    mb: 2 
  }}>
    <Typography 
      variant={level} 
      component="h2"
      sx={{ 
        fontWeight: 600,
        color: 'text.primary'
      }}
      {...props}
    >
      {children}
    </Typography>
    {action && <Box>{action}</Box>}
  </Box>
);

// Texto de información principal
export const InfoText = ({ children, strong, ...props }) => (
  <Typography 
    variant="body1"
    sx={{ 
      fontWeight: strong ? 500 : 400,
      lineHeight: 1.6
    }}
    {...props}
  >
    {children}
  </Typography>
);

// Texto secundario/metadatos
export const MetaText = ({ children, ...props }) => (
  <Typography 
    variant="body2" 
    color="text.secondary"
    sx={{ 
      fontSize: '0.875rem',
      lineHeight: 1.5
    }}
    {...props}
  >
    {children}
  </Typography>
);

// Estadística destacada
export const StatText = ({ value, label, color = 'primary', ...props }) => (
  <Box textAlign="center" {...props}>
    <Typography 
      variant="h3" 
      color={`${color}.main`}
      sx={{ 
        fontWeight: 700,
        letterSpacing: '-0.02em'
      }}
    >
      {value}
    </Typography>
    <Typography 
      variant="body2" 
      color="text.secondary"
      sx={{ 
        fontWeight: 500,
        mt: 0.5
      }}
    >
      {label}
    </Typography>
  </Box>
);

// Componente estilizado para tablas modernas
export const StyledTable = styled('table')(({ theme }) => ({
  width: '100%',
  borderCollapse: 'collapse',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  
  '& th': {
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(2),
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    textAlign: 'left'
  },
  
  '& td': {
    padding: theme.spacing(2),
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    
    '&:last-child': {
      textAlign: 'right'
    }
  },
  
  '& tr:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[25] || 'rgba(0, 0, 0, 0.02)'
  },
  
  '& tr:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

export default {
  PageTitle,
  SectionTitle,
  InfoText,
  MetaText,
  StatText,
  StyledTable
};