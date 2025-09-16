@echo off
chcp 65001 >nul
echo Testing de Email - ALIMETRIA
echo ================================
echo.
echo Este script probara si la configuracion de email funciona.
echo Se enviara un email de prueba a guslozua@gmail.com
echo.
cd backend
node test-email.js
echo.
echo ================================
echo Si el email llego, la configuracion esta lista!
echo Revisa tu bandeja de entrada y spam.
echo.
pause
