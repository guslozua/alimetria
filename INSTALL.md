# 🚀 Guía de Instalación - Alimetria v1.0.0

## 📋 Prerrequisitos

Antes de instalar Alimetria, asegúrate de tener:

### ✅ Software Requerido
- **Node.js** 16+ → [Descargar](https://nodejs.org/)
- **MySQL** 8.0+ → [XAMPP](https://www.apachefriends.org/) o [MySQL Server](https://dev.mysql.com/downloads/)
- **Git** (opcional) → [Descargar](https://git-scm.com/)

### 🔍 Verificar Instalación
Abre cmd/terminal y ejecuta:
```bash
node --version    # Debe mostrar v16+ 
npm --version     # Debe mostrar 8+
mysql --version   # Debe mostrar 8.0+
```

---

## 🎯 Instalación Paso a Paso

### Paso 1: Instalación Automática
```bash
# Ejecutar el instalador automático
install-all.bat
```

### Paso 2: Configurar Base de Datos
```bash
# Ejecutar el configurador de BD
setup-database.bat
```

### Paso 3: Iniciar el Sistema
```bash
# Terminal 1: Iniciar Backend
start-backend.bat

# Terminal 2: Iniciar Frontend  
start-frontend.bat
```

---

## 🔧 Instalación Manual (Alternativa)

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

### Base de Datos
1. Iniciar MySQL (XAMPP/MySQL Server)
2. Ejecutar: `backend/sql/complete_tables.sql`
3. Configurar credenciales en `backend/.env`

---

## 🌐 URLs del Sistema

Una vez instalado:
- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:3000
- **Health Check:** http://localhost:5000/health

---

## 🛠️ Comandos de Desarrollo

### Backend
```bash
cd backend
npm run dev     # Modo desarrollo (nodemon)
npm start       # Modo producción
```

### Frontend
```bash
cd frontend
npm start       # Desarrollo (puerto 3000)
npm run build   # Construir para producción
```

---

## 📊 Estructura de Base de Datos

### Tablas Principales
- `roles` - Sistema de roles
- `usuarios` - Usuarios del sistema
- `consultorios` - Multi-consultorio
- `pacientes` - Datos de pacientes
- `mediciones` - Mediciones (manual/InBody)
- `mediciones_versiones` - Historial de cambios
- `fotos_pacientes` - Galería de evolución
- `citas` - Agenda y citas
- `reportes` - Reportes generados
- `notificaciones` - Sistema de alertas
- `configuraciones` - Configuraciones globales

### Datos Iniciales
- **Roles:** Administrador, Nutricionista, Secretario, Paciente
- **Consultorio:** Consultorio Principal
- **Configuraciones:** Sistema, interfaz, notificaciones

---

## 🔐 Configuración de Seguridad

### Variables de Entorno (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=alimetria

JWT_SECRET=tu_secreto_super_seguro
PORT=5000
```

### Permisos por Rol
- **Administrador:** Acceso total
- **Nutricionista:** Pacientes, mediciones, reportes, citas
- **Secretario:** Crear pacientes, ver datos, agendar citas
- **Paciente:** Solo su perfil y evolución

---

## 🚨 Solución de Problemas

### Error: "MySQL no conecta"
✅ **Solución:**
1. Verificar que MySQL esté ejecutándose
2. Comprobar credenciales en `.env`
3. Verificar que el puerto 3306 esté libre

### Error: "Puerto 5000 ocupado"
✅ **Solución:**
1. Cambiar puerto en `.env`: `PORT=5001`
2. O cerrar aplicación que use el puerto 5000

### Error: "npm install falla"
✅ **Solución:**
1. Ejecutar como administrador
2. Limpiar caché: `npm cache clean --force`
3. Eliminar `node_modules` y reinstalar

### Error: "Frontend no carga"
✅ **Solución:**
1. Verificar que backend esté corriendo
2. Comprobar proxy en `package.json`
3. Revisar consola del navegador

---

## 📞 Soporte y Desarrollo

### Estado Actual: Fase 1.2 ✅
- [x] Estructura base del proyecto
- [x] Configuración inicial backend/frontend
- [x] Setup de base de datos

### Próximas Fases:
- [ ] **Fase 2:** Sistema de autenticación (JWT + Roles)
- [ ] **Fase 3:** CRUD de pacientes
- [ ] **Fase 4:** Sistema de mediciones + OCR
- [ ] **Fase 5:** Reportes y gráficos
- [ ] **Fase 6:** Sistema de agenda y citas

### Contacto
**Desarrollador:** Gus  
**Proyecto:** Alimetria - Sistema de Consultorio de Nutrición  
**Versión:** 1.0.0  
**Fecha:** Septiembre 2025

---

## 📄 Licencia
Este proyecto es de uso privado para consultorio de nutrición.

---

⚡ **¡Listo para empezar! Ejecuta `install-all.bat` para comenzar.**
