@echo off
echo ============================================
echo TESTING SISTEMA DE SUPLEMENTOS - BACKEND
echo ============================================
echo.

echo [1/5] Iniciando servidor backend...
echo Presiona Ctrl+C para detener
echo.

cd /d "C:\Users\guslo\Alimetria\backend"
start "Alimetria Backend" cmd /k "npm run dev"

echo [2/5] Esperando a que el servidor inicie...
timeout /t 5 /nobreak >nul

echo [3/5] Probando endpoints de suplementos...
echo.

echo GET /api/suplementos/categorias
curl -s http://localhost:5001/api/suplementos/categorias
echo.
echo.

echo GET /api/suplementos (primeros 5)
curl -s "http://localhost:5001/api/suplementos?limit=5"
echo.
echo.

echo GET /api/suplementos/dashboard  
curl -s http://localhost:5001/api/suplementos/dashboard
echo.
echo.

echo [4/5] Probando busqueda inteligente...
curl -s "http://localhost:5001/api/suplementos/busqueda-inteligente?q=omega"
echo.
echo.

echo [5/5] Probando detalle de suplemento...
curl -s http://localhost:5001/api/suplementos/3
echo.
echo.

echo ============================================
echo TESTING COMPLETADO
echo ============================================
echo Si no hay errores, el backend funciona correctamente
echo.
pause
