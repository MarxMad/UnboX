"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface LikeResult {
  success: boolean
  error?: string
  likesCount?: number
}

export function useLikeArticle() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const likeArticle = useCallback(async (
    walletAddress: string,
    articleId: string
  ): Promise<LikeResult> => {
    setLoading(true)
    setError(null)

    try {
      // 1. Configurar usuario actual para RLS
      await supabase.rpc('set_current_user_wallet', {
        wallet_address: walletAddress
      })

      // 2. Obtener o crear usuario
      const { data: userData, error: userError } = await supabase
        .rpc('get_or_create_user_preferences', {
          user_wallet: walletAddress
        })

      if (userError || !userData || userData.length === 0) {
        throw new Error('Error obteniendo usuario')
      }

      const userId = userData[0].user_id

      // 3. Verificar si ya le dio like
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('article_id', articleId)
        .maybeSingle()

      if (existingLike) {
        return {
          success: false,
          error: 'Ya le diste like a este artículo'
        }
      }

      // 4. Dar like
      const { error: likeError } = await supabase
        .from('likes')
        .insert({
          user_id: userId,
          article_id: articleId
        })

      if (likeError) {
        throw likeError
      }

      // 5. Obtener nuevo conteo de likes
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId)

      return {
        success: true,
        likesCount: likesCount || 0
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    likeArticle,
    loading,
    error
  }
}

export function useUnlikeArticle() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unlikeArticle = useCallback(async (
    walletAddress: string,
    articleId: string
  ): Promise<LikeResult> => {
    setLoading(true)
    setError(null)

    try {
      // 1. Configurar usuario actual para RLS
      await supabase.rpc('set_current_user_wallet', {
        wallet_address: walletAddress
      })

      // 2. Obtener usuario
      const { data: userData, error: userError } = await supabase
        .rpc('get_or_create_user_preferences', {
          user_wallet: walletAddress
        })

      if (userError || !userData || userData.length === 0) {
        throw new Error('Error obteniendo usuario')
      }

      const userId = userData[0].user_id

      // 3. Eliminar like
      const { error: unlikeError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId)

      if (unlikeError) {
        throw unlikeError
      }

      // 4. Obtener nuevo conteo de likes
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId)

      return {
        success: true,
        likesCount: likesCount || 0
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    unlikeArticle,
    loading,
    error
  }
}

export function useCheckUserLiked() {
  const [loading, setLoading] = useState(false)

  const checkUserLiked = useCallback(async (
    walletAddress: string,
    articleId: string
  ): Promise<boolean> => {
    setLoading(true)

    try {
      const { data } = await supabase
        .rpc('user_liked_article', {
          user_wallet: walletAddress,
          article_uuid: articleId
        })

      return data || false
    } catch (error) {
      console.error('Error verificando like:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    checkUserLiked,
    loading
  }
}

export function useArticleLikes() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getArticleLikes = useCallback(async (articleId: string): Promise<number> => {
    setLoading(true)
    setError(null)

    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId)

      if (error) {
        throw error
      }

      return count || 0
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return 0
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getArticleLikes,
    loading,
    error
  }
}
