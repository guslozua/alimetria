# 📚 Módulo de Infografías Educativas

## Descripción
Este módulo permite gestionar una biblioteca de infografías y recursos educativos que los nutricionistas pueden compartir con sus pacientes.

## Características

✅ **Gestión completa de infografías**
- Subida de archivos (imágenes y PDF)
- Categorización por temas nutricionales
- Sistema de etiquetado (tags)
- Búsqueda y filtrado avanzado
- Contador de descargas

✅ **Categorías predefinidas**
- Nutrición General
- Alimentación Saludable
- Ejercicio y Deporte
- Pérdida de Peso
- Ganancia de Masa
- Diabetes
- Hipertensión
- Nutrición Pediátrica
- Embarazo y Lactancia
- Adulto Mayor

✅ **Permisos por rol**
- **Administrador**: CRUD completo
- **Nutricionista**: Crear y editar infografías
- **Secretario**: Solo visualización
- **Todos**: Pueden ver y descargar

## Estructura de Archivos

```
backend/
├── models/
│   ├── Infografia.js              # Modelo de infografías
│   └── CategoriaInfografia.js     # Modelo de categorías
├── controllers/
│   └── infografias.controller.js  # Lógica de negocio
├── routes/
│   └── infografias.routes.js      # Rutas API
├── middleware/
│   └── uploadInfografia.js        # Middleware de subida de archivos
└── uploads/
    └── infografias/                # Carpeta de almacenamiento

frontend/
├── services/
│   └── infografias.service.js     # Servicios API
└── components/
    └── Infografias/
        ├── InfografiasGaleria.jsx # Componente principal
        ├── InfografiasDetalle.jsx # Modal de detalle
        ├── InfografiasForm.jsx    # Formulario de creación/edición
        └── index.js               # Exportaciones
```

## API Endpoints

### Infografías

#### Obtener todas las infografías
```http
GET /api/infografias
```

**Query Parameters:**
- `categoria_id` (opcional): Filtrar por categoría
- `busqueda` (opcional): Buscar por título, descripción o autor
- `limite` (opcional): Número de resultados (default: 50)
- `offset` (opcional): Paginación (default: 0)

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Plato Saludable",
      "descripcion": "Guía visual...",
      "categoria_id": 1,
      "categoria_nombre": "Nutrición General",
      "categoria_color": "#4CAF50",
      "tags": ["alimentación", "balance", "nutrición"],
      "ruta_archivo": "/uploads/infografias/infografia-123.jpg",
      "tipo_archivo": "image/jpeg",
      "tamaño": 524288,
      "autor": "Dr. Nutrición",
      "descargas": 45,
      "fecha_creacion": "2025-09-27T00:24:15.000Z"
    }
  ],
  "count": 1
}
```

#### Obtener una infografía por ID
```http
GET /api/infografias/:id
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Plato Saludable",
    ...
  }
}
```

#### Crear nueva infografía
```http
POST /api/infografias
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (FormData):**
- `archivo` (required): Archivo de imagen o PDF
- `titulo` (required): Título de la infografía
- `descripcion` (optional): Descripción
- `categoria_id` (required): ID de la categoría
- `tags` (optional): Array JSON de etiquetas
- `autor` (optional): Nombre del autor

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Infografía creada exitosamente",
  "data": {
    "id": 7
  }
}
```

#### Actualizar infografía
```http
PUT /api/infografias/:id
Authorization: Bearer {token}
```

**Body:**
```json
{
  "titulo": "Nuevo título",
  "descripcion": "Nueva descripción",
  "categoria_id": 2,
  "tags": ["tag1", "tag2"],
  "autor": "Autor actualizado"
}
```

#### Eliminar infografía (soft delete)
```http
DELETE /api/infografias/:id
Authorization: Bearer {token}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Infografía eliminada exitosamente"
}
```

#### Descargar infografía
```http
GET /api/infografias/:id/descargar
```

Descarga el archivo y automáticamente incrementa el contador de descargas.

#### Obtener estadísticas
```http
GET /api/infografias/estadisticas
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "Nutrición General",
      "count_categoria": 5,
      "total": 20,
      "total_descargas": 150
    }
  ]
}
```

### Categorías

#### Obtener todas las categorías
```http
GET /api/infografias/categorias
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Nutrición General",
      "descripcion": "Conceptos básicos...",
      "color": "#4CAF50",
      "icono": "🥗",
      "orden_visualizacion": 1,
      "total_infografias": 5
    }
  ]
}
```

#### Crear categoría
```http
POST /api/infografias/categorias
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nombre": "Nueva Categoría",
  "descripcion": "Descripción de la categoría",
  "color": "#FF5722",
  "icono": "🎯",
  "orden_visualizacion": 11
}
```

#### Actualizar categoría
```http
PUT /api/infografias/categorias/:id
Authorization: Bearer {token}
```

## Uso en Frontend

### Importar componentes

```jsx
import { InfografiasGaleria } from './components/Infografias';

// En tu router o componente principal
<Route path="/infografias" element={<InfografiasGaleria />} />
```

### Usar servicios directamente

```javascript
import { 
  obtenerInfografias, 
  descargarInfografia,
  crearInfografia 
} from './services/infografias.service';

// Obtener infografías
const infografias = await obtenerInfografias({ categoria_id: 1 });

// Descargar
await descargarInfografia(infografiaId, 'nombre-archivo.pdf');

// Crear
const formData = new FormData();
formData.append('titulo', 'Mi Infografía');
formData.append('categoria_id', 1);
formData.append('archivo', file);
await crearInfografia(formData);
```

## Configuración

### Variables de entorno necesarias

```env
# Backend (.env)
PORT=5000
NODE_ENV=development

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

### Validaciones de archivo

- **Tipos permitidos**: JPG, JPEG, PNG, GIF, WebP, PDF
- **Tamaño máximo**: 10 MB
- **Almacenamiento**: `/uploads/infografias/`

### Estructura de carpetas en uploads

```
uploads/
└── infografias/
    ├── infografia-1759452003392-dc8cc385-3a26-4924-9b2c-0292e9e4f740.jpeg
    ├── infografia-1759452337378-2dfe2edb-cba7-4f2c-b1b1-3b164ea43c06.jpeg
    └── ...
```

Los archivos se nombran automáticamente con: `infografia-{timestamp}-{uuid}.{ext}`

## Base de Datos

### Tabla `infografias`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único |
| titulo | VARCHAR(255) | Título de la infografía |
| descripcion | TEXT | Descripción detallada |
| categoria_id | INT | FK a categorias_infografias |
| tags | JSON | Array de etiquetas |
| ruta_archivo | VARCHAR(500) | Ruta del archivo |
| nombre_archivo | VARCHAR(255) | Nombre del archivo |
| tipo_archivo | VARCHAR(100) | MIME type |
| tamaño | BIGINT | Tamaño en bytes |
| autor | VARCHAR(255) | Autor o fuente |
| usuario_id | INT | Usuario que subió |
| descargas | INT | Contador de descargas |
| activo | TINYINT | Soft delete flag |
| fecha_creacion | DATETIME | Fecha de creación |

### Tabla `categorias_infografias`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único |
| nombre | VARCHAR(50) | Nombre de la categoría |
| descripcion | TEXT | Descripción |
| color | VARCHAR(7) | Color hexadecimal |
| icono | VARCHAR(50) | Emoji o icono |
| orden_visualizacion | INT | Orden de visualización |
| activo | TINYINT | Soft delete flag |

## Testing

### Probar la API con cURL

**Listar infografías:**
```bash
curl http://localhost:5000/api/infografias
```

**Subir infografía:**
```bash
curl -X POST http://localhost:5000/api/infografias \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "archivo=@/path/to/image.jpg" \
  -F "titulo=Test Infografía" \
  -F "categoria_id=1" \
  -F "descripcion=Descripción de prueba"
```

**Descargar infografía:**
```bash
curl http://localhost:5000/api/infografias/1/descargar -o descarga.jpg
```

## Troubleshooting

### Error: "Tipo de archivo no permitido"
- Verifica que el archivo sea una imagen (JPG, PNG, GIF, WebP) o PDF
- Revisa la extensión del archivo

### Error: "El archivo no debe superar los 10MB"
- Comprime la imagen antes de subirla
- Para PDFs, reduce la calidad de las imágenes internas

### No se muestran las imágenes en el frontend
- Verifica que la carpeta `uploads/infografias` exista
- Confirma que el servidor está sirviendo archivos estáticos
- Revisa la configuración de CORS en `server.js`

### Errores de permisos al subir archivos
- Verifica permisos de escritura en la carpeta `uploads/infografias`
- En Linux/Mac: `chmod 755 uploads/infografias`

## Futuras Mejoras

- [ ] Soporte para múltiples archivos por infografía
- [ ] Sistema de favoritos
- [ ] Compartir infografía por email/WhatsApp
- [ ] Vista previa de PDFs en el modal
- [ ] Edición de imagen básica (recorte, rotación)
- [ ] Versiones de infografías
- [ ] Comentarios y valoraciones
- [ ] Carpetas personalizadas por nutricionista
- [ ] Integración con generadores de infografías

## Soporte

Para reportar bugs o sugerir mejoras, contacta al equipo de desarrollo de Alimetria.

---

**Última actualización**: Octubre 2025
**Versión del módulo**: 1.0.0
