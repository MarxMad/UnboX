# 🚀 Hooks de Supabase para UnboX

## 📋 Resumen
Esta documentación explica cómo usar los hooks creados para integrar Supabase con el sistema existente de UnboX.

## 🎯 Hooks Disponibles

### 1. **Sistema de Likes** (`useLikes.ts`)

#### `useLikeArticle()`
```typescript
import { useLikeArticle } from '@/app/hooks/useLikes'

const { likeArticle, loading, error } = useLikeArticle()

const handleLike = async () => {
  const result = await likeArticle(walletAddress, articleId)
  if (result.success) {
    console.log('Like dado exitosamente, total:', result.likesCount)
  }
}
```

#### `useUnlikeArticle()`
```typescript
import { useUnlikeArticle } from '@/app/hooks/useLikes'

const { unlikeArticle, loading, error } = useUnlikeArticle()

const handleUnlike = async () => {
  const result = await unlikeArticle(walletAddress, articleId)
  if (result.success) {
    console.log('Like eliminado, total:', result.likesCount)
  }
}
```

#### `useCheckUserLiked()`
```typescript
import { useCheckUserLiked } from '@/app/hooks/useLikes'

const { checkUserLiked, loading } = useCheckUserLiked()

const isLiked = await checkUserLiked(walletAddress, articleId)
```

### 2. **Gestión de Usuarios** (`useUserProfile.ts`)

#### `useUserProfile()`
```typescript
import { useUserProfile } from '@/app/hooks/useUserProfile'

const { getUserProfile, loading, error } = useUserProfile()

const profile = await getUserProfile(walletAddress)
```

#### `useUpdateProfile()`
```typescript
import { useUpdateProfile } from '@/app/hooks/useUserProfile'

const { updateProfile, loading, error } = useUpdateProfile()

const updatedProfile = await updateProfile(walletAddress, {
  username: 'nuevo_usuario',
  display_name: 'Nuevo Usuario',
  bio: 'Mi biografía'
})
```

#### `useUserPreferences()`
```typescript
import { useUserPreferences } from '@/app/hooks/useUserProfile'

const { getUserPreferences, updatePreference, loading, error } = useUserPreferences()

// Obtener preferencias
const preferences = await getUserPreferences(walletAddress)

// Actualizar preferencia específica
await updatePreference(walletAddress, 'theme_preference', 'dark')
```

### 3. **Autenticación Híbrida** (`useSupabaseAuth.ts`)

#### `useSupabaseAuth()`
```typescript
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth'

const { 
  user,           // Usuario de Supabase
  authUser,       // Usuario del contexto de auth
  userPreferences, // Preferencias del usuario
  loading,
  error,
  updateProfile,
  updatePreference,
  logout,
  walletAddress,
  isWalletConnected
} = useSupabaseAuth()

// El hook se sincroniza automáticamente con el wallet conectado
```

#### `useWalletAddress()`
```typescript
import { useWalletAddress } from '@/app/hooks/useSupabaseAuth'

const { walletAddress, isConnected, publicKey } = useWalletAddress()
```

### 4. **Tokenización con Supabase** (`useTokenizeWithSupabase.ts`)

#### `useTokenizeWithSupabase()`
```typescript
import { useTokenizeWithSupabase } from '@/app/hooks/useTokenizeWithSupabase'

const { tokenizeWithSupabase, loading, error } = useTokenizeWithSupabase()

const handleTokenize = async () => {
  const result = await tokenizeWithSupabase({
    name: 'Air Jordan 1',
    brand: 'Nike',
    model: 'Air Jordan 1',
    size: 'US 10',
    condition: 'new',
    year: 2024,
    rarity: 'common',
    image: imageFile,
    description: 'Descripción del artículo'
  })

  if (result.success) {
    console.log('NFT creado:', result.nftMint)
    console.log('Artículo guardado:', result.articleId)
  }
}
```

#### `useUserArticles()`
```typescript
import { useUserArticles } from '@/app/hooks/useTokenizeWithSupabase'

const { articles, loading, error, fetchUserArticles } = useUserArticles()

// Los artículos se cargan automáticamente cuando el usuario está autenticado
```

#### `useAllArticles()` y `usePopularArticles()`
```typescript
import { useAllArticles, usePopularArticles } from '@/app/hooks/useTokenizeWithSupabase'

// Todos los artículos
const { articles: allArticles, fetchAllArticles } = useAllArticles()

// Artículos populares
const { articles: popularArticles, fetchPopularArticles } = usePopularArticles()
```

### 5. **Feed en Tiempo Real** (`useRealtimeFeed.ts`)

#### `useRealtimeFeed()`
```typescript
import { useRealtimeFeed } from '@/app/hooks/useRealtimeFeed'

const { 
  articles, 
  loading, 
  error, 
  addArticle, 
  updateArticle, 
  removeArticle,
  refetch 
} = useRealtimeFeed()

// El feed se actualiza automáticamente cuando hay nuevos artículos
```

#### `useRealtimeLikes()`
```typescript
import { useRealtimeLikes } from '@/app/hooks/useRealtimeFeed'

const { likesCount, userLiked, loading, setUserLiked } = useRealtimeLikes(articleId)

// Los likes se actualizan en tiempo real
```

## 🔧 **Ejemplos de Uso Completo**

### **Componente de Artículo con Likes**
```typescript
import React, { useState, useEffect } from 'react'
import { useLikeArticle, useUnlikeArticle, useCheckUserLiked } from '@/app/hooks/useLikes'
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth'

export function ArticleCard({ article }) {
  const { walletAddress } = useSupabaseAuth()
  const { likeArticle } = useLikeArticle()
  const { unlikeArticle } = useUnlikeArticle()
  const { checkUserLiked } = useCheckUserLiked()
  
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    if (walletAddress) {
      checkUserLiked(walletAddress, article.id).then(setIsLiked)
    }
  }, [walletAddress, article.id])

  const handleLike = async () => {
    if (!walletAddress) return

    if (isLiked) {
      const result = await unlikeArticle(walletAddress, article.id)
      if (result.success) {
        setIsLiked(false)
        setLikesCount(result.likesCount || 0)
      }
    } else {
      const result = await likeArticle(walletAddress, article.id)
      if (result.success) {
        setIsLiked(true)
        setLikesCount(result.likesCount || 0)
      }
    }
  }

  return (
    <div className="article-card">
      <h3>{article.title}</h3>
      <p>{article.brand} - {article.year}</p>
      <button onClick={handleLike}>
        {isLiked ? '❤️' : '🤍'} {likesCount}
      </button>
    </div>
  )
}
```

### **Página de Tokenización**
```typescript
import React from 'react'
import { useTokenizeWithSupabase } from '@/app/hooks/useTokenizeWithSupabase'

export function TokenizePage() {
  const { tokenizeWithSupabase, loading, error } = useTokenizeWithSupabase()

  const handleSubmit = async (formData) => {
    const result = await tokenizeWithSupabase({
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      size: formData.size,
      condition: formData.condition,
      year: formData.year,
      rarity: formData.rarity,
      image: formData.image
    })

    if (result.success) {
      alert('¡Artículo tokenizado exitosamente!')
    } else {
      alert('Error: ' + result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario de tokenización */}
      <button type="submit" disabled={loading}>
        {loading ? 'Tokenizando...' : 'Tokenizar'}
      </button>
    </form>
  )
}
```

### **Feed en Tiempo Real**
```typescript
import React from 'react'
import { useRealtimeFeed } from '@/app/hooks/useRealtimeFeed'

export function FeedPage() {
  const { articles, loading, error } = useRealtimeFeed()

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="feed">
      <h2>Feed en Tiempo Real</h2>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
```

## 🚀 **Próximos Pasos**

1. **Integrar hooks en componentes existentes**
2. **Implementar notificaciones push**
3. **Añadir sistema de comentarios**
4. **Implementar búsqueda y filtros**
5. **Añadir sistema de seguimiento entre usuarios**

---

**✅ Estado**: Hooks implementados y listos para usar  
**📅 Fecha**: $(date)  
**👨‍💻 Proyecto**: UnboX - Streetwear Tokenizer Platform
