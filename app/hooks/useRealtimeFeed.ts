"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabaseTyped } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Article {
  id: string
  user_id: string
  nft_mint: string
  title: string
  description: string | null
  brand: string
  year: number
  condition: string
  image_url: string
  ipfs_hash: string | null
  created_at: string
  updated_at: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  likes_count: number
}

export function useRealtimeFeed() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const fetchInitialArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseTyped
        .from('articles_with_likes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        throw error
      }

      setArticles(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error obteniendo artículos iniciales:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Cargar artículos iniciales
    fetchInitialArticles()

    // Configurar suscripción en tiempo real
    const realtimeChannel = supabaseTyped
      .channel('articles_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'articles'
        },
        async (payload) => {
          console.log('🆕 Nuevo artículo creado:', payload)
          
          // Obtener el artículo completo con datos del usuario
          const { data: newArticle, error } = await supabaseTyped
            .from('articles_with_likes')
            .select('*')
            .eq('id', payload.new.id)
            .single()

          if (!error && newArticle) {
            setArticles(prev => [newArticle, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'articles'
        },
        async (payload) => {
          console.log('🔄 Artículo actualizado:', payload)
          
          // Obtener el artículo actualizado
          const { data: updatedArticle, error } = await supabaseTyped
            .from('articles_with_likes')
            .select('*')
            .eq('id', payload.new.id)
            .single()

          if (!error && updatedArticle) {
            setArticles(prev => 
              prev.map(article => 
                article.id === updatedArticle.id ? updatedArticle : article
              )
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'articles'
        },
        (payload) => {
          console.log('🗑️ Artículo eliminado:', payload)
          setArticles(prev => prev.filter(article => article.id !== payload.old.id))
        }
      )
      .subscribe()

    setChannel(realtimeChannel)

    // Cleanup
    return () => {
      if (realtimeChannel) {
        supabaseTyped.removeChannel(realtimeChannel)
      }
    }
  }, [fetchInitialArticles])

  const addArticle = useCallback((article: Article) => {
    setArticles(prev => [article, ...prev])
  }, [])

  const updateArticle = useCallback((articleId: string, updates: Partial<Article>) => {
    setArticles(prev => 
      prev.map(article => 
        article.id === articleId ? { ...article, ...updates } : article
      )
    )
  }, [])

  const removeArticle = useCallback((articleId: string) => {
    setArticles(prev => prev.filter(article => article.id !== articleId))
  }, [])

  return {
    articles,
    loading,
    error,
    addArticle,
    updateArticle,
    removeArticle,
    refetch: fetchInitialArticles
  }
}

// Hook para likes en tiempo real
export function useRealtimeLikes(articleId: string) {
  const [likesCount, setLikesCount] = useState(0)
  const [userLiked, setUserLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const fetchLikesData = useCallback(async () => {
    setLoading(true)

    try {
      // Obtener conteo de likes
      const { count } = await supabaseTyped
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId)

      setLikesCount(count || 0)

      // Verificar si el usuario actual le dio like (si está autenticado)
      // Esto se puede implementar cuando tengamos el contexto de autenticación
      
    } catch (error) {
      console.error('Error obteniendo likes:', error)
    } finally {
      setLoading(false)
    }
  }, [articleId])

  useEffect(() => {
    // Cargar datos iniciales
    fetchLikesData()

    // Configurar suscripción en tiempo real para likes
    const likesChannel = supabaseTyped
      .channel(`likes_${articleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `article_id=eq.${articleId}`
        },
        () => {
          console.log('❤️ Nuevo like:', articleId)
          setLikesCount(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'likes',
          filter: `article_id=eq.${articleId}`
        },
        () => {
          console.log('💔 Like eliminado:', articleId)
          setLikesCount(prev => Math.max(0, prev - 1))
        }
      )
      .subscribe()

    setChannel(likesChannel)

    // Cleanup
    return () => {
      if (likesChannel) {
        supabaseTyped.removeChannel(likesChannel)
      }
    }
  }, [articleId, fetchLikesData])

  return {
    likesCount,
    userLiked,
    loading,
    setUserLiked
  }
}

// Hook para notificaciones en tiempo real
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    // Configurar suscripción para notificaciones
    const notificationsChannel = supabaseTyped
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes'
        },
        (payload) => {
          console.log('🔔 Nueva notificación de like:', payload)
          // Aquí puedes agregar lógica para mostrar notificaciones
          // Por ejemplo, mostrar un toast o actualizar un contador
        }
      )
      .subscribe()

    setChannel(notificationsChannel)

    // Cleanup
    return () => {
      if (notificationsChannel) {
        supabaseTyped.removeChannel(notificationsChannel)
      }
    }
  }, [])

  return {
    notifications,
    addNotification: (notification: any) => {
      setNotifications(prev => [notification, ...prev])
    },
    removeNotification: (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }
  }
}
