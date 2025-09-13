import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { MedicionInBodyOCR } from '../components/InBodyOCR';
import { pacientesService } from '../services/pacientesService';
import PacienteService from '../services/pacienteService';
import Swal from 'sweetalert2';

const MedicionInBodyPage = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del paciente
  useEffect(() => {
    const cargarPaciente = async () => {
      try {
        const response = await PacienteService.getById(pacienteId);
        
        if (response.paciente) {
          setPaciente(response.paciente);
        } else {
          throw new Error('No se pudo cargar el paciente');
        }
      } catch (err) {
        console.error('Error al cargar paciente:', err);
        setError('No se pudo cargar la información del paciente');
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del paciente',
          confirmButtonText: 'Volver'
        }).then(() => {
          navigate('/pacientes');
        });
      } finally {
        setLoading(false);
      }
    };

    if (pacienteId) {
      cargarPaciente();
    }
  }, [pacienteId, navigate]);

  // Manejar medición creada exitosamente
  const handleMedicionCreada = (medicionData) => {
    console.log('✅ Medición InBody creada:', medicionData);
    
    // Redirigir al detalle del paciente
    setTimeout(() => {
      navigate(`/pacientes/${pacienteId}`, {
        state: { 
          mensaje: 'Medición InBody procesada y guardada exitosamente',
          tipo: 'success'
        }
      });
    }, 1000);
  };

  // Manejar cancelación
  const handleCancelar = () => {
    navigate(`/pacientes/${pacienteId}`);
  };

  // Volver al detalle del paciente
  const volverAlPaciente = () => {
    navigate(`/pacientes/${pacienteId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  if (error || !paciente) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'Paciente no encontrado'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header con información del paciente */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Button
          startIcon={<BackIcon />}
          onClick={volverAlPaciente}
          variant="outlined"
        >
          Volver al Paciente
        </Button>
      </Box>

      {/* Información del paciente */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {paciente.foto_perfil ? (
                <img 
                  src={paciente.foto_perfil} 
                  alt={`${paciente.nombre} ${paciente.apellido}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <PersonIcon sx={{ fontSize: 32 }} />
              )}
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h5" gutterBottom>
                {paciente.nombre} {paciente.apellido}
              </Typography>
              
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={`${paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}`}
                  size="small"
                  variant="outlined"
                />
                
                {paciente.fecha_nacimiento && (
                  <Chip 
                    label={`${calcularEdad(paciente.fecha_nacimiento)} años`}
                    size="small"
                    variant="outlined"
                  />
                )}
                
                {paciente.altura_inicial && (
                  <Chip 
                    label={`${paciente.altura_inicial} cm`}
                    size="small"
                    variant="outlined"
                  />
                )}
                
                {paciente.peso_inicial && (
                  <Chip 
                    label={`Peso inicial: ${paciente.peso_inicial} kg`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              
              {paciente.objetivo && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Objetivo:</strong> {paciente.objetivo}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Componente principal de OCR */}
      <MedicionInBodyOCR
        pacienteId={pacienteId}
        pacienteInfo={paciente}
        onMedicionCreada={handleMedicionCreada}
        onCancel={handleCancelar}
      />
    </Container>
  );
};

// Función auxiliar para calcular edad
const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

export default MedicionInBodyPage;