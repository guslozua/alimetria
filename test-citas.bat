@echo off
echo =======================================
echo PRUEBA DEL SISTEMA DE CITAS - ALIMETRIA
echo =======================================
echo.

cd /d "C:\Users\guslo\Alimetria\backend"

echo 🧪 Ejecutando script de prueba de citas...
node test-citas.js

echo.
echo =======================================
echo ✅ Pruebas completadas!
echo.
echo 💡 Para probar los endpoints:
echo    1. Inicia el servidor: start-backend-citas.bat
echo    2. Usa Postman o curl para probar las APIs
echo    3. Endpoints disponibles en: http://localhost:5000/api/citas
echo =======================================

pause
