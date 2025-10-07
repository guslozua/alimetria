import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const DialogConfirmarEliminacion = ({ open, onClose, onConfirmar, suplemento }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <WarningIcon />
          <Typography variant="h6">Confirmar Eliminación</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta acción marcará el suplemento como inactivo.
        </Alert>
        <Typography>
          ¿Está seguro que desea eliminar el suplemento{' '}
          <strong>{suplemento?.nombre}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          El suplemento no se borrará permanentemente, solo se marcará como inactivo
          y no aparecerá en las búsquedas.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirmar} variant="contained" color="error">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogConfirmarEliminacion;
