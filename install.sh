#!/bin/bash

# =========================================
# ALIMETRIA - SCRIPT DE INSTALACIÓN
# Automatiza la instalación completa del proyecto
# =========================================

echo "🏥 ===== INSTALACIÓN ALIMETRIA ====="
echo "Sistema de Consultorio de Nutrición"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 16+ primero."
    exit 1
fi

echo "✅ Node.js versión: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está disponible."
    exit 1
fi

echo "✅ npm versión: $(npm --version)"

# Instalar dependencias del backend
echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias del backend instaladas correctamente"
else
    echo "❌ Error instalando dependencias del backend"
    exit 1
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado, creando uno de ejemplo..."
    cp .env.example .env 2>/dev/null || echo "📝 Por favor configura manualmente el archivo .env"
fi

cd ..

# Instalar dependencias del frontend
echo ""
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias del frontend instaladas correctamente"
else
    echo "❌ Error instalando dependencias del frontend"
    exit 1
fi

cd ..

echo ""
echo "🎉 ===== INSTALACIÓN COMPLETADA ====="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Configurar MySQL y crear base de datos 'alimetria'"
echo "2. Ejecutar el script SQL: backend/sql/complete_database.sql"
echo "3. Configurar variables en backend/.env"
echo "4. Iniciar backend: cd backend && npm run dev"
echo "5. Iniciar frontend: cd frontend && npm start"
echo ""
echo "🌐 URLs del sistema:"
echo "- Backend API: http://localhost:5000"
echo "- Frontend: http://localhost:3000"
echo "- Health Check: http://localhost:5000/health"
echo ""
echo "📚 Documentación completa en README.md"
echo ""
echo "🚀 ¡Listo para desarrollar Alimetria!"
