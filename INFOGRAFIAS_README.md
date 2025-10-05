# 📚 Módulo de Infografías - Guía de Instalación

## ✅ Instalación Rápida

### 1. Inicializar las carpetas necesarias

```bash
cd backend
node scripts/init-infografias.js
```

### 2. Verificar que las tablas existan en la base de datos

Las tablas `infografias` y `categorias_infografias` deben estar creadas. Si no existen, ejecuta los siguientes scripts SQL:

**Categorías:**
```sql
-- Ver archivo: categorias_infografias.sql
```

**Infografías:**
```sql
-- Ver archivo: infografias.sql
```

### 3. Instalar dependencias (si no están instaladas)

```bash
# Backend
cd backend
npm install multer uuid

# Frontend
cd frontend
npm install @mui/icons-material
```

### 4. Iniciar el servidor

```bash
# Backend
cd backend
npm start

# Frontend (en otra terminal)
cd frontend
npm start
```

### 5. Acceder al módulo

Abre el navegador en: `http://localhost:3000/infografias`

## 📁 Archivos Creados

### Backend

```
backend/
├── models/
│   ├── Infografia.js
│   └── CategoriaInfografia.js
├── controllers/
│   └── infografias.controller.js
├── routes/
│   └── infografias.routes.js
├── middleware/
│   └── uploadInfografia.js
├── scripts/
│   └── init-infografias.js
├── docs/
│   └── INFOGRAFIAS.md
└── uploads/
    └── infografias/
```

### Frontend

```
frontend/
├── src/
│   ├── services/
│   │   └── infografias.service.js
│   └── components/
│       └── Infografias/
│           ├── InfografiasGaleria.jsx
│           ├── InfografiasDetalle.jsx
│           ├── InfografiasForm.jsx
│           └── index.js
```

## 🔧 Configuración

### Agregar ruta en el frontend

Edita tu archivo de rutas (por ejemplo, `App.js` o tu archivo de rutas principal):

```jsx
import { InfografiasGaleria } from './components/Infografias';

// Dentro de tus rutas:
<Route path="/infografias" element={<InfografiasGaleria />} />
```

### Agregar enlace en el menú de navegación

```jsx
import { LibraryBooks } from '@mui/icons-material';

// En tu menú:
<MenuItem onClick={() => navigate('/infografias')}>
  <LibraryBooks sx={{ mr: 2 }} />
  Infografías
</MenuItem>
```

## 🎯 Funcionalidades Principales

### Para Nutricionistas/Administradores:
- ✅ Subir nuevas infografías (imágenes y PDF)
- ✅ Editar información de infografías existentes
- ✅ Eliminar infografías (soft delete)
- ✅ Categorizar y etiquetar recursos
- ✅ Ver estadísticas de descargas

### Para Todos los Usuarios:
- ✅ Buscar infografías por título, descripción o autor
- ✅ Filtrar por categoría
- ✅ Ver detalles completos
- ✅ Descargar recursos educativos
- ✅ Navegación intuitiva tipo galería

## 📊 Categorías Predefinidas

El sistema incluye 10 categorías predefinidas:

1. 🥗 Nutrición General
2. 🍎 Alimentación Saludable
3. 💪 Ejercicio y Deporte
4. ⚖️ Pérdida de Peso
5. 🏋️ Ganancia de Masa
6. 🩺 Diabetes
7. ❤️ Hipertensión
8. 👶 Nutrición Pediátrica
9. 🤱 Embarazo y Lactancia
10. 👴 Adulto Mayor

## 🧪 Probar el Módulo

### 1. Subir una infografía de prueba

1. Inicia sesión como administrador o nutricionista
2. Ve a `/infografias`
3. Haz clic en el botón flotante (+) en la esquina inferior derecha
4. Completa el formulario:
   - Título: "Plato Saludable"
   - Descripción: "Guía visual de alimentación balanceada"
   - Categoría: "Nutrición General"
   - Etiquetas: alimentación, balance, salud
   - Archivo: Selecciona una imagen JPG o PNG
5. Haz clic en "Guardar"

### 2. Buscar y filtrar

1. Usa la barra de búsqueda para encontrar infografías
2. Filtra por categoría usando el selector
3. Haz clic en "Filtrar" para aplicar

### 3. Ver detalles y descargar

1. Haz clic en "Ver" en cualquier tarjeta de infografía
2. Se abrirá un modal con todos los detalles
3. Haz clic en "Descargar" para obtener el archivo

## ⚠️ Solución de Problemas

### Las imágenes no se muestran

**Problema:** Las imágenes aparecen rotas en la galería

**Solución:**
1. Verifica que la carpeta `backend/uploads/infografias` exista
2. Confirma que el backend esté sirviendo archivos estáticos correctamente
3. Revisa la configuración de CORS en `server.js`
4. Verifica que la URL de la imagen sea correcta en las dev tools del navegador

### Error al subir archivos

**Problema:** "Error al crear infografía" o "Tipo de archivo no permitido"

**Solución:**
1. Verifica que el archivo sea JPG, PNG, GIF, WebP o PDF
2. Confirma que el tamaño sea menor a 10MB
3. Revisa los permisos de escritura en la carpeta `uploads/infografias`
4. Verifica que multer esté instalado: `npm list multer`

### Las rutas no funcionan

**Problema:** Error 404 al llamar a la API

**Solución:**
1. Verifica que las rutas estén registradas en `server.js`
2. Confirma que el servidor esté corriendo
3. Revisa la consola del backend para ver errores
4. Verifica la URL en `infografias.service.js`

### No puedo subir infografías

**Problema:** El botón flotante (+) no aparece

**Solución:**
- Verifica que tu usuario tenga rol de "administrador" o "nutricionista"
- Revisa `localStorage.getItem('usuario')` en la consola del navegador
- Confirma que el campo `rol.nombre` esté presente en el objeto usuario

## 📝 Siguiente Paso: Integrar en tu Aplicación

Una vez que hayas probado que todo funciona, puedes:

1. **Agregar al menú principal** de tu aplicación
2. **Crear un dashboard widget** con estadísticas de infografías
3. **Integrar con pacientes**: Enviar infografías específicas a pacientes
4. **Personalizar categorías**: Agregar o modificar categorías según tus necesidades

## 📖 Documentación Completa

Para más detalles técnicos, consulta:
- `backend/docs/INFOGRAFIAS.md` - Documentación técnica completa
- API Endpoints y ejemplos de uso
- Estructura de base de datos
- Guía de desarrollo

## 🎉 ¡Listo!

El módulo de infografías está completamente funcional y listo para usar. Si tienes alguna pregunta o encuentras algún problema, revisa la documentación técnica o contacta al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última actualización:** Octubre 2025  
**Proyecto:** Alimetria - Sistema de Consultorio de Nutrición
