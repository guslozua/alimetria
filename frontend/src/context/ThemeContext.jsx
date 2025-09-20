import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import modernTheme from '../theme/modernTheme';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

export const ThemeModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Recuperar preferencia del localStorage
    const saved = localStorage.getItem('alimetria-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Guardar preferencia en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('alimetria-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Crear tema dinámico basado en el modo
  const theme = createTheme({
    ...modernTheme,
    palette: {
      ...modernTheme.palette,
      mode: darkMode ? 'dark' : 'light',
      // Sobrescribir colores específicos para modo oscuro
      ...(darkMode && {
        background: {
          default: '#0f172a', // Fondo oscuro
          paper: '#1e293b',   // Fondo de papers/cards
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
        },
        grey: {
          50: '#1e293b',
          100: '#334155',
          200: '#475569',
          300: '#64748b',
          400: '#94a3b8',
          500: '#cbd5e1',
          600: '#e2e8f0',
          700: '#f1f5f9',
          800: '#f8fafc',
          900: '#ffffff',
        }
      })
    },
    components: {
      ...modernTheme.components,
      // Ajustar componentes para modo oscuro
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#f8fafc' : modernTheme.palette.grey[800],
            boxShadow: darkMode 
              ? '0 1px 3px 0 rgb(0 0 0 / 0.3)' 
              : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            borderBottom: darkMode 
              ? '1px solid rgb(255 255 255 / 0.1)'
              : '1px solid rgb(0 0 0 / 0.1)',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            border: darkMode 
              ? '1px solid rgb(255 255 255 / 0.1)' 
              : '1px solid rgb(0 0 0 / 0.05)',
          }
        }
      }
    }
  });

  const value = {
    darkMode,
    toggleDarkMode,
    theme
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;