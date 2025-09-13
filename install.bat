@echo off
REM =========================================
REM ALIMETRIA - SCRIPT DE INSTALACIÓN WINDOWS
REM Automatiza la instalación completa del proyecto
REM =========================================

echo 🏥 ===== INSTALACIÓN ALIMETRIA =====
echo Sistema de Consultorio de Nutrición
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 16+ primero.
    pause
    exit /b 1
)

echo ✅ Node.js versión:
node --version

REM Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm no está disponible.
    pause
    exit /b 1
)

echo ✅ npm versión:
npm --version

REM Instalar dependencias del backend
echo.
echo 📦 Instalando dependencias del backend...
cd backend
call npm install

if errorlevel 1 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
) else (
    echo ✅ Dependencias del backend instaladas correctamente
)

REM Verificar archivo .env
if not exist ".env" (
    echo ⚠️  Archivo .env no encontrado, creando uno de ejemplo...
    if exist ".env.example" (
        copy .env.example .env
    ) else (
        echo 📝 Por favor configura manualmente el archivo .env
    )
)

cd ..

REM Instalar dependencias del frontend
echo.
echo 📦 Instalando dependencias del frontend...
cd frontend
call npm install

if errorlevel 1 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
) else (
    echo ✅ Dependencias del frontend instaladas correctamente
)

cd ..

echo.
echo 🎉 ===== INSTALACIÓN COMPLETADA =====
echo.
echo 📋 PRÓXIMOS PASOS:
echo 1. Configurar MySQL y crear base de datos 'alimetria'
echo 2. Ejecutar el script SQL: backend/sql/complete_database.sql
echo 3. Configurar variables en backend/.env
echo 4. Iniciar backend: cd backend && npm run dev
echo 5. Iniciar frontend: cd frontend && npm start
echo.
echo 🌐 URLs del sistema:
echo - Backend API: http://localhost:5000
echo - Frontend: http://localhost:3000
echo - Health Check: http://localhost:5000/health
echo.
echo 📚 Documentación completa en README.md
echo.
echo 🚀 ¡Listo para desarrollar Alimetria!
echo.
pause
