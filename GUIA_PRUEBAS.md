# 🧪 GUÍA DE PRUEBAS - ALIMETRIA

## ✅ **PROBLEMA SOLUCIONADO**

**Error de compilación JSX corregido** - El FormularioMedicion.js tenía tags HTML mal cerrados que impedían la compilación.

---

## 🚀 **PASOS PARA PROBAR EL SISTEMA COMPLETO**

### **PASO 1: Verificar que ambos servidores estén corriendo**
```
✅ Backend: http://localhost:5001 (ya corriendo)
🔄 Frontend: Reiniciar para cargar cambios corregidos
```

### **PASO 2: Reiniciar Frontend**
En la terminal donde tienes el frontend, presiona `Ctrl+C` y luego:
```bash
npm start
```
O ejecuta: `iniciar-frontend.bat`

### **PASO 3: Acceder a la aplicación**
1. Abrir: http://localhost:3001
2. Login con credenciales de administrador
3. Navegar a **Pacientes**

---

## 🎯 **CASOS DE PRUEBA ESPECÍFICOS**

### **PRUEBA 1: Medición Manual**
1. Ir a **Pacientes** → Seleccionar cualquier paciente
2. Click en **"Nueva Medición"**
3. Verificar que aparece el nuevo formulario integrado
4. Seleccionar tipo: **"Manual"**
5. Llenar campos básicos: peso, altura
6. Verificar que el **IMC se calcula automáticamente**
7. Expandir **"Composición Corporal"** y llenar algunos campos
8. Expandir **"Perímetros"** y **"Pliegues"**
9. Agregar **observaciones**
10. Click **"Guardar"**
11. ✅ **Esperado**: Se guarda sin errores y regresa al detalle del paciente

### **PRUEBA 2: Medición InBody (OCR)**
1. Nueva medición → Tipo: **"InBody"**
2. Verificar que aparece el botón **"Subir Imagen InBody"**
3. Click en el botón
4. Verificar que se abre el **dialog de OCR**
5. Probar **drag & drop** o **click para seleccionar**
6. ⚠️ **Nota**: El OCR puede fallar si el endpoint no está configurado
7. ✅ **Esperado**: Dialog responsivo y funcional

### **PRUEBA 3: Medición Mixta**
1. Nueva medición → Tipo: **"Mixta"**
2. Subir imagen InBody (si el OCR funciona)
3. **Completar manualmente** los campos faltantes
4. Verificar que todos los campos son editables
5. Guardar la medición

### **PRUEBA 4: Reportes PDF**
1. Desde el detalle de un paciente
2. Click en **"Generar Reporte"**
3. ✅ **Esperado**: Se descarga un PDF
4. Abrir el PDF en Adobe/navegador
5. Verificar que no hay errores de corrupción

---

## 🔍 **QUÉ BUSCAR EN CADA PRUEBA**

### **Frontend**
- ✅ **Compilación sin errores**
- ✅ **Formulario carga correctamente**
- ✅ **3 tipos de medición disponibles**
- ✅ **Campos organizados en acordeones**
- ✅ **Cálculo automático de IMC**
- ✅ **Botones funcionan correctamente**
- ✅ **Navegación sin errores**

### **OCR (si está configurado)**
- ✅ **Dialog se abre correctamente**
- ✅ **Drag & drop funciona**
- ✅ **Progress bar se muestra**
- ✅ **Datos se prellenan en formulario**
- ✅ **Chips de confianza aparecen**

### **Backend/API**
- ✅ **POST /api/mediciones funciona**
- ✅ **Datos se guardan en DB**
- ✅ **GET /api/reportes/paciente/:id/pdf funciona**
- ✅ **No hay errores 500 en consola**

---

## 🐛 **POSIBLES ERRORES Y SOLUCIONES**

### **Error: "Cannot read property of undefined"**
**Causa**: Servicio de mediciones no está importado correctamente
**Solución**: Verificar imports en el FormularioMedicion.js

### **Error: "OCR endpoint not found"**
**Causa**: Ruta `/api/mediciones/procesar-inbody` no existe
**Solución**: Verificar que el controlador OCR esté registrado

### **Error: "PDF no se abre"**
**Causa**: PDFs corruptos por datos mal formateados
**Solución**: Verificar el controlador de reportes

### **Error: "React dropzone not working"**
**Causa**: Dependencia `react-dropzone` no instalada
**Solución**: 
```bash
cd C:\Users\guslo\Alimetria\frontend
npm install react-dropzone
```

---

## 📊 **CHECKLIST DE VERIFICACIÓN**

### **Antes de las pruebas:**
- [ ] Backend corriendo en puerto 5001
- [ ] Frontend compilando sin errores
- [ ] Base de datos accesible
- [ ] Pacientes de prueba creados

### **Durante las pruebas:**
- [ ] Login funciona
- [ ] Lista de pacientes carga
- [ ] Formulario de medición abre
- [ ] Tipos de medición cambian UI
- [ ] Campos numéricos aceptan decimales
- [ ] IMC se calcula automáticamente
- [ ] Botón guardar funciona

### **Después de las pruebas:**
- [ ] Datos aparecen en detalle del paciente
- [ ] Reportes se generan correctamente
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en terminal del backend

---

## 🎉 **RESULTADO ESPERADO**

Al completar todas las pruebas exitosamente:

✅ **Sistema completamente funcional**
✅ **OCR integrado (si está configurado)**
✅ **Mediciones guardándose correctamente**
✅ **Reportes PDF funcionando**
✅ **Arquitectura limpia y mantenible**
✅ **UX mejorada para el usuario final**

---

**Fecha**: Septiembre 12, 2025  
**Estado**: Listo para pruebas completas