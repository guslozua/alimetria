import React from 'react';
import { useParams } from 'react-router-dom';
import { FormularioMedicion } from '../components/Mediciones';

const NuevaMedicionPage = () => {
  const { pacienteId } = useParams();
  
  return <FormularioMedicion pacienteId={pacienteId} />;
};

export default NuevaMedicionPage;
