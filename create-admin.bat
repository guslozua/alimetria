@echo off
echo =======================================
echo ALIMETRIA - CREAR USUARIO ADMINISTRADOR
echo =======================================
echo.

echo 🔧 Creando usuario administrador inicial...
echo.

cd backend
node utils/createAdmin.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error creando usuario administrador
    echo 💡 Verifica que:
    echo   1. MySQL esté ejecutándose
    echo   2. La base de datos 'alimetria' exista
    echo   3. Las tablas estén creadas
    echo.
    pause
    exit /b 1
)

echo.
echo =======================================
echo ✅ USUARIO ADMINISTRADOR CREADO
echo =======================================
echo.
echo 🚀 Ya puedes iniciar sesión en el sistema con:
echo   Email: admin@alimetria.com
echo   Contraseña: Admin123!
echo.
echo 🌐 URLs del sistema:
echo   Frontend: http://localhost:3001
echo   Backend:  http://localhost:5001
echo.
echo ⚠️  IMPORTANTE: Cambia la contraseña después del primer acceso
echo.
pause
