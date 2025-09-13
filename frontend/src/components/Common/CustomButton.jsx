import React from 'react';

// Botón completamente personalizado sin Material-UI
const CustomButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'medium',
  disabled = false,
  onClick,
  startIcon,
  sx = {},
  fullWidth = false,
  ...props 
}) => {
  
  // Definir colores base
  const colors = {
    primary: {
      main: '#1976d2',
      dark: '#1565c0',
      contrastText: '#fff'
    },
    secondary: {
      main: '#4caf50',
      dark: '#388e3c',
      contrastText: '#fff'
    },
    error: {
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#fff'
    },
    default: {
      main: '#757575',
      dark: '#616161',
      contrastText: '#fff'
    }
  };

  // Definir tamaños
  const sizes = {
    small: {
      padding: '4px 8px',
      fontSize: '0.75rem',
      minHeight: '24px'
    },
    medium: {
      padding: '8px 16px',
      fontSize: '0.875rem',
      minHeight: '36px'
    },
    large: {
      padding: '12px 24px',
      fontSize: '1rem',
      minHeight: '48px'
    }
  };

  // Obtener configuración de color
  const colorConfig = colors[color] || colors.primary;
  const sizeConfig = sizes[size] || sizes.medium;

  // Estilos base
  const baseStyles = {
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    textTransform: 'none',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    ...sizeConfig,
    gap: startIcon ? '8px' : '0'
  };

  // Estilos por variante
  const variantStyles = {
    contained: {
      backgroundColor: disabled ? '#e0e0e0' : colorConfig.main,
      color: disabled ? '#9e9e9e' : colorConfig.contrastText,
      boxShadow: disabled ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
      '&:hover': !disabled ? {
        backgroundColor: colorConfig.dark,
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      } : {}
    },
    outlined: {
      backgroundColor: 'transparent',
      color: disabled ? '#9e9e9e' : colorConfig.main,
      border: `2px solid ${disabled ? '#e0e0e0' : colorConfig.main}`,
      '&:hover': !disabled ? {
        backgroundColor: `${colorConfig.main}20`,
        borderColor: colorConfig.dark
      } : {}
    },
    text: {
      backgroundColor: 'transparent',
      color: disabled ? '#9e9e9e' : colorConfig.main,
      '&:hover': !disabled ? {
        backgroundColor: `${colorConfig.main}10`
      } : {}
    }
  };

  // Combinar estilos
  const buttonStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sx
  };

  // Manejar hover manualmente
  const [isHovered, setIsHovered] = React.useState(false);
  const hoverStyles = variantStyles[variant]['&:hover'] || {};

  const finalStyles = {
    ...buttonStyles,
    ...(isHovered && !disabled ? hoverStyles : {})
  };

  return (
    <button
      {...props}
      style={finalStyles}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
    >
      {startIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{startIcon}</span>}
      {children}
    </button>
  );
};

export default CustomButton;
