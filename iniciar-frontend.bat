@echo off
echo ======================================
echo      INICIANDO FRONTEND ALIMETRIA
echo ======================================

cd /d C:\Users\guslo\Alimetria\frontend

echo.
echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
) else (
    echo ✓ Dependencias ya instaladas
)

echo.
echo Iniciando aplicación React en puerto 3001...
echo ======================================
echo.
echo Frontend iniciado. Para detener presiona Ctrl+C
echo Abrirá automáticamente en http://localhost:3001
echo.

call npm start

pause