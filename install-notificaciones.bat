@echo off
echo Instalando dependencias para sistema de notificaciones...

cd backend
echo Instalando dependencias del backend...
npm install nodemailer node-cron

cd ../frontend
echo Instalando dependencias del frontend (si es necesario)...
npm install

cd ..
echo ¡Instalación completada!
pause
