import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import dayjs from 'dayjs';
import citasService from '../../services/citasService';
import { useAuth } from '../../context/AuthContext';

const CalendarioView = ({ 
  citas = [], 
  onEditarCita, 
  onCancelarCita, 
  onCompletarCita, 
  onConfirmarCita,
  onRecargarCitas,
  loading 
}) => {
  const calendarRef = useRef(null);
  const { user } = useAuth();
  const [vistaActual, setVistaActual] = useState('dayGridMonth');
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [filtroNutricionista, setFiltroNutricionista] = useState('');

  // Convertir citas al formato de FullCalendar
  const eventosCalendario = citas.map(cita => ({
    id: cita.id,
    title: `${cita.paciente_nombre || 'Sin nombre'} - ${citasService.getLabelByTipoConsulta(cita.tipo_consulta)}`,
    start: cita.fecha_hora,
    end: dayjs(cita.fecha_hora).add(cita.duracion_minutos || 60, 'minute').toISOString(),
    backgroundColor: citasService.getColorByEstado(cita.estado),
    borderColor: citasService.getColorByEstado(cita.estado),
    extendedProps: {
      paciente_id: cita.paciente_id,
      paciente_nombre: cita.paciente_nombre,
      nutricionista_id: cita.nutricionista_id,
      nutricionista_nombre: cita.nutricionista_nombre,
      estado: cita.estado,
      tipo_consulta: cita.tipo_consulta,
      motivo: cita.motivo,
      telefono: cita.paciente_telefono,
      notas_previas: cita.notas_previas,
      notas_posteriores: cita.notas_posteriores,
      duracion_minutos: cita.duracion_minutos
    }
  }));

  // Filtrar eventos si hay filtro de nutricionista
  const eventosFiltrados = filtroNutricionista 
    ? eventosCalendario.filter(evento => 
        evento.extendedProps.nutricionista_id?.toString() === filtroNutricionista
      )
    : eventosCalendario;

  // Manejar click en evento
  const handleEventClick = (clickInfo) => {
    const cita = citas.find(c => c.id.toString() === clickInfo.event.id);
    if (cita) {
      setCitaSeleccionada(cita);
      setModalDetalles(true);
    }
  };

  // Manejar click en fecha/hora (crear nueva cita)
  const handleDateClick = (dateClickInfo) => {
    // Solo permitir crear citas en fechas futuras
    if (dayjs(dateClickInfo.date).isBefore(dayjs(), 'day')) {
      return;
    }

    // Crear estructura básica para nueva cita
    const nuevaCitaData = {
      fecha_hora: dateClickInfo.dateStr,
      consultorio_id: user?.consultorioId || 1
    };

    if (onEditarCita) {
      onEditarCita(nuevaCitaData);
    }
  };

  // Cambiar vista del calendario
  const handleViewChange = (view) => {
    setVistaActual(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  // Cerrar modal de detalles
  const handleCerrarModal = () => {
    setModalDetalles(false);
    setCitaSeleccionada(null);
  };

  // Obtener nutricionistas únicos para el filtro
  const nutricionistas = [...new Set(citas.map(cita => ({
    id: cita.nutricionista_id,
    nombre: cita.nutricionista_nombre
  })).filter(Boolean))]
    .filter((nutricionista, index, self) => 
      index === self.findIndex(n => n.id === nutricionista.id)
    );

  return (
    <Box>
      {/* Controles del Calendario */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Botones de Vista */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={vistaActual === 'dayGridMonth' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleViewChange('dayGridMonth')}
              >
                Mes
              </Button>
              <Button
                variant={vistaActual === 'timeGridWeek' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleViewChange('timeGridWeek')}
              >
                Semana
              </Button>
              <Button
                variant={vistaActual === 'timeGridDay' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleViewChange('timeGridDay')}
              >
                Día
              </Button>
              <Button
                variant={vistaActual === 'listWeek' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleViewChange('listWeek')}
              >
                Lista
              </Button>
            </Box>
          </Grid>

          {/* Filtro por Nutricionista */}
          <Grid item xs={12} md={6}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Nutricionista</InputLabel>
              <Select
                value={filtroNutricionista}
                onChange={(e) => setFiltroNutricionista(e.target.value)}
                label="Filtrar por Nutricionista"
              >
                <MenuItem value="">Todos</MenuItem>
                {nutricionistas.map((nutricionista) => (
                  <MenuItem key={nutricionista.id} value={nutricionista.id?.toString()}>
                    {nutricionista.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Calendario */}
      <Paper sx={{ p: 1 }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '' // Dejamos vacío porque tenemos nuestros botones
          }}
          initialView={vistaActual}
          locale={esLocale}
          events={eventosFiltrados}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          eventTextColor="white"
          eventDisplay="block"
          displayEventTime={true}
          displayEventEnd={false}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
            startTime: '08:00',
            endTime: '20:00'
          }}
          nowIndicator={true}
          scrollTime="08:00:00"
        />
      </Paper>

      {/* Modal de Detalles de Cita */}
      <Dialog
        open={modalDetalles}
        onClose={handleCerrarModal}
        maxWidth="md"
        fullWidth
      >
        {citaSeleccionada && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">
                  Cita - {citaSeleccionada.paciente_nombre}
                </Typography>
              </Box>
              <Chip
                label={citasService.getLabelByEstado(citaSeleccionada.estado)}
                color={citaSeleccionada.estado === 'confirmada' ? 'success' : 
                       citaSeleccionada.estado === 'cancelada' ? 'error' :
                       citaSeleccionada.estado === 'completada' ? 'default' : 'primary'}
                size="small"
              />
              <IconButton onClick={handleCerrarModal} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={3}>
                {/* Información Básica */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary">
                    📅 Información de la Cita
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon fontSize="small" />
                      <Typography variant="body2">
                        <strong>Fecha:</strong> {dayjs(citaSeleccionada.fecha_hora).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>Duración:</strong> {citaSeleccionada.duracion_minutos || 60} minutos
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tipo:</strong> {citasService.getLabelByTipoConsulta(citaSeleccionada.tipo_consulta)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nutricionista:</strong> {citaSeleccionada.nutricionista_nombre}
                    </Typography>
                    {citaSeleccionada.paciente_telefono && (
                      <Typography variant="body2">
                        <strong>Teléfono:</strong> {citaSeleccionada.paciente_telefono}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Notas */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary">
                    📝 Notas
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {citaSeleccionada.motivo && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Motivo:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {citaSeleccionada.motivo}
                        </Typography>
                      </Box>
                    )}
                    {citaSeleccionada.notas_previas && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Notas Previas:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {citaSeleccionada.notas_previas}
                        </Typography>
                      </Box>
                    )}
                    {citaSeleccionada.notas_posteriores && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Notas Posteriores:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {citaSeleccionada.notas_posteriores}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 1 }}>
              {/* Botones de Acción según el Estado */}
              {citaSeleccionada.estado === 'programada' && (
                <>
                  <Tooltip title="Confirmar Cita">
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => {
                        onConfirmarCita?.(citaSeleccionada.id);
                        handleCerrarModal();
                      }}
                    >
                      Confirmar
                    </Button>
                  </Tooltip>
                  <Tooltip title="Cancelar Cita">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        onCancelarCita?.(citaSeleccionada.id, 'Cancelada desde calendario');
                        handleCerrarModal();
                      }}
                    >
                      Cancelar
                    </Button>
                  </Tooltip>
                </>
              )}

              {citaSeleccionada.estado === 'confirmada' && (
                <>
                  <Tooltip title="Completar Cita">
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CheckIcon />}
                      onClick={() => {
                        onCompletarCita?.(citaSeleccionada.id, '');
                        handleCerrarModal();
                      }}
                    >
                      Completar
                    </Button>
                  </Tooltip>
                  <Tooltip title="Cancelar Cita">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        onCancelarCita?.(citaSeleccionada.id, 'Cancelada desde calendario');
                        handleCerrarModal();
                      }}
                    >
                      Cancelar
                    </Button>
                  </Tooltip>
                </>
              )}

              {/* Siempre mostrar editar */}
              <Tooltip title="Editar Cita">
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    onEditarCita?.(citaSeleccionada);
                    handleCerrarModal();
                  }}
                >
                  Editar
                </Button>
              </Tooltip>

              <Button onClick={handleCerrarModal} color="inherit">
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarioView;
