@echo off
echo =======================================
echo ALIMETRIA - INICIAR BACKEND
echo =======================================
echo.

echo 🚀 Iniciando servidor backend...
echo 📡 URL: http://localhost:5001
echo 🔍 Health check: http://localhost:5001/health
echo.
echo Para detener el servidor presiona: Ctrl + C
echo.

cd backend
call npm run dev
