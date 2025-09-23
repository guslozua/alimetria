@echo off
echo ============================================
echo SOLUCION DE ERRORES - BACKEND SUPLEMENTOS
echo ============================================
echo.

echo [1/3] Limpieza completada:
echo - ✅ Modelos Sequelize movidos a /models_temp
echo - ✅ Configuración de BD simplificada
echo - ✅ Rutas con middleware básico
echo.

echo [2/3] Iniciando servidor...
cd /d "C:\Users\guslo\Alimetria\backend"

echo Probando conexión rápida:
node -e "
const { testConnection } = require('./config/database');
testConnection().then(result => {
  console.log('DB Status:', result ? '✅ OK' : '❌ ERROR');
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"

if %errorlevel% neq 0 (
    echo ERROR: Base de datos no disponible
    echo Verifica que XAMPP/MySQL esté iniciado
    pause
    exit /b 1
)

echo [3/3] Todo listo. Inicia el servidor con:
echo npm run dev
echo.
echo Endpoints a probar:
echo - http://localhost:5001/api/suplementos/categorias
echo - http://localhost:5001/api/suplementos/dashboard
echo - http://localhost:5001/api/suplementos?limit=3
echo.
pause
