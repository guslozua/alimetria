@echo off
echo =====================================================
echo ALIMETRIA - EJECUTAR MIGRACIÓN: OBRAS SOCIALES
echo =====================================================
echo.
echo Este script agregará la funcionalidad de obras sociales
echo a la base de datos de Alimetria.
echo.
echo ¿Desea continuar? (S/N)
set /p confirm=

if /i "%confirm%"=="S" (
    echo.
    echo Ejecutando migración...
    echo.
    
    REM Intentar con diferentes rutas de MySQL
    if exist "C:\xampp\mysql\bin\mysql.exe" (
        echo Usando MySQL de XAMPP...
        C:\xampp\mysql\bin\mysql.exe -u root -p alimetria < migracion_obras_sociales.sql
    ) else if exist "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe" (
        echo Usando MySQL de WAMP...
        C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe -u root -p alimetria < migracion_obras_sociales.sql
    ) else (
        echo Intentando con MySQL en PATH...
        mysql -u root -p alimetria < migracion_obras_sociales.sql
    )
    
    if %errorlevel%==0 (
        echo.
        echo ✅ ¡MIGRACIÓN EJECUTADA EXITOSAMENTE!
        echo.
        echo Cambios realizados:
        echo - Tabla 'obras_sociales' creada con 20 obras sociales
        echo - Campos 'obra_social_id' y 'numero_afiliado' agregados a pacientes
        echo - Vista 'v_pacientes_completo' actualizada
        echo - Pacientes existentes asignados a 'PARTICULAR'
        echo - Índices y foreign keys creados
        echo.
        echo ¡Ya puedes usar la funcionalidad de obras sociales!
        echo.
    ) else (
        echo.
        echo ❌ ERROR AL EJECUTAR LA MIGRACIÓN
        echo.
        echo Posibles soluciones:
        echo 1. Verificar que la base de datos 'alimetria' existe
        echo 2. Verificar usuario y contraseña de MySQL
        echo 3. Verificar que MySQL esté ejecutándose
        echo.
        echo Si el problema persiste, usa phpMyAdmin:
        echo 1. Ir a http://localhost/phpmyadmin
        echo 2. Seleccionar base de datos 'alimetria'
        echo 3. Ir a pestaña 'SQL'
        echo 4. Copiar el contenido de 'migracion_obras_sociales.sql'
        echo 5. Ejecutar
        echo.
    )
) else (
    echo.
    echo Migración cancelada.
)

echo.
pause
