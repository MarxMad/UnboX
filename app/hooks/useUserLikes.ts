"use client"

import { useCallback, useEffect, useState } from 'react'
import { supabaseTyped } from '@/lib/supabase'

interface LikedArticle {
  id: string
  nft_mint: string
  title: string
  brand: string
  year: number
  condition: string
  image_url: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  likes_count: number
}

export function useUserLikes(walletAddress: string | undefined) {
  const [likedArticles, setLikedArticles] = useState<LikedArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLiked = useCallback(async () => {
    if (!walletAddress) return
    setLoading(true)
    setError(null)

    try {
      // Obtener user_id por wallet
      const { data: userRows, error: userErr } = await supabaseTyped
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .limit(1)
        .maybeSingle()

      if (userErr) throw userErr
      const userId = userRows?.id
      if (!userId) {
        setLikedArticles([])
        return
      }

      // Obtener artículos con like del usuario
      const { data, error } = await supabaseTyped
        .from('likes')
        .select(`
          article:articles!inner (
            id,
            nft_mint,
            title,
            brand,
            year,
            condition,
            image_url,
            users:users!articles_user_id_fkey (username, display_name, avatar_url),
            likes_count:likes(count)
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      // Normalizar resultados
      const normalized: LikedArticle[] = (data || []).map((row: any) => {
        const a = row.article
        return {
          id: a.id,
          nft_mint: a.nft_mint,
          title: a.title,
          brand: a.brand,
          year: a.year,
          condition: a.condition,
          image_url: a.image_url,
          username: a.users?.username ?? null,
          display_name: a.users?.display_name ?? null,
          avatar_url: a.users?.avatar_url ?? null,
          likes_count: Array.isArray(a.likes_count) ? a.likes_count.length : (a.likes_count || 0)
        }
      })

      setLikedArticles(normalized)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error obteniendo likes del usuario'
      setError(msg)
      setLikedArticles([])
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchLiked()
  }, [fetchLiked])

  return { likedArticles, loading, error, refetch: fetchLiked }
}

export function useUserArticles(walletAddress: string | undefined) {
  const [articles, setArticles] = useState<LikedArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = useCallback(async () => {
    if (!walletAddress) return
    setLoading(true)
    setError(null)

    try {
      // Obtener user_id por wallet
      const { data: userRows, error: userErr } = await supabaseTyped
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .limit(1)
        .maybeSingle()

      if (userErr) throw userErr
      const userId = userRows?.id
      if (!userId) {
        setArticles([])
        return
      }

      // Traer artículos del usuario con conteo de likes
      const { data, error } = await supabaseTyped
        .from('articles_with_likes')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      const normalized: LikedArticle[] = (data || []).map((a: any) => ({
        id: a.id,
        nft_mint: a.nft_mint,
        title: a.title,
        brand: a.brand,
        year: a.year,
        condition: a.condition,
        image_url: a.image_url,
        username: a.username ?? null,
        display_name: a.display_name ?? null,
        avatar_url: a.avatar_url ?? null,
        likes_count: Number(a.likes_count) || 0
      }))

      setArticles(normalized)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error obteniendo artículos del usuario'
      setError(msg)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return { articles, loading, error, refetch: fetchArticles }
}


