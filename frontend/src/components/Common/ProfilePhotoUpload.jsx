import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Fade,
  alpha,
  useTheme
} from '@mui/material';
import {
  PhotoCamera,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';

const ProfilePhotoUpload = ({ 
  currentPhoto, 
  onPhotoChange, 
  onPhotoDelete,
  pacienteId,
  nombreCompleto,
  sexo,
  size = 120,
  editable = true,
  showName = true
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Generar color basado en el sexo y nombre
  const getAvatarColor = () => {
    if (sexo === 'F') return theme.palette.pink?.main || '#e91e63';
    if (sexo === 'M') return theme.palette.blue?.main || '#2196f3';
    return theme.palette.grey[500];
  };

  // Generar iniciales del nombre
  const getInitials = () => {
    if (!nombreCompleto) return 'P';
    const words = nombreCompleto.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return words[0][0].toUpperCase();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Por favor selecciona una imagen válida (JPG, PNG, WebP)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    uploadPhoto(file);
  };

  const uploadPhoto = async (file) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('foto_perfil', file);
      formData.append('paciente_id', pacienteId);

      const response = await fetch('/api/pacientes/upload-foto-perfil', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen');
      }

      const data = await response.json();
      console.log('✅ Respuesta del servidor:', data);
      
      if (onPhotoChange) {
        // El backend devuelve data.data.filename
        onPhotoChange(data.data ? data.data.filename : data.filename);
      }

    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err.message || 'Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    setUploading(true);
    setError('');

    try {
      const response = await fetch(`/api/pacientes/${pacienteId}/delete-foto-perfil`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la imagen');
      }

      if (onPhotoDelete) {
        onPhotoDelete();
      }

      setDeleteConfirmOpen(false);

    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err.message || 'Error al eliminar la foto');
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const photoUrl = currentPhoto ? `/uploads/fotos-perfil/${currentPhoto}` : null;

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Avatar principal */}
      <Box
        sx={{
          position: 'relative',
          display: 'inline-block',
          mb: showName ? 2 : 0
        }}
      >
        <Avatar
          src={photoUrl}
          sx={{
            width: size,
            height: size,
            bgcolor: getAvatarColor(),
            fontSize: size * 0.3,
            fontWeight: 600,
            cursor: photoUrl && editable ? 'pointer' : 'default',
            border: `3px solid ${alpha(getAvatarColor(), 0.2)}`,
            transition: 'all 0.3s ease',
            '&:hover': photoUrl && editable ? {
              transform: 'scale(1.05)',
              boxShadow: `0 8px 25px ${alpha(getAvatarColor(), 0.3)}`
            } : {}
          }}
          onClick={() => photoUrl && editable && setPreviewOpen(true)}
        >
          {!photoUrl && (
            photoUrl ? <PersonIcon sx={{ fontSize: size * 0.6 }} /> : getInitials()
          )}
        </Avatar>

        {/* Indicador de carga */}
        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: '50%'
            }}
          >
            <CircularProgress size={size * 0.3} />
          </Box>
        )}

        {/* Botones de acción */}
        {editable && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -8,
              right: -8,
              display: 'flex',
              gap: 0.5
            }}
          >
            <IconButton
              size="small"
              onClick={openFileDialog}
              disabled={uploading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: size * 0.25,
                height: size * 0.25,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {currentPhoto ? <EditIcon sx={{ fontSize: size * 0.15 }} /> : <PhotoCamera sx={{ fontSize: size * 0.15 }} />}
            </IconButton>

            {currentPhoto && (
              <IconButton
                size="small"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={uploading}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  width: size * 0.25,
                  height: size * 0.25,
                  '&:hover': {
                    bgcolor: 'error.dark',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <DeleteIcon sx={{ fontSize: size * 0.15 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Nombre del paciente */}
      {showName && nombreCompleto && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mt: 1
          }}
        >
          {nombreCompleto}
        </Typography>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 300, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      {/* Input oculto para seleccionar archivo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
      />

      {/* Dialog de vista previa */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Foto de Perfil - {nombreCompleto}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Avatar
            src={photoUrl}
            sx={{
              width: 200,
              height: 200,
              mx: 'auto',
              mb: 2
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Click en los botones de edición para cambiar o eliminar la foto
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>
          Eliminar Foto de Perfil
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la foto de perfil de {nombreCompleto}?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeletePhoto}
            color="error"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {uploading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePhotoUpload;