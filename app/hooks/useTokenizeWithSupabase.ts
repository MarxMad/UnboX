"use client"

import { useState, useCallback } from 'react'
import { useTokenizeStreetwear } from './useTokenizeStreetwear'
import { useSupabaseAuth } from './useSupabaseAuth'
import { supabase } from '@/lib/supabase'

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
      console.log('🚀 Iniciando tokenización híbrida (Blockchain + Supabase)...')

      // ESTRATEGIA HÍBRIDA:
      // 1. Blockchain: Solo datos esenciales (mint, datos básicos)
      // 2. Supabase: Datos completos, metadata, imágenes, etc.

      // 1. Tokenizar NFT en Solana (solo datos esenciales)
      console.log('⛓️ 1. Tokenizando NFT en Solana (datos esenciales)...')
      
      let nftResult: { signature: string; mint: string; assetPda: string }
      
      try {
        nftResult = await tokenizeNFT({
          name: params.name,
          brand: params.brand,
          model: params.model,
          size: params.size,
          condition: params.condition,
          year: params.year,
          rarity: params.rarity,
          image: params.image
        })
      } catch (error) {
        throw new Error(`Error tokenizando NFT: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }

      console.log('✅ NFT tokenizado en Solana:', nftResult.mint)

      // 2. Preparar datos completos para Supabase
      console.log('💾 2. Preparando datos completos para Supabase...')
      
      // Obtener imagen como base64 para Supabase
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(params.image)
      })

      // Crear metadata completa para Supabase (datos completos sin límites)
      const fullMetadata = {
        // Datos originales completos (sin truncar)
        name: params.name, // Nombre completo
        brand: params.brand, // Marca completa
        model: params.model, // Modelo completo
        size: params.size, // Talla completa
        condition: params.condition, // Condición completa
        year: params.year,
        rarity: params.rarity, // Rareza completa
        description: params.description || `${params.brand} ${params.model} - ${params.condition} (${params.year})`, // Descripción completa
        
        // Datos de imagen
        image: imageBase64,
        image_file_name: params.image.name,
        image_file_size: params.image.size,
        image_file_type: params.image.type,
        
        // Datos de blockchain (relación)
        blockchain_data: {
          mint: nftResult.mint,
          signature: nftResult.signature,
          asset_pda: nftResult.assetPda,
          blockchain_version: 'solana',
          created_at: new Date().toISOString(),
          // Nota: Los datos en blockchain están truncados para mantener transacciones pequeñas
          blockchain_name: params.name.substring(0, 8), // Solo 8 caracteres en blockchain
          blockchain_brand: params.brand.substring(0, 6), // Solo 6 caracteres en blockchain
          blockchain_model: (params.model || params.name).substring(0, 6), // Solo 6 caracteres en blockchain
          blockchain_size: params.size.substring(0, 4), // Solo 4 caracteres en blockchain
          blockchain_condition: params.condition.substring(0, 4) // Solo 4 caracteres en blockchain
        },
        
        // Metadatos adicionales
        metadata: {
          original_params: params,
          tokenization_date: new Date().toISOString(),
          platform: 'unbox',
          version: '1.0',
          architecture: 'hybrid', // Indica arquitectura híbrida
          data_completeness: 'full', // Datos completos en Supabase
          blockchain_optimization: 'minimal' // Datos mínimos en blockchain
        }
      }

      // 3. Guardar datos completos en Supabase
      console.log('💾 3. Guardando datos completos en Supabase...')
      
      // Los valores del frontend ya coinciden con la DB, solo hacer trim por seguridad
      const normalizedCondition = params.condition.trim()
      console.log('🔍 Condición seleccionada:', `"${normalizedCondition}"`)
      
      // Configurar usuario actual para RLS
      await supabase.rpc('set_current_user_wallet', {
        wallet_address: walletAddress
      })

      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .insert({
          user_id: user.id,
          nft_mint: nftResult.mint, // Clave de relación con blockchain
          title: params.name, // Nombre completo (sin límite)
          description: fullMetadata.description, // Descripción completa (sin límite)
          brand: params.brand, // Marca completa (sin límite)
          model: params.model, // Modelo completo (sin límite)
          size: params.size, // Talla completa (sin límite)
          condition: normalizedCondition, // Condición completa (sin límite)
          year: params.year,
          rarity: params.rarity, // Rareza completa (sin límite)
          image_url: imageBase64, // Imagen completa en base64
          ipfs_hash: '', // URI del metadata en IPFS (se puede agregar después)
          metadata: fullMetadata, // Metadata completa con datos completos
          blockchain_signature: nftResult.signature,
          asset_pda: nftResult.assetPda,
          // Campos adicionales para la estrategia híbrida
          blockchain_mint: nftResult.mint,
          data_source: 'hybrid', // Indica que viene de blockchain + DB
          sync_status: 'synced' // Estado de sincronización
        })
        .select()
        .single()

      if (articleError) {
        console.error('Error guardando artículo:', articleError)
        // No lanzar error aquí, el NFT ya fue creado exitosamente
        return {
          success: true,
          nftMint: nftResult.mint,
          error: 'NFT created successfully, but there was an error saving to the database'
        }
      }

      console.log('✅ Datos completos guardados en Supabase:', articleData.id)
      console.log('🔗 Relación establecida: Blockchain mint <-> Supabase article')

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
      await supabase.rpc('set_current_user_wallet', {
        wallet_address: walletAddress
      })

      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
