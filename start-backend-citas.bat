@echo off
echo ======================================
echo INICIANDO SERVIDOR ALIMETRIA - BACKEND
echo ======================================
echo.

cd /d "C:\Users\guslo\Alimetria\backend"

echo 📋 Verificando dependencias...
if not exist node_modules (
    echo ❌ Node modules no encontrados. Ejecutando npm install...
    npm install
    echo.
)

echo 🚀 Iniciando servidor en modo desarrollo...
echo 📡 API estará disponible en: http://localhost:5000
echo 🏥 Health check: http://localhost:5000/health
echo 📅 Citas API: http://localhost:5000/api/citas
echo.
echo ⏹️ Presiona Ctrl+C para detener el servidor
echo ======================================
echo.

npm start

pause
