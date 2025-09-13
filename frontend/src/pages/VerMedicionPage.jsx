import React from 'react';
import { useParams } from 'react-router-dom';
import { VerMedicion } from '../components/Mediciones';

const VerMedicionPage = () => {
  const { medicionId } = useParams();
  
  return <VerMedicion medicionId={medicionId} />;
};

export default VerMedicionPage;
