"use client"

import { useState, useCallback } from 'react'
import { useTokenizeStreetwear } from './useTokenizeStreetwear'
import { useSupabaseAuth } from './useSupabaseAuth'
import { supabaseTyped } from '@/lib/supabase'

interface TokenizeWithSupabaseParams {
  name: string
  brand: string
  model: string
  size: string
  condition: string
  year: number
  rarity: string
  image: File
  description?: string
}

interface TokenizeResult {
  success: boolean
  nftMint?: string
  articleId?: string
  error?: string
}

export function useTokenizeWithSupabase() {
  const { tokenize: tokenizeNFT, loading: nftLoading, error: nftError } = useTokenizeStreetwear()
  const { user, walletAddress } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tokenizeWithSupabase = useCallback(async (
    params: TokenizeWithSupabaseParams
  ): Promise<TokenizeResult> => {
    if (!user || !walletAddress) {
      return {
        success: false,
        error: 'Usuario no autenticado o wallet no conectado'
      }
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🚀 Iniciando tokenización con Supabase...')

      // 1. Tokenizar NFT en Solana
      console.log('📸 1. Tokenizando NFT en Solana...')
      const nftResult = await tokenizeNFT({
        name: params.name,
        brand: params.brand,
        model: params.model,
        size: params.size,
        condition: params.condition,
        year: params.year,
        rarity: params.rarity,
        image: params.image
      })

      if (!nftResult.success || !nftResult.mint) {
        throw new Error(nftResult.error || 'Error tokenizando NFT')
      }

      console.log('✅ NFT tokenizado:', nftResult.mint)

      // 2. Guardar artículo en Supabase
      console.log('💾 2. Guardando artículo en Supabase...')
      
      // Configurar usuario actual para RLS
      await supabaseTyped.rpc('set_current_user_wallet', {
        wallet_address: walletAddress
      })

      const { data: articleData, error: articleError } = await supabaseTyped
        .from('articles')
        .insert({
          user_id: user.id,
          nft_mint: nftResult.mint,
          title: params.name,
          description: params.description || `${params.brand} ${params.model} - ${params.condition} (${params.year})`,
          brand: params.brand,
          year: params.year,
          condition: params.condition,
          image_url: nftResult.imageUri || '', // URL de la imagen subida
          ipfs_hash: nftResult.metadataUri || '' // URI del metadata en IPFS
        })
        .select()
        .single()

      if (articleError) {
        console.error('Error guardando artículo:', articleError)
        // No lanzar error aquí, el NFT ya fue creado exitosamente
        return {
          success: true,
          nftMint: nftResult.mint,
          error: 'NFT creado exitosamente, pero hubo un error guardando en la base de datos'
        }
      }

      console.log('✅ Artículo guardado:', articleData.id)

      return {
        success: true,
        nftMint: nftResult.mint,
        articleId: articleData.id
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error en tokenización:', err)
      setError(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [tokenizeNFT, user, walletAddress])

  return {
    tokenizeWithSupabase,
    loading: loading || nftLoading,
    error: error || nftError
  }
}

// Hook para obtener artículos del usuario actual
export function useUserArticles() {
  const { user, walletAddress } = useSupabaseAuth()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserArticles = useCallback(async () => {
    if (!user || !walletAddress) {
      setArticles([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Configurar usuario actual para RLS
      await supabaseTyped.rpc('set_current_user_wallet', {
        wallet_address: walletAddress
      })

      const { data, error } = await supabaseTyped
        .from('articles')
        .select(`
          *,
          users!inner(wallet_address)
        `)
        .eq('users.wallet_address', walletAddress)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setArticles(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error obteniendo artículos:', err)
    } finally {
      setLoading(false)
    }
  }, [user, walletAddress])

  return {
    articles,
    loading,
    error,
    fetchUserArticles,
    refetch: fetchUserArticles
  }
}

// Hook para obtener todos los artículos (feed)
export function useAllArticles() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseTyped
        .from('articles_with_likes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      setArticles(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error obteniendo artículos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    articles,
    loading,
    error,
    fetchAllArticles,
    refetch: fetchAllArticles
  }
}

// Hook para obtener artículos populares
export function usePopularArticles() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPopularArticles = useCallback(async (limit: number = 10) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseTyped
        .rpc('get_popular_articles', {
          limit_count: limit
        })

      if (error) {
        throw error
      }

      setArticles(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error obteniendo artículos populares:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    articles,
    loading,
    error,
    fetchPopularArticles,
    refetch: fetchPopularArticles
  }
}
