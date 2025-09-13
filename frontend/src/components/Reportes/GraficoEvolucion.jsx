import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { formatearFecha } from '../../utils/formatters';

const GraficoEvolucion = ({ 
  datos, 
  titulo, 
  campo, 
  unidad = '', 
  color = '#2196f3', 
  height = 300,
  mostrarPuntos = true 
}) => {
  
  // Formatear datos para el gráfico
  const datosFormateados = datos?.map(item => ({
    ...item,
    fechaCorta: formatearFecha(item.fechaOriginal, 'dd/MM'),
    valorFormateado: parseFloat(item.valor?.toFixed(1) || 0)
  })) || [];

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: 1,
            padding: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {formatearFecha(data.fechaOriginal)}
          </Typography>
          <Typography variant="body2" color={color}>
            {`${campo}: ${data.valorFormateado}${unidad}`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (!datos || datos.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {titulo}
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <Typography variant="body2" color="text.secondary">
              No hay datos disponibles para mostrar
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {titulo}
        </Typography>
        <Box height={height}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosFormateados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="fechaCorta" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#ccc' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#ccc' }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="valorFormateado" 
                stroke={color}
                strokeWidth={2}
                dot={mostrarPuntos ? { fill: color, strokeWidth: 2, r: 4 } : false}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GraficoEvolucion;