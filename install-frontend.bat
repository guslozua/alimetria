@echo off
echo =======================================
echo ALIMETRIA - INSTALACION FRONTEND
echo =======================================
echo.

echo 📦 Instalando dependencias del frontend...
cd frontend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo.
echo ✅ Dependencias del frontend instaladas correctamente
echo.
echo 🔧 Verificando instalación...
call npm list --depth=0 | findstr "react@"

echo.
echo =======================================
echo ✅ FRONTEND CONFIGURADO EXITOSAMENTE
echo =======================================
echo.
echo Comandos disponibles:
echo   npm start      - Iniciar aplicación React (puerto 3000)
echo   npm run build  - Construir para producción
echo.
echo Para continuar:
echo 1. Asegúrate de que el backend esté corriendo (puerto 5000)
echo 2. Ejecuta: npm start
echo.
pause
