@echo off
echo =======================================
echo ALIMETRIA - INSTALACION BACKEND
echo =======================================
echo.

echo 📦 Instalando dependencias del backend...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)

echo.
echo ✅ Dependencias del backend instaladas correctamente
echo.
echo 🔧 Verificando instalación...
call npm list --depth=0

echo.
echo =======================================
echo ✅ BACKEND CONFIGURADO EXITOSAMENTE
echo =======================================
echo.
echo Comandos disponibles:
echo   npm run dev    - Iniciar servidor en modo desarrollo
echo   npm start      - Iniciar servidor en modo producción
echo.
echo Para continuar:
echo 1. Configura tu base de datos MySQL
echo 2. Ejecuta: npm run dev
echo.
pause
