@echo off
echo ======================================
echo    INICIANDO SISTEMA COMPLETO ALIMETRIA
echo ======================================

echo.
echo Iniciando Backend y Frontend...
echo.

start "Backend Alimetria" cmd /k "cd /d C:\Users\guslo\Alimetria\backend && npm start"

timeout /t 3 /nobreak > nul

start "Frontend Alimetria" cmd /k "cd /d C:\Users\guslo\Alimetria\frontend && npm start"

echo.
echo ✓ Sistema iniciado:
echo   - Backend: http://localhost:5001
echo   - Frontend: http://localhost:3001
echo.
echo Para detener ambos servidores, cierra las ventanas de terminal.

pause