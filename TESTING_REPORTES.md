# 🧪 Testing del Sistema de Reportes Alimetria

## 🚀 Comandos para Iniciar el Sistema

### 1. Iniciar Backend
```bash
cd C:\Users\guslo\Alimetria\backend
npm run dev
# o
node server.js
```

### 2. Iniciar Frontend  
```bash
cd C:\Users\guslo\Alimetria\frontend
npm start
```

### 3. Acceder al Sistema
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001
- Login: admin@alimetria.com / password (ver create-admin.bat)

## 🔍 Pruebas del Sistema de Reportes

### **Paso 1: Verificar Autenticación**
1. Abrir http://localhost:3001
2. Iniciar sesión con usuario administrador
3. Verificar que aparezca el módulo "Reportes" en el dashboard

### **Paso 2: Probar Acceso a Reportes**
1. Click en "Reportes" desde el menú principal
2. Verificar que se carga la página con tabs:
   - "Reporte Individual" 
   - "Reporte Consolidado"

### **Paso 3: Probar Reporte Individual**
1. **Desde Lista de Pacientes:**
   - Ir a "Pacientes"
   - Seleccionar un paciente (ej: Juan Pérez)
   - Click en "Generar Reporte" (botón naranja con ícono PDF)
   
2. **Desde Detalle de Paciente:**
   - Entrar al detalle del paciente
   - Click en tab "Reportes"
   - Click en "Ir a Reportes Completos"

3. **Funcionalidades a Probar:**
   - Aplicar filtros de fecha
   - Click en "Ver Datos" → debe mostrar gráficos y estadísticas
   - Click en "Descargar PDF" → debe descargar archivo PDF

### **Paso 4: Probar Reporte Consolidado**
1. En página de reportes, cambiar a tab "Reporte Consolidado"
2. Click en "Ver Datos" → debe mostrar estadísticas del consultorio
3. Verificar métricas:
   - Total de pacientes
   - Total de mediciones
   - Promedios generales
   - Distribución por IMC

## 🛠️ Endpoints de API para Testing

### **Testing con curl o Postman**

#### 1. Login y obtener token
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alimetria.com", "password": "admin123"}'
```

#### 2. Obtener datos de paciente para reporte (reemplazar TOKEN)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/reportes/paciente/1/datos
```

#### 3. Obtener datos consolidados
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/reportes/consolidado/datos
```

#### 4. Estadísticas generales
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/reportes/estadisticas/generales
```

## ✅ Checklist de Verificación

### **Backend**
- [ ] Servidor inicia sin errores en puerto 5001
- [ ] Rutas de reportes disponibles en /api/reportes/*
- [ ] Base de datos conecta correctamente
- [ ] Endpoints responden con datos válidos

### **Frontend**  
- [ ] Aplicación inicia sin errores en puerto 3001
- [ ] Login funciona correctamente
- [ ] Módulo "Reportes" visible en dashboard
- [ ] Navegación entre tabs funciona
- [ ] Gráficos se renderizan correctamente

### **Reportes Individuales**
- [ ] Datos del paciente se cargan
- [ ] Estadísticas calculan correctamente
- [ ] Gráficos muestran evolución temporal
- [ ] Filtros de fecha funcionan
- [ ] PDF se genera y descarga

### **Reportes Consolidados**
- [ ] Estadísticas del consultorio se muestran
- [ ] Distribución por IMC es correcta
- [ ] Filtros aplicables funcionan

### **Integración UI**
- [ ] Botón "Generar Reporte" en DetallePaciente
- [ ] Tab "Reportes" funcional en perfil de paciente
- [ ] Navegación breadcrumbs correcta
- [ ] Links entre módulos funcionan

### **Permisos**
- [ ] Administradores acceden a todo
- [ ] Nutricionistas acceden a reportes
- [ ] Otros roles tienen acceso restringido

## 🐛 Solución de Problemas Comunes

### **Error: Cannot read property 'nombre' of undefined**
- Verificar que el paciente existe en la BD
- Verificar formato de respuesta del backend

### **Error: 500 en endpoints de reportes**
- Verificar logs del backend
- Verificar conexión a base de datos
- Verificar que existen mediciones para el paciente

### **Gráficos no se muestran**
- Verificar que recharts está instalado
- Verificar que hay datos de mediciones
- Verificar formato de datos en console.log

### **PDF no se descarga**
- Verificar que PDFKit está instalado en backend
- Verificar permisos del usuario
- Verificar logs de errores en backend

## 📊 Datos de Prueba

El sistema ya incluye datos de ejemplo:
- 5 pacientes con mediciones históricas
- Diferentes rangos de IMC para testing
- Fechas distribuidas en el tiempo

## 🎯 Métricas de Éxito

El sistema debe:
1. ✅ Generar PDFs profesionales sin errores
2. ✅ Mostrar gráficos interactivos de evolución
3. ✅ Calcular estadísticas correctamente
4. ✅ Manejar filtros de fecha sin fallos
5. ✅ Navegar fluidamente entre módulos
6. ✅ Respetar permisos de usuario

**¡Sistema de Reportes listo para producción!** 🚀