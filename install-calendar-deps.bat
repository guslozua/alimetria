@echo off
echo =======================================
echo INSTALANDO DEPENDENCIAS PARA CALENDARIO
echo =======================================
echo.

cd /d "C:\Users\guslo\Alimetria\frontend"

echo 📦 Instalando FullCalendar y dependencias...
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list

echo.
echo 📦 Instalando librería adicional para fechas...
npm install dayjs

echo.
echo ✅ Instalación completada!
echo.
echo 💡 Dependencias instaladas:
echo    - @fullcalendar/react (Componente principal)
echo    - @fullcalendar/daygrid (Vista mensual)
echo    - @fullcalendar/timegrid (Vista semanal/diaria)
echo    - @fullcalendar/interaction (Interacciones)
echo    - @fullcalendar/list (Vista lista)
echo    - dayjs (Manejo de fechas)
echo =======================================

pause
