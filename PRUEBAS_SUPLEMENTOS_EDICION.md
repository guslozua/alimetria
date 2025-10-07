# 🧪 Guía de Pruebas - Edición y Eliminación de Suplementos

## ✅ Pre-requisitos

1. **Backend corriendo** en `http://localhost:5000`
2. **Frontend corriendo** en `http://localhost:3000`
3. **Usuario con permisos** (Admin o Nutricionista)
4. **Base de datos** con suplementos de ejemplo

---

## 🔍 Pruebas Paso a Paso

### 1️⃣ Verificar Permisos

**Objetivo:** Confirmar que los botones solo aparecen para usuarios con permisos.

#### Pasos:
1. Ir a `http://localhost:3000/suplementos`
2. Iniciar sesión como **Admin** o **Nutricionista**
3. Observar las tarjetas de suplementos

#### ✅ Resultado esperado:
- Al hacer **hover** sobre una tarjeta en vista Grid:
  - Deben aparecer dos botones en la esquina inferior derecha
  - Botón **azul** con ícono de lápiz (Editar)
  - Botón **rojo** con ícono de basura (Eliminar)
  
- En vista **Lista**:
  - Los botones deben estar siempre visibles a la derecha
  - Junto al botón de favoritos

#### ❌ Si no aparecen:
```javascript
// Abrir DevTools Console y verificar:
console.log('Es Admin:', isAdmin());
console.log('Es Nutricionista:', isNutricionista());
console.log('Puede editar:', isAdmin() || isNutricionista());
```

---

### 2️⃣ Probar EDICIÓN

**Objetivo:** Modificar un suplemento existente.

#### Pasos:
1. Seleccionar el suplemento **"Omega 3 (EPA/DHA)"** (ID: 3)
2. Hacer hover y click en botón **Editar** (✏️)
3. Esperar a que se abra el modal con datos precargados
4. Verificar que todos los campos estén llenos
5. Modificar algunos campos:
   - **Nombre:** "Omega 3 EPA/DHA Mejorado"
   - **Dosis recomendada:** "2-4 gramos por día"
   - **Destacado:** Activar checkbox
6. Click en **"Actualizar Suplemento"**
7. Esperar recarga de página

#### ✅ Resultado esperado:
```
✓ Modal se abre con título "✏️ Editar Suplemento"
✓ Todos los campos están precargados con datos existentes
✓ Botón dice "Actualizar Suplemento" (no "Guardar")
✓ Se muestra mensaje de éxito
✓ Página se recarga automáticamente
✓ El suplemento muestra los cambios aplicados
```

#### 🔍 Verificar en Backend:
```bash
# Revisar logs del backend
# Debe mostrar:
[SUPLEMENTOS] PUT /3
🔄 Actualizando suplemento: 3
✅ Suplemento actualizado exitosamente
```

#### 🗄️ Verificar en Base de Datos:
```sql
SELECT id, nombre, dosis_recomendada, destacado 
FROM suplementos 
WHERE id = 3;

-- Debe mostrar:
-- id: 3
-- nombre: "Omega 3 EPA/DHA Mejorado"
-- dosis_recomendada: "2-4 gramos por día"
-- destacado: 1
```

---

### 3️⃣ Probar ELIMINACIÓN

**Objetivo:** Eliminar (soft delete) un suplemento.

#### Pasos:
1. Seleccionar cualquier suplemento (ejemplo: "Resveratrol" ID: 20)
2. Hacer hover y click en botón **Eliminar** (🗑️)
3. Debe aparecer un dialog de confirmación
4. Leer el mensaje de advertencia
5. Click en **"Eliminar"** (botón rojo)
6. Esperar recarga de página

#### ✅ Resultado esperado:
```
✓ Se abre dialog con título "Confirmar Eliminación"
✓ Muestra alerta amarilla: "Esta acción marcará el suplemento como inactivo"
✓ Muestra nombre del suplemento a eliminar
✓ Explica que no se borra permanentemente
✓ Tiene botones "Cancelar" y "Eliminar"
✓ Al confirmar, muestra loading
✓ Página se recarga
✓ El suplemento YA NO aparece en la lista
```

#### 🔍 Verificar en Backend:
```bash
# Revisar logs del backend
# Debe mostrar:
[SUPLEMENTOS] DELETE /20
🗑️ Eliminando suplemento: 20
✅ Suplemento eliminado exitosamente
```

#### 🗄️ Verificar en Base de Datos:
```sql
-- El suplemento debe seguir existiendo pero con activo = 0
SELECT id, nombre, activo 
FROM suplementos 
WHERE id = 20;

-- Debe mostrar:
-- id: 20
-- nombre: "Resveratrol"
-- activo: 0  ← CAMBIÓ DE 1 A 0
```

```sql
-- Verificar que NO aparece en consultas normales
SELECT COUNT(*) FROM suplementos WHERE activo = 1;
-- El count debe ser 1 menos que antes

-- Ver suplementos inactivos
SELECT id, nombre FROM suplementos WHERE activo = 0;
```

---

### 4️⃣ Probar CANCELACIÓN

**Objetivo:** Verificar que se puede cancelar sin hacer cambios.

#### Pasos para Edición:
1. Click en **Editar** de cualquier suplemento
2. Modificar algún campo
3. Click en **X** o **Cancelar**
4. Verificar que no se guardaron cambios

#### ✅ Resultado esperado:
```
✓ Modal se cierra sin guardar
✓ No hay recarga de página
✓ El suplemento mantiene sus datos originales
```

#### Pasos para Eliminación:
1. Click en **Eliminar** de cualquier suplemento
2. En el dialog, click en **Cancelar**
3. Verificar que no se eliminó

#### ✅ Resultado esperado:
```
✓ Dialog se cierra
✓ No hay recarga de página
✓ El suplemento sigue en la lista
✓ No se modificó en base de datos
```

---

### 5️⃣ Probar VALIDACIONES

**Objetivo:** Verificar que el backend valida correctamente.

#### Caso 1: Editar suplemento inexistente
```bash
# Desde Postman o curl:
curl -X PUT http://localhost:5000/api/suplementos/9999 \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test"}'
```

#### ✅ Resultado esperado:
```json
{
  "success": false,
  "message": "Suplemento no encontrado"
}
```
**Status Code:** 404

---

#### Caso 2: Eliminar suplemento inexistente
```bash
curl -X DELETE http://localhost:5000/api/suplementos/9999
```

#### ✅ Resultado esperado:
```json
{
  "success": false,
  "message": "Suplemento no encontrado"
}
```
**Status Code:** 404

---

### 6️⃣ Probar DIFERENTES VISTAS

**Objetivo:** Verificar que funciona tanto en Grid como en Lista.

#### Vista Grid:
1. Asegurar que está en vista Grid (ícono de cuadrícula seleccionado)
2. Hacer hover sobre tarjeta
3. Los botones deben aparecer en **esquina inferior derecha**
4. Con efecto **fade-in**

#### Vista Lista:
1. Cambiar a vista Lista (ícono de líneas)
2. Los botones deben estar **siempre visibles**
3. A la **derecha** de cada tarjeta
4. Junto al botón de favoritos

---

### 7️⃣ Probar MÚLTIPLES EDICIONES

**Objetivo:** Editar el mismo suplemento varias veces.

#### Pasos:
1. Editar suplemento "Creatina" (ID: 9)
   - Cambiar `popularidad_uso` a: 100
   - Guardar
2. Volver a editar el mismo suplemento
   - Verificar que muestra popularidad: 100
   - Cambiar a: 95
   - Guardar
3. Repetir una vez más
   - Debe mostrar: 95
   - Cambiar a: 90

#### ✅ Resultado esperado:
```
✓ Cada edición muestra los datos más recientes
✓ Los cambios persisten entre ediciones
✓ No hay pérdida de datos
✓ La recarga trae la información actualizada
```

---

## 🐛 Checklist de Problemas Comunes

### ❌ Los botones no aparecen

**Solución 1:** Verificar permisos
```javascript
// En consola del navegador:
localStorage.getItem('usuario')
// Debe tener rol 1 (admin) o 2 (nutricionista)
```

**Solución 2:** Verificar props
```javascript
// En TarjetaSuplemento.jsx debe recibir:
onEditar={handleEditar}
onEliminar={handleEliminar}
```

---

### ❌ Modal no carga datos al editar

**Causa:** No se está obteniendo el detalle completo

**Solución:** Verificar que `handleEditarSuplemento` llame a:
```javascript
const detalle = await suplementosService.obtenerDetalle(suplemento.id);
```

**Verificar en Network:**
- Debe haber llamada a: `GET /api/suplementos/3`
- Debe retornar JSON completo con todas las relaciones

---

### ❌ Error al guardar cambios

**Verificar:**
1. Backend está corriendo
2. Endpoint existe: `PUT /api/suplementos/:id`
3. Datos enviados son válidos
4. Ver logs del backend para error específico

**Network Tab:**
- Status: 200 OK
- Response: `{ "success": true, ... }`

---

### ❌ No se recarga después de editar/eliminar

**Solución:** Agregar en handlers:
```javascript
window.location.reload();
```

O mejor, actualizar el state:
```javascript
// Recargar lista de suplementos
buscar(busquedaLocal);
```

---

## 📊 Matriz de Pruebas

| Caso | Rol | Vista | Acción | Resultado Esperado | Estado |
|------|-----|-------|--------|-------------------|--------|
| 1 | Admin | Grid | Editar | Modal se abre con datos | ⬜ |
| 2 | Admin | Grid | Guardar edición | Cambios se aplican | ⬜ |
| 3 | Admin | Grid | Eliminar | Dialog aparece | ⬜ |
| 4 | Admin | Grid | Confirmar eliminación | Suplemento desaparece | ⬜ |
| 5 | Admin | Lista | Editar | Modal se abre con datos | ⬜ |
| 6 | Admin | Lista | Eliminar | Dialog aparece | ⬜ |
| 7 | Nutricionista | Grid | Editar | Modal se abre | ⬜ |
| 8 | Nutricionista | Grid | Eliminar | Dialog aparece | ⬜ |
| 9 | Secretario | Grid | Ver botones | NO aparecen | ⬜ |
| 10 | Paciente | Grid | Ver botones | NO aparecen | ⬜ |

---

## 🎯 Criterios de Éxito

✅ **La funcionalidad está completa si:**

- [ ] Los botones aparecen solo para Admin y Nutricionista
- [ ] El botón Editar abre el modal con datos precargados
- [ ] Los cambios se guardan correctamente en BD
- [ ] El botón Eliminar abre dialog de confirmación
- [ ] Soft delete funciona (activo = 0)
- [ ] Funciona en vista Grid y Lista
- [ ] Los tooltips son informativos
- [ ] No hay errores en consola
- [ ] Los logs del backend son claros
- [ ] La UX es fluida (sin delays innecesarios)

---

## 📝 Notas Finales

- **Soft Delete**: Los datos NO se pierden, solo se ocultan
- **Permisos**: Solo roles con privilegios pueden editar
- **Recarga**: Después de cada acción exitosa, la página se recarga
- **Validación**: El backend verifica existencia antes de modificar

---

**¿Todo funciona?** ✅ 
**¡Excelente! La funcionalidad está lista para producción.**

**¿Hay problemas?** ❌
**Revisar la sección de troubleshooting o contactar al equipo de desarrollo.**
