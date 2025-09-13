
# 🔧 Test Backend Reportes

## Verificar que el backend inicia correctamente

Ejecutar desde C:\Users\guslo\Alimetria\backend:

```bash
npm start
```

## Verificar endpoints de reportes

### 1. Login (obtener token)
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@alimetria.com\", \"password\": \"admin123\"}"
```

### 2. Datos del paciente (reemplazar TOKEN)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/reportes/paciente/1/datos
```

### 3. Estadísticas generales
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/reportes/estadisticas/generales
```

Si el backend inicia sin errores, entonces las correcciones funcionaron ✅
