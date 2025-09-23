@echo off
echo ============================================
echo PRUEBA COMPLETA - SISTEMA DE SUPLEMENTOS
echo ============================================
echo.

echo [1/4] Verificando que backend esté corriendo...
curl -s http://localhost:5001/health > nul
if %errorlevel% neq 0 (
    echo ❌ Backend no está corriendo en puerto 5001
    echo Por favor inicia el backend primero:
    echo cd backend
    echo npm run dev
    pause
    exit /b 1
)
echo ✅ Backend corriendo correctamente

echo.
echo [2/4] Iniciando frontend...
cd /d "C:\Users\guslo\Alimetria\frontend"
start "Alimetria Frontend" cmd /k "npm start"

echo.
echo [3/4] Esperando a que el frontend inicie...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] Sistema completo iniciado!
echo.
echo 🚀 URLs disponibles:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📱 Frontend: http://localhost:3001
echo 🔧 Backend:  http://localhost:5001
echo.
echo 💊 Nueva página de Suplementos:
echo http://localhost:3001/suplementos
echo.
echo Endpoints de API funcionando:
echo - http://localhost:5001/api/suplementos/categorias
echo - http://localhost:5001/api/suplementos/dashboard
echo.
echo ✨ ¡A probar la nueva funcionalidad!
pause
