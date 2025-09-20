// src/components/Common/NotificationButton.jsx
import React from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationButton = ({ darkMode }) => {
  const navigate = useNavigate();
  const { notificationsCount, loading, hasNotifications } = useNotifications();

  const handleClick = () => {
    navigate('/notificaciones');
  };

  return (
    <Tooltip title={`${notificationsCount} notificaciones no leídas`} arrow>
      <IconButton
        onClick={handleClick}
        sx={{
          color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)',
          '&:hover': {
            bgcolor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
          }
        }}
      >
        <Badge 
          badgeContent={loading ? '•' : notificationsCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: loading ? '1.2rem' : '0.75rem',
              fontWeight: loading ? 'bold' : 500,
              minWidth: loading ? 'auto' : '20px',
              height: loading ? 'auto' : '20px',
              padding: loading ? '0' : '0 6px'
            }
          }}
          invisible={!loading && !hasNotifications}
        >
          <NotificationsIcon sx={{ fontSize: '1.2rem' }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationButton;