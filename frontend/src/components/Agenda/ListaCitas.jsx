import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import dayjs from 'dayjs';
import citasService from '../../services/citasService';

const ListaCitas = ({ 
  citas = [], 
  onEditarCita, 
  onCancelarCita, 
  onCompletarCita, 
  onConfirmarCita,
  onRecargarCitas,
  loading 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ordenamiento, setOrdenamiento] = useState({
    campo: 'fecha_hora',
    direccion: 'asc' // 'asc' para próximas primero, 'desc' para pasadas primero
  });
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    tipo_consulta: '',
    fecha_desde: null,
    fecha_hasta: null
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [dialogCancelar, setDialogCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  // Aplicar filtros a las citas
  const citasFiltradas = citas.filter(cita => {
    const cumpleBusqueda = !filtros.busqueda || 
      cita.paciente_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      cita.nutricionista_nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      cita.motivo?.toLowerCase().includes(filtros.busqueda.toLowerCase());

    const cumpleEstado = !filtros.estado || cita.estado === filtros.estado;
    
    const cumpleTipo = !filtros.tipo_consulta || cita.tipo_consulta === filtros.tipo_consulta;

    const cumpleFechaDesde = !filtros.fecha_desde || 
      dayjs(cita.fecha_hora).isAfter(dayjs(filtros.fecha_desde).startOf('day'));

    const cumpleFechaHasta = !filtros.fecha_hasta || 
      dayjs(cita.fecha_hora).isBefore(dayjs(filtros.fecha_hasta).endOf('day'));

    return cumpleBusqueda && cumpleEstado && cumpleTipo && cumpleFechaDesde && cumpleFechaHasta;
  });

  // Ordenar citas según configuración
  const citasOrdenadas = [...citasFiltradas].sort((a, b) => {
    const multiplicador = ordenamiento.direccion === 'asc' ? 1 : -1;
    
    if (ordenamiento.campo === 'fecha_hora') {
      return dayjs(a.fecha_hora).diff(dayjs(b.fecha_hora)) * multiplicador;
    }
    
    // Se pueden agregar más campos de ordenamiento aquí en el futuro
    return 0;
  });

  // Paginación
  const citasPaginadas = citasOrdenadas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPage(0); // Resetear paginación al filtrar
  };

  const handleOrdenamientoChange = (campo) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
    setPage(0); // Resetear paginación al ordenar
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: '',
      tipo_consulta: '',
      fecha_desde: null,
      fecha_hasta: null
    });
    setPage(0);
  };

  const handleMenuClick = (event, cita) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setCitaSeleccionada(cita);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setCitaSeleccionada(null);
  };

  const handleCancelarCita = () => {
    setDialogCancelar(true);
    handleMenuClose();
  };

  const confirmarCancelacion = () => {
    if (citaSeleccionada) {
      onCancelarCita?.(citaSeleccionada.id, motivoCancelacion);
      setDialogCancelar(false);
      setMotivoCancelacion('');
      setCitaSeleccionada(null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
      <Box>
        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            Filtros de Búsqueda
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda de texto */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Buscar"
                variant="outlined"
                size="small"
                fullWidth
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                placeholder="Nombre, nutricionista, motivo..."
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>

            {/* Filtro por estado */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {citasService.ESTADOS_CITA.map((estado) => (
                    <MenuItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por tipo */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filtros.tipo_consulta}
                  onChange={(e) => handleFiltroChange('tipo_consulta', e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {citasService.TIPOS_CONSULTA.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fecha desde */}
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Desde"
                value={filtros.fecha_desde}
                onChange={(newValue) => handleFiltroChange('fecha_desde', newValue)}
                slots={{
                  textField: (params) => (
                    <TextField {...params} size="small" fullWidth />
                  )
                }}
              />
            </Grid>

            {/* Fecha hasta */}
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Hasta"
                value={filtros.fecha_hasta}
                onChange={(newValue) => handleFiltroChange('fecha_hasta', newValue)}
                slots={{
                  textField: (params) => (
                    <TextField {...params} size="small" fullWidth />
                  )
                }}
              />
            </Grid>

            {/* Botón limpiar filtros */}
            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={limpiarFiltros}
                size="small"
                fullWidth
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de Citas */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  onClick={() => handleOrdenamientoChange('fecha_hora')}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <strong>Fecha y Hora</strong>
                    {ordenamiento.campo === 'fecha_hora' && (
                      ordenamiento.direccion === 'asc' ? 
                        <ArrowUpwardIcon fontSize="small" color="primary" /> : 
                        <ArrowDownwardIcon fontSize="small" color="primary" />
                    )}
                  </Box>
                </TableCell>
                <TableCell><strong>Paciente</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Duración</strong></TableCell>
                <TableCell><strong>Motivo</strong></TableCell>
                <TableCell><strong>Teléfono</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {citasPaginadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {filtros.busqueda || filtros.estado || filtros.tipo_consulta || filtros.fecha_desde || filtros.fecha_hasta
                        ? 'No se encontraron citas con los filtros aplicados'
                        : 'No hay citas disponibles'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                citasPaginadas.map((cita) => (
                  <TableRow
                    key={cita.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onEditarCita?.(cita)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {dayjs(cita.fecha_hora).format('DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(cita.fecha_hora).format('HH:mm')} hs
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {cita.paciente_nombre}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {citasService.getLabelByTipoConsulta(cita.tipo_consulta)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={citasService.getLabelByEstado(cita.estado)}
                        size="small"
                        sx={{
                          backgroundColor: citasService.getColorByEstado(cita.estado),
                          color: 'white',
                          fontWeight: 'medium'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {cita.duracion_minutos || 60} min
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          maxWidth: 150, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={cita.motivo}
                      >
                        {cita.motivo || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      {cita.paciente_telefono ? (
                        <Tooltip title={`Llamar: ${cita.paciente_telefono}`}>
                          <IconButton
                            size="small"
                            href={`tel:${cita.paciente_telefono}`}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ color: 'success.main' }}
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, cita)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={citasOrdenadas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </TableContainer>

        {/* Menú de Acciones */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem 
            onClick={() => {
              onEditarCita?.(citaSeleccionada);
              handleMenuClose();
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <EditIcon fontSize="small" />
            Editar
          </MenuItem>

          {citaSeleccionada?.estado === 'programada' && (
            <MenuItem 
              onClick={() => {
                onConfirmarCita?.(citaSeleccionada.id);
                handleMenuClose();
              }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}
            >
              <CheckIcon fontSize="small" />
              Confirmar
            </MenuItem>
          )}

          {citaSeleccionada?.estado === 'confirmada' && (
            <MenuItem 
              onClick={() => {
                onCompletarCita?.(citaSeleccionada.id, '');
                handleMenuClose();
              }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}
            >
              <CheckIcon fontSize="small" />
              Completar
            </MenuItem>
          )}

          {['programada', 'confirmada'].includes(citaSeleccionada?.estado) && (
            <MenuItem 
              onClick={handleCancelarCita}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}
            >
              <CancelIcon fontSize="small" />
              Cancelar
            </MenuItem>
          )}
        </Menu>

        {/* Dialog Cancelar Cita */}
        <Dialog open={dialogCancelar} onClose={() => setDialogCancelar(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cancelar Cita</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              ¿Estás seguro de que deseas cancelar la cita de <strong>{citaSeleccionada?.paciente_nombre}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Fecha: {dayjs(citaSeleccionada?.fecha_hora).format('DD/MM/YYYY HH:mm')}
            </Typography>
            <TextField
              label="Motivo de cancelación (opcional)"
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              multiline
              rows={3}
              fullWidth
              sx={{ mt: 2 }}
              placeholder="Ej: Reagendado por el paciente, emergencia, etc."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogCancelar(false)} color="inherit">
              Cancelar
            </Button>
            <Button onClick={confirmarCancelacion} color="error" variant="contained">
              Confirmar Cancelación
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ListaCitas;
