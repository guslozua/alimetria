import React from 'react';
import { useParams } from 'react-router-dom';
import { EvolucionMediciones } from '../components/Mediciones';

const EvolucionMedicionesPage = () => {
  const { pacienteId } = useParams();
  
  return <EvolucionMediciones pacienteId={pacienteId} />;
};

export default EvolucionMedicionesPage;
