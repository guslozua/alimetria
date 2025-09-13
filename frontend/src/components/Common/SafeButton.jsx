import React from 'react';
import { Button as MuiButton } from '@mui/material';

// Wrapper temporal para solucionar el problema del tema
const SafeButton = ({ children, sx, ...props }) => {
  return (
    <MuiButton
      {...props}
      sx={{
        textTransform: 'none',
        borderRadius: 1,
        ...sx
      }}
    >
      {children}
    </MuiButton>
  );
};

export default SafeButton;
