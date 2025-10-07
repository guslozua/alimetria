import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Rating,
  Avatar,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

const TarjetaSuplemento = ({ 
  suplemento, 
  vista = 'grid',
  onClick, 
  onFavorito,
  onEditar,
  onEliminar,
  esFavorito = false 
}) => {
  const { darkMode } = useThemeMode();

  if (!suplemento) {
    console.warn('TarjetaSuplemento: suplemento prop is required');
    return null;
  }

  const {
    id,
    nombre,
    descripcion_corta,
    categoria_nombre,
    categoria_color,
    forma_presentacion,
    nivel_evidencia,
    popularidad_uso,
    destacado,
    dosis_recomendada
  } = suplemento;

  // Colores según nivel de evidencia
  const evidenciaColors = {
    alta: '#10b981',
    media: '#f59e0b',
    baja: '#ef4444',
    experimental: '#8b5cf6'
  };

  // Iconos según forma de presentación
  const formaIconos = {
    'cápsula': '💊',
    'tableta': '⚪',
    'polvo': '🥄',
    'líquido': '🧪',
    'goma': '🍬',
    'inyectable': '💉',
    'tópico': '🧴'
  };

  const rating = Math.min(5, popularidad_uso && popularidad_uso > 0 ? Math.floor(popularidad_uso / 20) + 1 : 3);

  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(suplemento);
    }
  };

  const handleFavoritoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorito) {
      onFavorito(id, !esFavorito);
    }
  };

  const handleEditarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEditar) {
      onEditar(suplemento);
    }
  };

  const handleEliminarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEliminar) {
      onEliminar(suplemento);
    }
  };

  if (vista === 'lista') {
    return (
      <Card
        sx={{
          bgcolor: darkMode ? '#1e293b' : '#ffffff',
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: darkMode 
              ? '0 8px 25px rgba(0,0,0,0.3)' 
              : '0 8px 25px rgba(0,0,0,0.1)'
          }
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: categoria_color || '#667eea',
                width: 56,
                height: 56,
                fontSize: '1.5rem'
              }}
            >
              {formaIconos[forma_presentacion] || '💊'}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {nombre}
                </Typography>
                {destacado ? (
                  <Chip
                    label="⭐ Destacado"
                    size="small"
                    sx={{ bgcolor: '#fef3c7', color: '#92400e' }}
                  />
                ) : null}
              </Box>
              
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {descripcion_corta}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={categoria_nombre}
                  size="small"
                  sx={{
                    bgcolor: (categoria_color || '#667eea') + '20',
                    color: categoria_color || '#667eea'
                  }}
                />
                <Chip
                  label={`Evidencia ${nivel_evidencia || 'media'}`}
                  size="small"
                  sx={{
                    bgcolor: evidenciaColors[nivel_evidencia || 'media'] + '20',
                    color: evidenciaColors[nivel_evidencia || 'media']
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Rating
                value={rating}
                readOnly
                size="small"
              />
              {(popularidad_uso && popularidad_uso > 0) && (
                <Typography variant="caption" color="textSecondary">
                  {popularidad_uso} consultas
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  onClick={handleFavoritoClick}
                  size="small"
                  sx={{ color: esFavorito ? '#ef4444' : 'text.secondary' }}
                >
                  {esFavorito ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                
                {onEditar && (
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={handleEditarClick}
                      size="small"
                      sx={{ color: '#667eea' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                
                {onEliminar && (
                  <Tooltip title="Eliminar">
                    <IconButton
                      onClick={handleEliminarClick}
                      size="small"
                      sx={{ color: '#ef4444' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Vista en Grid (por defecto)
  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: darkMode ? '#1e293b' : '#ffffff',
        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: darkMode 
            ? '0 12px 35px rgba(0,0,0,0.3)' 
            : '0 12px 35px rgba(0,0,0,0.1)'
        }
      }}
      onClick={handleCardClick}
    >
      {destacado ? (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}
        >
          <Chip
            label="⭐"
            size="small"
            sx={{
              bgcolor: '#fef3c7',
              color: '#92400e',
              fontSize: '0.75rem',
              height: 24
            }}
          />
        </Box>
      ) : null}

      <IconButton
        onClick={handleFavoritoClick}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 1,
          color: esFavorito ? '#ef4444' : 'rgba(255,255,255,0.7)',
          bgcolor: 'rgba(0,0,0,0.1)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.2)',
          }
        }}
        size="small"
      >
        {esFavorito ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>

      {/* Botones de acción en vista grid */}
      {(onEditar || onEliminar) && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 0.2s',
            '.MuiCard-root:hover &': {
              opacity: 1
            },
            zIndex: 1
          }}
        >
          {onEditar && (
            <Tooltip title="Editar">
              <IconButton
                onClick={handleEditarClick}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  color: '#667eea',
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#667eea', color: 'white' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onEliminar && (
            <Tooltip title="Eliminar">
              <IconButton
                onClick={handleEliminarClick}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  color: '#ef4444',
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#ef4444', color: 'white' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: categoria_color || '#667eea',
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 1.5,
              fontSize: '1.8rem',
              boxShadow: 2
            }}
          >
            {formaIconos[forma_presentacion] || '💊'}
          </Avatar>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {nombre}
          </Typography>
          
          <Chip
            label={categoria_nombre}
            size="small"
            sx={{
              bgcolor: (categoria_color || '#667eea') + '20',
              color: categoria_color || '#667eea',
              fontSize: '0.75rem'
            }}
          />
        </Box>

        <Typography 
          variant="body2" 
          color="textSecondary" 
          sx={{ 
            mb: 2,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4
          }}
        >
          {descripcion_corta}
        </Typography>

        {dosis_recomendada && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Dosis típica:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {dosis_recomendada}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={`${nivel_evidencia || 'media'} evidencia`}
            size="small"
            sx={{
              bgcolor: evidenciaColors[nivel_evidencia || 'media'] + '20',
              color: evidenciaColors[nivel_evidencia || 'media'],
              fontSize: '0.75rem',
              textTransform: 'capitalize'
            }}
          />
          
          {(popularidad_uso && popularidad_uso > 0) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant="caption" color="textSecondary">
                {popularidad_uso}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Rating
            value={rating}
            readOnly
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TarjetaSuplemento;
