# Alimetria - Sistema de Consultorio de Nutrición

Sistema web completo para gestión de consultorio de nutrición con seguimiento de pacientes, mediciones automáticas via InBody H30, reportes y agenda.

## 🏗️ Arquitectura del Proyecto

```
Alimetria/
├── backend/              # API REST Node.js + Express
│   ├── controllers/      # Lógica de negocio por módulo
│   ├── routes/          # Rutas API REST
│   ├── models/          # Modelos de datos MySQL
│   ├── middleware/      # Auth, permisos, upload, etc.
│   ├── utils/           # OCR, PDF, gráficos
│   ├── config/          # Configuración DB
│   └── uploads/         # Archivos subidos
└── frontend/            # React.js SPA
    ├── src/
    │   ├── components/  # Componentes modulares
    │   ├── pages/       # Páginas principales
    │   ├── context/     # Estado global
    │   ├── services/    # Llamadas API
    │   └── hooks/       # Custom hooks
    └── public/
```

## 🚀 Características Principales

### 👥 Gestión de Pacientes
- Perfiles completos con datos personales
- Galería de fotos de evolución
- Historial médico y observaciones

### 📊 Mediciones Avanzadas
- **Automáticas**: OCR de imágenes InBody H30
- **Manuales**: Pliegues, perímetros, peso, altura
- Historial completo con control de versiones
- Gráficos de evolución

### 📈 Reportes Inteligentes
- PDFs individuales por paciente
- Reportes consolidados con filtros
- Gráficos de evolución (peso, IMC, grasa, músculo)
- Exportación de datos

### 📅 Agenda y Citas
- Calendario visual (diario/semanal/mensual)
- Alertas y recordatorios automáticos
- Gestión de estados de citas

### 🔐 Sistema de Usuarios y Roles
- **Administrador**: Acceso completo
- **Nutricionista**: Mediciones, pacientes, reportes
- **Secretario**: Alta pacientes, consulta datos
- **Paciente**: Solo su perfil y evolución

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express.js**
- **MySQL** con pool de conexiones
- **JWT** para autenticación
- **Tesseract.js** para OCR
- **PDFKit** para reportes
- **Multer** para upload de archivos

### Frontend
- **React.js** con hooks
- **Material-UI** para componentes
- **Recharts** para gráficos
- **Axios** para API calls
- **React Router** para navegación

## 📋 Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- MySQL 8.0+
- npm o yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configurar variables
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Base de Datos
1. Crear base de datos `alimetria` en MySQL
2. Configurar credenciales en `.env`
3. Las tablas se crean automáticamente

## 📋 Variables de Entorno (.env)

```env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=alimetria

# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS
FRONTEND_URL=http://localhost:3000
```

## 🔄 Estado del Desarrollo

### ✅ Completado
- [x] Estructura base del proyecto
- [x] Configuración inicial backend/frontend
- [x] Setup de base de datos

### 🚧 En Desarrollo
- [ ] Sistema de autenticación
- [ ] CRUD de pacientes
- [ ] Sistema de mediciones
- [ ] OCR para InBody
- [ ] Generación de reportes
- [ ] Sistema de agenda

### 📅 Próximas Fases
- [ ] Dashboard y estadísticas
- [ ] Notificaciones y alertas
- [ ] Optimizaciones y tests
- [ ] Deploy y documentación

## 🗃️ Estructura de Base de Datos

### Tablas Principales
- `usuarios` - Sistema de usuarios y roles
- `pacientes` - Datos de pacientes
- `mediciones` - Registros de mediciones
- `mediciones_versiones` - Historial de cambios
- `fotos_pacientes` - Galería de evolución
- `citas` - Agenda y citas

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Perfil actual

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Crear paciente
- `GET /api/pacientes/:id` - Detalle paciente
- `PUT /api/pacientes/:id` - Actualizar paciente

### Mediciones
- `GET /api/mediciones/:pacienteId` - Mediciones de paciente
- `POST /api/mediciones` - Nueva medición
- `PUT /api/mediciones/:id` - Editar medición

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es de uso privado para consultorio de nutrición.

## 👨‍💻 Desarrollo

**Autor:** Gus  
**Versión:** 1.0.0  
**Fecha:** Septiembre 2025

---

⚡ **Desarrollo modular paso a paso para máxima calidad y escalabilidad**
