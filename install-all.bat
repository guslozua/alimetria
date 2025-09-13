@echo off
echo =======================================
echo    ALIMETRIA - INSTALACION COMPLETA
echo    Sistema de Consultorio de Nutricion
echo =======================================
echo.

echo 🚀 Iniciando instalación completa del proyecto Alimetria...
echo.

echo ⏳ Paso 1/3: Verificando prerrequisitos...
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo    Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js detectado: 
    node --version
)

:: Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está disponible
    pause
    exit /b 1
) else (
    echo ✅ npm detectado: 
    npm --version
)

echo.
echo ⏳ Paso 2/3: Instalando backend...
echo.
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando backend
    pause
    exit /b 1
)
echo ✅ Backend instalado correctamente
cd ..

echo.
echo ⏳ Paso 3/3: Instalando frontend...
echo.
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando frontend
    pause
    exit /b 1
)
echo ✅ Frontend instalado correctamente
cd ..

echo.
echo =======================================
echo ✅ INSTALACION COMPLETADA EXITOSAMENTE
echo =======================================
echo.
echo 📋 Resumen de la instalación:
echo   ✅ Backend (Node.js + Express + MySQL)
echo   ✅ Frontend (React + Material-UI)
echo   ✅ Todas las dependencias instaladas
echo.
echo 🔧 Próximos pasos:
echo   1. Configura tu base de datos MySQL (ver instrucciones abajo)
echo   2. Ejecuta: setup-database.bat (para crear las tablas)
echo   3. Ejecuta: start-backend.bat (para iniciar el servidor)
echo   4. Ejecuta: start-frontend.bat (para iniciar la aplicación)
echo.
echo 📖 Configuración de Base de Datos:
echo   - Servidor: localhost
echo   - Usuario: root (o tu usuario MySQL)
echo   - Contraseña: (vacía por defecto, cámbiala en backend\.env)
echo   - Base de datos: alimetria (se creará automáticamente)
echo.
echo 🌐 URLs del sistema:
echo   - Backend API: http://localhost:5000
echo   - Frontend App: http://localhost:3000
echo.
pause
