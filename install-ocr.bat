@echo off
echo ========================================
echo    INSTALACION OCR PARA ALIMETRIA
echo ========================================
echo.

echo [1/4] Instalando dependencias de OCR en backend...
cd backend
npm install tesseract.js sharp multer
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion de dependencias OCR
    pause
    exit /b 1
)

echo [2/4] Creando directorio de uploads si no existe...
if not exist "uploads" mkdir uploads
if not exist "uploads\inbody" mkdir uploads\inbody
if not exist "uploads\fotos" mkdir uploads\fotos

echo [3/4] Configurando permisos de directorios...
icacls uploads /grant Users:(F) /T

echo [4/4] Instalacion completa!
echo.
echo DIRECTORIOS CREADOS:
echo - backend/uploads/inbody (para archivos InBody)
echo - backend/uploads/fotos (para fotos de pacientes)
echo.
echo NUEVAS DEPENDENCIAS:
echo - tesseract.js (OCR)
echo - sharp (procesamiento de imagenes)
echo - multer (upload de archivos)
echo.
echo ========================================
echo    INSTALACION OCR COMPLETADA
echo ========================================
pause