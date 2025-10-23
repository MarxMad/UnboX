"use client"

import { useState, useCallback } from 'react'
import { supabaseTyped } from '@/lib/supabase'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

interface SyncResult {
  success: boolean
  error?: string
  syncedCount?: number
}

export function useBlockchainSync() {
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const syncArticleWithBlockchain = useCallback(async (
    articleId: string,
    mintAddress: string
  ): Promise<SyncResult> => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Sincronizando artículo con blockchain...', { articleId, mintAddress })

      // 1. Verificar que el NFT existe en blockchain
      const accountInfo = await connection.getAccountInfo(new PublicKey(mintAddress))
      if (!accountInfo) {
        throw new Error('NFT no encontrado en blockchain')
      }

      // 2. Obtener datos del artículo desde Supabase
      const { data: article, error: articleError } = await supabaseTyped
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()

      if (articleError || !article) {
        throw new Error('Artículo no encontrado en Supabase')
      }

      // 3. Actualizar estado de sincronización
      const { error: updateError } = await supabaseTyped
        .from('articles')
        .update({
          sync_status: 'synced',
          blockchain_verified: true,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', articleId)

      if (updateError) {
        throw new Error(`Error actualizando sincronización: ${updateError.message}`)
      }

      console.log('✅ Artículo sincronizado exitosamente')

      return {
        success: true,
        syncedCount: 1
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error sincronizando:', err)
      setError(errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [connection])

  const syncAllUserArticles = useCallback(async (userId: string): Promise<SyncResult> => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Sincronizando todos los artículos del usuario...', userId)

      // 1. Obtener todos los artículos del usuario
      const { data: articles, error: articlesError } = await supabaseTyped
        .from('articles')
        .select('id, nft_mint, sync_status')
        .eq('user_id', userId)
        .eq('data_source', 'hybrid')

      if (articlesError) {
        throw new Error(`Error obteniendo artículos: ${articlesError.message}`)
      }

      if (!articles || articles.length === 0) {
        return {
          success: true,
          syncedCount: 0
        }
      }

      // 2. Sincronizar cada artículo
      let syncedCount = 0
      const errors: string[] = []

      for (const article of articles) {
        try {
          const result = await syncArticleWithBlockchain(article.id, article.nft_mint)
          if (result.success) {
            syncedCount++
          } else {
            errors.push(`Artículo ${article.id}: ${result.error}`)
          }
        } catch (err) {
          errors.push(`Artículo ${article.id}: ${err instanceof Error ? err.message : 'Error desconocido'}`)
        }
      }

      console.log(`✅ Sincronización completada: ${syncedCount}/${articles.length} artículos`)

      return {
        success: syncedCount > 0,
        syncedCount,
        error: errors.length > 0 ? errors.join('; ') : undefined
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error sincronizando artículos:', err)
      setError(errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [syncArticleWithBlockchain])

  const verifyBlockchainData = useCallback(async (mintAddress: string): Promise<{
    exists: boolean
    owner?: string
    metadata?: any
  }> => {
    try {
      console.log('🔍 Verificando datos de blockchain...', mintAddress)

      // Verificar que el NFT existe
      const accountInfo = await connection.getAccountInfo(new PublicKey(mintAddress))
      if (!accountInfo) {
        return { exists: false }
      }

      // Aquí podrías agregar más verificaciones como:
      // - Obtener metadata del NFT
      // - Verificar owner
      // - Verificar que es un NFT válido

      return {
        exists: true,
        // owner: ownerAddress,
        // metadata: nftMetadata
      }

    } catch (err) {
      console.error('Error verificando blockchain:', err)
      return { exists: false }
    }
  }, [connection])

  return {
    syncArticleWithBlockchain,
    syncAllUserArticles,
    verifyBlockchainData,
    loading,
    error
  }
}
