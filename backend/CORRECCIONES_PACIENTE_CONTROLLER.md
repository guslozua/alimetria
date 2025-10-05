# Correcciones Realizadas en pacienteController.js

**Fecha:** 2 de octubre de 2025  
**Problema:** Error 500 al crear pacientes nuevos

## Errores Identificados

Se encontraron 2 tipos de errores en las referencias al objeto `req.user`:

### 1. Error en `usuario_creador_id` 
**Línea ~166:**
```javascript
// ❌ INCORRECTO
pacienteData.usuario_creador_id = req.user.userId;

// ✅ CORREGIDO
pacienteData.usuario_creador_id = req.user.id;
```

### 2. Error de typo en `consultorioId`
**Múltiples líneas (~35, 91, 171, 202, 253, 293, 332, 372, 414):**
```javascript
// ❌ INCORRECTO (typo: "consultoirioId")
req.user.consultoirioId

// ✅ CORREGIDO
req.user.consultorioId
```

## Métodos Afectados y Corregidos

1. `getAll()` - Línea ~35
2. `getById()` - Línea ~91  
3. `create()` - Líneas ~166, ~171 (✨ **Este era el método crítico que causaba el error**)
4. `update()` - Línea ~202
5. `delete()` - Línea ~253
6. `getMediciones()` - Línea ~293
7. `getEstadisticas()` - Línea ~332
8. `getFotos()` - Línea ~372
9. `search()` - Línea ~414

## Causa del Error 500

El campo `usuario_creador_id` en la tabla `pacientes` **NO permite valores NULL**. Al intentar insertar `undefined` (porque `req.user.userId` no existe), la base de datos MySQL rechazaba la operación y retornaba un error SQL que se traducía en un error 500.

## Estructura Correcta de `req.user`

Según el middleware `auth.js`, el objeto `req.user` tiene la siguiente estructura:

```javascript
req.user = {
  id: user.id,              // ✅ ID del usuario
  email: user.email,
  rol_nombre: user.rol_nombre,
  rol: user.rol_nombre,
  rolId: user.rol_id,
  permisos: {...},
  consultorioId: user.consultorio_id  // ✅ ID del consultorio
};
```

## Verificación

Para verificar que las correcciones funcionan:

1. Reiniciar el servidor backend:
   ```bash
   cd backend
   npm start
   ```

2. Intentar crear un nuevo paciente desde el frontend

3. El paciente debería crearse exitosamente con un status 201

## Archivos Modificados

- ✅ `backend/controllers/pacienteController.js` - **9 correcciones aplicadas**

---

**Estado:** ✅ Correcciones implementadas y aplicadas exitosamente
