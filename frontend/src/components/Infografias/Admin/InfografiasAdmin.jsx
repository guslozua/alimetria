import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CloudDownload as DownloadIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { 
  obtenerInfografias, 
  obtenerCategorias, 
  eliminarInfografia,
  actualizarInfografia,
  descargarInfografia 
} from '../../../services/infografias.service';
import InfografiasDetalle from '../InfografiasDetalle';
import InfografiasForm from '../InfografiasForm';
import { formatearFecha } from '../../../utils/formatters';

const InfografiasAdmin = () => {
  const { isAdmin, isNutricionista } = useAuth();
  
  const [infografias, setInfografias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [mostrarInactivas, setMostrarInactivas] = useState(true);
  
  // Modales
  const [modalDetalle, setModalDetalle] = useState({ open: false, infografia: null });
  const [modalEditar, setModalEditar] = useState({ open: false, infografia: null });
  const [modalEliminar, setModalEliminar] = useState({ open: false, infografia: null });
  const [modalNueva, setModalNueva] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [infografiasRes, categoriasRes] = await Promise.all([
        obtenerInfografias({ incluir_inactivas: true }),  // Traer todas (activas e inactivas)
        obtenerCategorias()
      ]);
      
      setInfografias(infografiasRes.data || []);
      setCategorias(categoriasRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar las infografías');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (infografia) => {
    try {
      const nuevoEstado = infografia.activo === 1 ? 0 : 1;
      
      await actualizarInfografia(infografia.id, { activo: nuevoEstado });
      
      setSuccess(`Infografía ${nuevoEstado === 1 ? 'activada' : 'desactivada'} exitosamente`);
      cargarDatos();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error al cambiar el estado de la infografía');
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarInfografia(modalEliminar.infografia.id);
      
      setModalEliminar({ open: false, infografia: null });
      setSuccess('Infografía eliminada exitosamente');
      cargarDatos();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar la infografía');
      setModalEliminar({ open: false, infografia: null });
    }
  };

  const handleDescargar = async (infografia) => {
    try {
      await descargarInfografia(infografia.id, infografia.nombre_archivo);
    } catch (err) {
      console.error('Error al descargar:', err);
      setError('Error al descargar la infografía');
    }
  };

  // Filtrar infografías
  const infografiasFiltradas = infografias.filter(inf => {
    // Filtro de activo/inactivo
    if (!mostrarInactivas && inf.activo === 0) return false;
    
    // Filtro de búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const matchTitulo = inf.titulo.toLowerCase().includes(searchLower);
      const matchAutor = inf.autor?.toLowerCase().includes(searchLower);
      const matchDescripcion = inf.descripcion?.toLowerCase().includes(searchLower);
      
      if (!matchTitulo && !matchAutor && !matchDescripcion) return false;
    }
    
    // Filtro de categoría
    if (categoriaFiltro && inf.categoria_id !== parseInt(categoriaFiltro)) {
      return false;
    }
    
    return true;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!isAdmin() && !isNutricionista()) {
    return (
      <Container>
        <Alert severity="error">
          No tienes permisos para acceder a esta sección
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📚 Administración de Infografías
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona todas las infografías educativas del sistema
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarDatos}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalNueva(true)}
          >
            Nueva Infografía
          </Button>
        </Box>
      </Box>

      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Buscar por título, autor o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              label="Categoría"
            >
              <MenuItem value="">Todas</MenuItem>
              {categorias.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={mostrarInactivas}
                onChange={(e) => setMostrarInactivas(e.target.checked)}
              />
            }
            label="Mostrar inactivas"
          />
        </Box>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estado</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell align="center">Descargas</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : infografiasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron infografías
                </TableCell>
              </TableRow>
            ) : (
              infografiasFiltradas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((infografia) => (
                  <TableRow key={infografia.id} hover>
                    <TableCell>
                      <Tooltip title={infografia.activo === 1 ? 'Activa' : 'Inactiva'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActivo(infografia)}
                          color={infografia.activo === 1 ? 'success' : 'default'}
                        >
                          {infografia.activo === 1 ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {infografia.titulo}
                      </Typography>
                      {infografia.descripcion && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {infografia.descripcion.substring(0, 50)}...
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={infografia.categoria_nombre}
                        size="small"
                        sx={{
                          backgroundColor: infografia.categoria_color,
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {infografia.autor || 'Sin autor'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip 
                        label={infografia.descargas || 0} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="caption">
                        {formatearFecha(infografia.fecha_creacion)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            onClick={() => setModalDetalle({ open: true, infografia })}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Descargar">
                          <IconButton
                            size="small"
                            onClick={() => handleDescargar(infografia)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => setModalEditar({ open: true, infografia })}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {isAdmin() && (
                          <Tooltip title="Eliminar permanentemente">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setModalEliminar({ open: true, infografia })}
                            >
                              <DeleteForeverIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          component="div"
          count={infografiasFiltradas.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {/* Modal de Detalle */}
      <Dialog
        open={modalDetalle.open}
        onClose={() => setModalDetalle({ open: false, infografia: null })}
        maxWidth="md"
        fullWidth
      >
        {modalDetalle.infografia && (
          <InfografiasDetalle
            infografia={modalDetalle.infografia}
            onClose={() => setModalDetalle({ open: false, infografia: null })}
            onDescargar={() => handleDescargar(modalDetalle.infografia)}
          />
        )}
      </Dialog>

      {/* Modal de Edición */}
      <Dialog
        open={modalEditar.open}
        onClose={() => setModalEditar({ open: false, infografia: null })}
        maxWidth="md"
        fullWidth
      >
        <InfografiasForm
          infografia={modalEditar.infografia}
          categorias={categorias}
          onClose={() => setModalEditar({ open: false, infografia: null })}
          onGuardar={() => {
            setModalEditar({ open: false, infografia: null });
            setSuccess('Infografía actualizada exitosamente');
            cargarDatos();
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      </Dialog>

      {/* Modal Nueva Infografía */}
      <Dialog
        open={modalNueva}
        onClose={() => setModalNueva(false)}
        maxWidth="md"
        fullWidth
      >
        <InfografiasForm
          categorias={categorias}
          onClose={() => setModalNueva(false)}
          onGuardar={() => {
            setModalNueva(false);
            setSuccess('Infografía creada exitosamente');
            cargarDatos();
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog
        open={modalEliminar.open}
        onClose={() => setModalEliminar({ open: false, infografia: null })}
      >
        <DialogTitle>¿Eliminar infografía permanentemente?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer. La infografía será eliminada permanentemente.
          </Alert>
          {modalEliminar.infografia && (
            <Typography>
              ¿Estás seguro de que deseas eliminar "<strong>{modalEliminar.infografia.titulo}</strong>"?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEliminar({ open: false, infografia: null })}>
            Cancelar
          </Button>
          <Button onClick={handleEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InfografiasAdmin;
