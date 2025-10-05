import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { crearInfografia } from '../../services/infografias.service';
import { useAuth } from '../../context/AuthContext';  // Importar el contexto

const InfografiasForm = ({ infografia, categorias, onClose, onGuardar }) => {
  // Obtener usuario del contexto
  const { user } = useAuth();
  const nombreUsuario = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : '';

  const [formData, setFormData] = useState({
    titulo: infografia?.titulo || '',
    descripcion: infografia?.descripcion || '',
    categoria_id: infografia?.categoria_id || '',
    autor: infografia?.autor || nombreUsuario,  // Usar nombre del usuario por defecto
    tags: infografia?.tags || []
  });
  
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [nuevoTag, setNuevoTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const esEdicion = !!infografia;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10MB');
        return;
      }

      // Validar tipo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!tiposPermitidos.includes(file.type)) {
        setError('Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y PDF');
        return;
      }

      setArchivo(file);
      setError(null);

      // Preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleAgregarTag = () => {
    if (nuevoTag.trim() && !formData.tags.includes(nuevoTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, nuevoTag.trim()]
      }));
      setNuevoTag('');
    }
  };

  const handleEliminarTag = (tagEliminar) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagEliminar)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    
    if (!formData.categoria_id) {
      setError('Debe seleccionar una categoría');
      return;
    }
    
    if (!esEdicion && !archivo) {
      setError('Debe seleccionar un archivo');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descripcion', formData.descripcion);
      data.append('categoria_id', formData.categoria_id);
      data.append('autor', formData.autor);
      data.append('tags', JSON.stringify(formData.tags));
      
      if (archivo) {
        data.append('archivo', archivo);
      }

      await crearInfografia(data);
      onGuardar();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.response?.data?.message || 'Error al guardar la infografía');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {esEdicion ? 'Editar Infografía' : 'Nueva Infografía'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Título */}
        <TextField
          fullWidth
          required
          label="Título"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          margin="normal"
        />

        {/* Descripción */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Descripción"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          margin="normal"
        />

        {/* Categoría */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Categoría</InputLabel>
          <Select
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
            label="Categoría"
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.icono} {cat.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Autor */}
        <TextField
          fullWidth
          label="Autor"
          name="autor"
          value={formData.autor}
          onChange={handleChange}
          margin="normal"
          placeholder="Nombre del autor o fuente"
        />

        {/* Tags */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Etiquetas
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <TextField
              size="small"
              placeholder="Nueva etiqueta"
              value={nuevoTag}
              onChange={(e) => setNuevoTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarTag())}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAgregarTag}
            >
              Agregar
            </Button>
          </Box>
          
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {formData.tags.map((tag, idx) => (
              <Chip
                key={idx}
                label={tag}
                size="small"
                onDelete={() => handleEliminarTag(tag)}
              />
            ))}
          </Box>
        </Box>

        {/* Archivo */}
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Archivo {!esEdicion && '*'}
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
          >
            {archivo ? archivo.name : 'Seleccionar archivo'}
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={handleArchivoChange}
            />
          </Button>

          {/* Preview */}
          {previewUrl && (
            <Box
              sx={{
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                p: 2
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" display="block">
            Formatos permitidos: JPEG, PNG, GIF, WebP, PDF. Tamaño máximo: 10MB
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default InfografiasForm;
