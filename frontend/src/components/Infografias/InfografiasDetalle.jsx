import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';

const InfografiasDetalle = ({ infografia, onClose, onDescargar }) => {
  const esPDF = infografia.tipo_archivo === 'application/pdf';

  return (
    <>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{infografia.titulo}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Preview de la imagen/PDF */}
        <Box 
          sx={{ 
            mb: 3, 
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            p: 2
          }}
        >
          {esPDF ? (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Vista previa no disponible para PDF
              </Typography>
              <GetAppIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
            </Box>
          ) : (
            <img
              src={infografia.ruta_archivo}  // Usar directamente la ruta que viene del backend
              alt={infografia.titulo}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
              onError={(e) => {
                console.error('Error cargando imagen:', infografia.ruta_archivo);
                e.target.src = '/placeholder-image.png';
              }}
            />
          )}
        </Box>

        {/* Categoría */}
        <Box mb={2}>
          <Chip
            label={infografia.categoria_nombre}
            sx={{
              backgroundColor: infografia.categoria_color,
              color: 'white'
            }}
          />
        </Box>

        {/* Descripción */}
        {infografia.descripcion && (
          <>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Descripción
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              {infografia.descripcion}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Tags */}
        {infografia.tags && infografia.tags.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Etiquetas
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {infografia.tags.map((tag, idx) => (
                <Chip 
                  key={idx} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Información adicional */}
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Información
          </Typography>
          <Box component="dl" sx={{ '& dt': { fontWeight: 'bold', display: 'inline' }, '& dd': { display: 'inline', ml: 1 } }}>
            {infografia.autor && (
              <>
                <dt>Autor:</dt>
                <dd>{infografia.autor}</dd>
                <br />
              </>
            )}
            <dt>Tipo de archivo:</dt>
            <dd>{esPDF ? 'PDF' : 'Imagen'}</dd>
            <br />
            <dt>Tamaño:</dt>
            <dd>{(infografia.tamaño / 1024 / 1024).toFixed(2)} MB</dd>
            <br />
            <dt>Descargas:</dt>
            <dd>{infografia.descargas}</dd>
            <br />
            <dt>Fecha de creación:</dt>
            <dd>{new Date(infografia.fecha_creacion).toLocaleDateString('es-AR')}</dd>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={onDescargar}
        >
          Descargar
        </Button>
      </DialogActions>
    </>
  );
};

export default InfografiasDetalle;
