// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import NotificacionService from '../services/notificacionService';

export const useNotifications = (refreshInterval = 30000) => {
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar el contador de notificaciones no leídas
  const loadNotificationsCount = useCallback(async () => {
    try {
      setError(null);
      const response = await NotificacionService.getMisNotificaciones({
        limit: 1, // Solo necesitamos el contador, no las notificaciones
        offset: 0
      });
      
      if (response.success) {
        setNotificationsCount(response.data.noLeidas || 0);
      } else {
        setError('Error al cargar notificaciones');
      }
    } catch (error) {
      console.error('Error al cargar contador de notificaciones:', error);
      setError(error.message || 'Error al cargar notificaciones');
      // En caso de error, mantener el contador anterior
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para marcar notificaciones como leídas y actualizar contador
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await NotificacionService.marcarComoLeida(notificationId);
      // Actualizar contador inmediatamente
      setNotificationsCount(prev => Math.max(0, prev - 1));
      // Recargar para confirmar
      setTimeout(loadNotificationsCount, 500);
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      // Recargar en caso de error
      loadNotificationsCount();
    }
  }, [loadNotificationsCount]);

  // Función para marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificacionService.marcarTodasComoLeidas();
      setNotificationsCount(0);
      // Recargar para confirmar
      setTimeout(loadNotificationsCount, 500);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      // Recargar en caso de error
      loadNotificationsCount();
    }
  }, [loadNotificationsCount]);

  // Función para forzar actualización del contador
  const refreshCount = useCallback(() => {
    loadNotificationsCount();
  }, [loadNotificationsCount]);

  // Cargar contador inicial
  useEffect(() => {
    loadNotificationsCount();
  }, [loadNotificationsCount]);

  // Actualización periódica del contador (opcional)
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      loadNotificationsCount();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [loadNotificationsCount, refreshInterval]);

  // Listener para cambios de visibilidad de la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // La página se volvió visible, actualizar contador
        loadNotificationsCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadNotificationsCount]);

  return {
    notificationsCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshCount,
    hasNotifications: notificationsCount > 0
  };
};