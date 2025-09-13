import React from 'react';
import { useParams } from 'react-router-dom';
import { FormularioMedicion } from '../components/Mediciones';

const EditarMedicionPage = () => {
  const { medicionId } = useParams();
  
  return <FormularioMedicion medicionId={medicionId} esEdicion={true} />;
};

export default EditarMedicionPage;
