// src/theme/modernTheme.js
import { createTheme } from '@mui/material/styles';

// Configuración de fuente moderna
const modernFontFamily = [
  'Inter',
  'Poppins', 
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'sans-serif'
].join(',');

// Paleta de colores moderna
const modernColors = {
  primary: {
    main: '#2563eb', // Azul moderno más suave
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#64748b',
    light: '#94a3b8',
    dark: '#475569',
    contrastText: '#ffffff',
  },
  background: {
    default: '#fafafa', // Fondo muy claro
    paper: '#ffffff',
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    main: '#10b981',
    light: '#6ee7b7',
    dark: '#047857',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  info: {
    main: '#06b6d4',
    light: '#67e8f9',
    dark: '#0891b2',
  }
};

// Configuración de sombras modernas
const modernShadows = [
  'none',
  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ...Array(18).fill('0 25px 50px -12px rgb(0 0 0 / 0.25)')
];

export const modernTheme = createTheme({
  palette: modernColors,
  shadows: modernShadows,
  typography: {
    fontFamily: modernFontFamily,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none', // Sin mayúsculas automáticas
      letterSpacing: '0.025em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: modernColors.grey[600],
    },
  },
  shape: {
    borderRadius: 12, // Bordes más redondeados y modernos
  },
  components: {
    // Configuración para AppBar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: modernColors.grey[800],
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }
      }
    },
    // Configuración para Paper/Cards
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid rgb(0 0 0 / 0.05)',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
        elevation4: {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
      }
    },
    // Configuración para botones
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }
        },
      }
    },
    // Configuración para campos de texto
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: modernColors.grey[300],
            },
            '&:hover fieldset': {
              borderColor: modernColors.grey[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: modernColors.primary.main,
              borderWidth: 2,
            },
          },
        }
      }
    },
    // Configuración para iconos
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
        }
      }
    },
    // Configuración para menús
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid rgb(0 0 0 / 0.05)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        }
      }
    },
    // Configuración para elementos de lista
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
          '&:hover': {
            backgroundColor: `${modernColors.primary.main}08`,
          },
          '&.Mui-selected': {
            backgroundColor: `${modernColors.primary.main}12`,
            '&:hover': {
              backgroundColor: `${modernColors.primary.main}16`,
            },
          },
        }
      }
    },
    // Configuración para chips
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.75rem',
          height: 28,
        }
      }
    },
  },
  spacing: 8,
});

export default modernTheme;