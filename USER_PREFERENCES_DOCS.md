# 📊 Tabla `user_preferences` - UnboX

## 🎯 **Propósito**
La tabla `user_preferences` almacena todas las configuraciones y preferencias personalizadas de cada usuario en UnboX, permitiendo una experiencia personalizada y configurable.

## 🏗️ **Estructura de la Tabla**

### **Campos Principales:**

#### **🔔 Notificaciones**
- `email_notifications` - Notificaciones por email (default: true)
- `push_notifications` - Notificaciones push (default: true)
- `like_notifications` - Notificar cuando alguien le da like (default: true)
- `follow_notifications` - Notificar cuando alguien te sigue (default: true)

#### **🔒 Privacidad**
- `profile_visibility` - Visibilidad del perfil: 'public', 'friends', 'private' (default: 'public')
- `show_collection` - Mostrar colección públicamente (default: true)
- `show_likes` - Mostrar likes públicamente (default: true)

#### **🎨 Personalización de Feed**
- `preferred_brands` - Array de marcas favoritas (default: [])
- `preferred_categories` - Array de categorías favoritas (default: [])
- `feed_sort_order` - Orden del feed: 'trending', 'newest', 'popular', 'following' (default: 'trending')

#### **⚙️ Configuraciones de Tokenización**
- `auto_ipfs_upload` - Subida automática a IPFS (default: true)
- `default_condition` - Condición por defecto: 'new', 'like_new', 'good', 'fair', 'poor' (default: 'good')

#### **🎨 UI/UX**
- `theme_preference` - Tema: 'light', 'dark', 'system' (default: 'system')
- `language_preference` - Idioma: 'es', 'en' (default: 'es')
- `currency_preference` - Moneda: 'USD', 'EUR', 'SOL' (default: 'USD')

#### **💬 Marketplace (Futuro)**
- `allow_direct_messages` - Permitir mensajes directos (default: true)
- `show_price_history` - Mostrar historial de precios (default: true)

## 🚀 **Funciones Disponibles**

### **1. `get_or_create_user_preferences(user_wallet)`**
```sql
SELECT * FROM get_or_create_user_preferences('wallet_address_aqui');
```
- Obtiene las preferencias del usuario
- Si no existen, las crea automáticamente
- Si el usuario no existe, lo crea también

### **2. `update_user_preference(user_wallet, preference_key, preference_value)`**
```sql
SELECT update_user_preference('wallet_address', 'theme_preference', 'dark');
```
- Actualiza una preferencia específica
- Retorna `true` si fue exitoso, `false` si no

## 🔒 **Seguridad (RLS)**

### **Políticas Implementadas:**
- ✅ **Lectura**: Solo el usuario puede ver sus propias preferencias
- ✅ **Escritura**: Solo el usuario puede modificar sus propias preferencias
- ✅ **Inserción**: Solo el usuario puede crear sus propias preferencias
- ✅ **Eliminación**: Solo el usuario puede eliminar sus propias preferencias

## 📝 **Ejemplos de Uso**

### **Obtener preferencias de usuario:**
```typescript
const { data: preferences } = await supabaseTyped
  .rpc('get_or_create_user_preferences', { 
    user_wallet: walletAddress 
  })
```

### **Actualizar tema:**
```typescript
const { data: success } = await supabaseTyped
  .rpc('update_user_preference', {
    user_wallet: walletAddress,
    preference_key: 'theme_preference',
    preference_value: 'dark'
  })
```

### **Actualizar marcas favoritas:**
```typescript
const { data: success } = await supabaseTyped
  .rpc('update_user_preference', {
    user_wallet: walletAddress,
    preference_key: 'preferred_brands',
    preference_value: '["Nike", "Supreme", "Bape"]'
  })
```

### **Consultar preferencias directamente:**
```typescript
const { data: preferences } = await supabaseTyped
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single()
```

## 🎯 **Casos de Uso en UnboX**

1. **Configuración de Feed Personalizado**
   - Filtrar por marcas favoritas
   - Ordenar por preferencia del usuario
   - Mostrar solo categorías de interés

2. **Experiencia de Tokenización**
   - Usar condición por defecto
   - Subida automática a IPFS
   - Configuración de privacidad

3. **Personalización de UI**
   - Tema claro/oscuro
   - Idioma de la interfaz
   - Moneda para precios

4. **Gestión de Notificaciones**
   - Control granular de notificaciones
   - Preferencias de privacidad
   - Configuración de visibilidad

## 🔧 **Índices Optimizados**
- `idx_user_preferences_user_id` - Búsqueda por usuario
- `idx_user_preferences_visibility` - Filtrado por visibilidad
- `idx_user_preferences_brands` - Búsqueda en marcas (GIN)
- `idx_user_preferences_categories` - Búsqueda en categorías (GIN)

---

**✅ Estado**: Implementación completa y funcional  
**📅 Fecha**: $(date)  
**👨‍💻 Proyecto**: UnboX - Streetwear Tokenizer Platform
