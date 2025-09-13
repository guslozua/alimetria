@echo off
echo ======================================
echo      INICIANDO BACKEND ALIMETRIA
echo ======================================

cd /d C:\Users\guslo\Alimetria\backend

echo.
echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
) else (
    echo ✓ Dependencias ya instaladas
)

echo.
echo Iniciando servidor backend en puerto 5001...
echo ======================================
echo.
echo Backend iniciado. Para detener presiona Ctrl+C
echo.

call npm start

pause