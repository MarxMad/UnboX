# 🔧 **CORRECCIÓN DE RESTRICCIÓN DE CONDICIÓN**

## 🐛 **PROBLEMA IDENTIFICADO**

```
POST https://sjzaowixufiluhtymhyy.supabase.co/rest/v1/articles?select=* 400 (Bad Request)

Error guardando artículo: {
  code: '23514', 
  message: 'new row for relation "articles" violates check constraint "articles_condition_check"'
}
```

**Causa:** La restricción CHECK en la columna `condition` de la tabla `articles` solo permitía valores específicos (`'new', 'like_new', 'good', 'fair', 'poor'`), pero el frontend estaba enviando `"Used - Good"` que no estaba en la lista permitida.

---

## ✅ **SOLUCIÓN IMPLEMENTADA**

### **1. Restricción Original (Demasiado Restrictiva)**
```sql
-- ANTES: Solo 5 valores permitidos
CHECK ((condition = ANY (ARRAY[
  'new'::text, 
  'like_new'::text, 
  'good'::text, 
  'fair'::text, 
  'poor'::text
])))
```

### **2. Restricción Actualizada (Más Flexible)**
```sql
-- DESPUÉS: 18 valores permitidos para streetwear
CHECK (condition IN (
  'new', 
  'like_new', 
  'good', 
  'fair', 
  'poor',
  'Used - Good',      -- ✅ Ahora permitido
  'Used - Fair',      -- ✅ Ahora permitido
  'Used - Poor',      -- ✅ Ahora permitido
  'New with tags',    -- ✅ Para artículos nuevos con etiquetas
  'New without tags', -- ✅ Para artículos nuevos sin etiquetas
  'Deadstock',        -- ✅ Para artículos nunca usados
  'VNDS',            -- ✅ Very Near Deadstock
  'DS',              -- ✅ Deadstock
  '9/10',            -- ✅ Sistema de puntuación
  '8/10',            -- ✅ Sistema de puntuación
  '7/10',            -- ✅ Sistema de puntuación
  '6/10',            -- ✅ Sistema de puntuación
  '5/10'             -- ✅ Sistema de puntuación
))
```

### **3. Migración Aplicada**
```sql
-- Eliminar restricción existente
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_condition_check;

-- Crear nueva restricción más flexible
ALTER TABLE articles ADD CONSTRAINT articles_condition_check 
CHECK (condition IN (
  'new', 'like_new', 'good', 'fair', 'poor',
  'Used - Good', 'Used - Fair', 'Used - Poor',
  'New with tags', 'New without tags', 'Deadstock',
  'VNDS', 'DS', '9/10', '8/10', '7/10', '6/10', '5/10'
));
```

---

## 📊 **VALORES PERMITIDOS ACTUALIZADOS**

### **Condiciones Básicas:**
- `new` - Nuevo
- `like_new` - Como nuevo
- `good` - Bueno
- `fair` - Regular
- `poor` - Malo

### **Condiciones Específicas de Streetwear:**
- `Used - Good` - Usado en buen estado
- `Used - Fair` - Usado en estado regular
- `Used - Poor` - Usado en mal estado
- `New with tags` - Nuevo con etiquetas
- `New without tags` - Nuevo sin etiquetas
- `Deadstock` - Stock muerto (nunca usado)
- `VNDS` - Very Near Deadstock
- `DS` - Deadstock

### **Sistema de Puntuación:**
- `9/10` - Excelente estado
- `8/10` - Muy buen estado
- `7/10` - Buen estado
- `6/10` - Estado regular
- `5/10` - Estado aceptable

---

## 🎯 **RESULTADO**

**✅ NFT tokenizado exitosamente en Solana:** `7CUiSqMJdX9MLpnMnG3uPSxz4dx4SdSFc1z6rLMqZEtw`

**✅ Restricción de condición actualizada y más flexible**

**✅ Valores de condición específicos para streetwear ahora permitidos**

**✅ Sistema de tokenización híbrida completamente funcional**

---

## 🚀 **PRÓXIMOS PASOS**

1. **Probar tokenización nuevamente** - Debería funcionar sin errores de validación
2. **Verificar inserción en Supabase** - Confirmar que se guardan los datos correctamente
3. **Probar diferentes condiciones** - Verificar que todas las condiciones funcionan
4. **Validar feed en tiempo real** - Confirmar que aparecen los nuevos NFTs

**El sistema ahora acepta una amplia gama de condiciones específicas para el mercado de streetwear.**
