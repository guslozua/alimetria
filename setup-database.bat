@echo off
echo =======================================
echo ALIMETRIA - CONFIGURACION BASE DE DATOS
echo =======================================
echo.

echo 📋 Este script te ayudará a configurar la base de datos MySQL
echo.

echo ⚠️  IMPORTANTE: Asegúrate de que MySQL esté ejecutándose
echo.

echo 🔧 Configuración requerida:
echo   - Servidor MySQL ejecutándose en localhost:3306
echo   - Usuario con permisos para crear bases de datos
echo   - XAMPP, WAMP o MySQL Server instalado
echo.

set /p mysql_user="Ingresa tu usuario MySQL (por defecto 'root'): "
if "%mysql_user%"=="" set mysql_user=root

set /p mysql_password="Ingresa tu contraseña MySQL (presiona Enter si no tiene): "

echo.
echo 📁 Creando base de datos y tablas...
echo.

:: Intentar conectar y crear la base de datos
mysql -u %mysql_user% -p%mysql_password% -e "CREATE DATABASE IF NOT EXISTS alimetria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo ❌ Error conectando a MySQL
    echo.
    echo 🔍 Verifica que:
    echo   1. MySQL esté ejecutándose
    echo   2. Las credenciales sean correctas
    echo   3. Tengas permisos para crear bases de datos
    echo.
    pause
    exit /b 1
)

echo ✅ Base de datos 'alimetria' creada/verificada
echo.

echo 📊 Ejecutando script de tablas...
mysql -u %mysql_user% -p%mysql_password% alimetria < backend\sql\complete_tables.sql

if %errorlevel% neq 0 (
    echo ❌ Error creando tablas
    echo.
    echo 💡 Puedes ejecutar manualmente el archivo:
    echo    backend\sql\complete_tables.sql
    echo.
    pause
    exit /b 1
)

echo ✅ Tablas creadas exitosamente
echo.

:: Actualizar archivo .env con las credenciales
echo 🔧 Actualizando configuración...
echo.

echo # Configuración de la Base de Datos > backend\.env.temp
echo DB_HOST=localhost >> backend\.env.temp
echo DB_USER=%mysql_user% >> backend\.env.temp
echo DB_PASSWORD=%mysql_password% >> backend\.env.temp
echo DB_NAME=alimetria >> backend\.env.temp
echo. >> backend\.env.temp
echo # Configuración del Servidor >> backend\.env.temp
echo PORT=5000 >> backend\.env.temp
echo NODE_ENV=development >> backend\.env.temp
echo. >> backend\.env.temp
echo # JWT Secret >> backend\.env.temp
echo JWT_SECRET=alimetria_super_secret_key_2025_nutricionsystem >> backend\.env.temp
echo JWT_EXPIRES_IN=7d >> backend\.env.temp
echo. >> backend\.env.temp
echo # Configuración de Archivos >> backend\.env.temp
echo UPLOAD_PATH=./uploads >> backend\.env.temp
echo MAX_FILE_SIZE=10485760 >> backend\.env.temp
echo. >> backend\.env.temp
echo # Configuración CORS >> backend\.env.temp
echo FRONTEND_URL=http://localhost:3000 >> backend\.env.temp

move backend\.env.temp backend\.env

echo =======================================
echo ✅ BASE DE DATOS CONFIGURADA EXITOSAMENTE
echo =======================================
echo.
echo 📊 Resumen:
echo   ✅ Base de datos 'alimetria' creada
echo   ✅ Todas las tablas creadas (10 tablas principales)
echo   ✅ Datos iniciales insertados (roles, consultorio)
echo   ✅ Archivo .env actualizado
echo.
echo 🎯 Tablas creadas:
echo   - roles (Administrador, Nutricionista, Secretario, Paciente)
echo   - usuarios
echo   - consultorios
echo   - pacientes
echo   - mediciones (con versiones)
echo   - fotos_pacientes
echo   - citas
echo   - reportes
echo   - notificaciones
echo   - configuraciones
echo.
echo 🚀 Ya puedes iniciar el backend con: start-backend.bat
echo.
pause
