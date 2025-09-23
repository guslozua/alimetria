@echo off
echo ============================================
echo INSTALACION SISTEMA DE SUPLEMENTOS
echo ============================================
echo.

echo [1/4] Verificando conexion MySQL...
mysql -h localhost -u root -p%DB_PASSWORD% -e "SELECT 'Conexion exitosa' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: No se puede conectar a MySQL
    echo Verifica que XAMPP este iniciado
    pause
    exit /b 1
)

echo [2/4] Ejecutando script de tablas...
mysql -h localhost -u root -p%DB_PASSWORD% alimetria < sql/001_suplementos_tables.sql
if %errorlevel% neq 0 (
    echo ERROR: Fallo al crear tablas
    pause
    exit /b 1
)

echo [3/4] Ejecutando script de datos iniciales...
mysql -h localhost -u root -p%DB_PASSWORD% alimetria < sql/002_suplementos_data.sql
if %errorlevel% neq 0 (
    echo ERROR: Fallo al insertar datos
    pause
    exit /b 1
)

echo [4/4] Ejecutando script de vistas y datos detallados...
mysql -h localhost -u root -p%DB_PASSWORD% alimetria < sql/003_suplementos_views.sql
if %errorlevel% neq 0 (
    echo ERROR: Fallo al crear vistas
    pause
    exit /b 1
)

echo.
echo ============================================
echo INSTALACION COMPLETADA EXITOSAMENTE!
echo ============================================
echo.
echo Tablas creadas:
echo - categorias_suplementos
echo - suplementos  
echo - suplemento_indicaciones
echo - suplemento_contraindicaciones
echo - suplemento_interacciones
echo - suplemento_efectos_secundarios
echo - suplemento_referencias
echo.
echo Vista creada:
echo - v_suplementos_completo
echo.
echo Datos insertados:
echo - 8 categorias de suplementos
echo - 10 suplementos base con informacion completa
echo - Indicaciones, contraindicaciones e interacciones
echo.
pause
