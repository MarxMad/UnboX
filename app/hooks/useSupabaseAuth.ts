"use client"

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '@/lib/supabase'

interface SupabaseUser {
  id: string
  wallet_address: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  social_links: Record<string, string> | null
  created_at: string
  updated_at: string
}

interface SupabaseUserPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  like_notifications: boolean
  follow_notifications: boolean
  profile_visibility: 'public' | 'friends' | 'private'
  show_collection: boolean
  show_likes: boolean
  preferred_brands: string[]
  preferred_categories: string[]
  feed_sort_order: 'trending' | 'newest' | 'popular' | 'following'
  auto_ipfs_upload: boolean
  default_condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  theme_preference: 'light' | 'dark' | 'system'
  language_preference: 'es' | 'en'
  currency_preference: 'USD' | 'EUR' | 'SOL'
  allow_direct_messages: boolean
  show_price_history: boolean
  created_at: string
  updated_at: string
}

export function useSupabaseAuth() {
  const { user: authUser, login: authLogin, logout: authLogout } = useAuth()
  const { publicKey, connected } = useWallet()
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [userPreferences, setUserPreferences] = useState<SupabaseUserPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sincronizar usuario con Supabase cuando cambie el wallet
  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!connected || !publicKey) {
        setSupabaseUser(null)
        setUserPreferences(null)
        return
      }

      const walletAddress = publicKey.toString()
      setLoading(true)
      setError(null)

      try {
        // Obtener o crear usuario en Supabase
        const { data: userData, error: userError } = await supabase
          .rpc('get_or_create_user_preferences', {
            user_wallet: walletAddress
          })

        if (userError) {
          throw userError
        }

        if (userData && userData.length > 0) {
          const user = userData[0]
          setSupabaseUser({
            id: user.user_id,
            wallet_address: walletAddress,
            username: user.username,
            display_name: user.display_name,
            bio: user.bio,
            avatar_url: user.avatar_url,
            social_links: user.social_links,
            created_at: user.created_at,
            updated_at: user.updated_at
          })
          setUserPreferences(user)
        }

        // Actualizar contexto de autenticación con datos de Supabase
        if (authUser && authUser.wallet !== walletAddress) {
          await authLogin(
            `wallet@${walletAddress.slice(0, 8)}.sol`,
            "wallet",
            {
              wallet: walletAddress,
              publicKey: walletAddress,
              username: userData?.[0]?.username || `user_${walletAddress.slice(0, 8)}`,
              // evitar campos no tipados en el auth context
            }
          )
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error sincronizando usuario'
        setError(errorMessage)
        console.error('Error sincronizando usuario con Supabase:', err)
      } finally {
        setLoading(false)
      }
    }

    syncUserWithSupabase()
  }, [connected, publicKey, authUser, authLogin])

  const updateProfile = useCallback(async (updateData: {
    username?: string
    display_name?: string
    bio?: string
    avatar_url?: string
    social_links?: Record<string, string>
  }) => {
    if (!supabaseUser) {
      throw new Error('Usuario no encontrado')
    }

    setLoading(true)
    setError(null)

    try {
      // Configurar usuario actual para RLS
      await supabase.rpc('set_current_user_wallet', {
        wallet_address: supabaseUser.wallet_address
      })

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', supabaseUser.wallet_address)
        .select()
        .single()

      if (error) {
        throw error
      }

      setSupabaseUser(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando perfil'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabaseUser])

  const updatePreference = useCallback(async (preferenceKey: string, preferenceValue: string) => {
    if (!supabaseUser) {
      throw new Error('Usuario no encontrado')
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .rpc('update_user_preference', {
          user_wallet: supabaseUser.wallet_address,
          preference_key: preferenceKey,
          preference_value: preferenceValue
        })

      if (error) {
        throw error
      }

      // Actualizar estado local
      if (userPreferences) {
        setUserPreferences({
          ...userPreferences,
          [preferenceKey]: preferenceValue
        })
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando preferencia'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabaseUser, userPreferences])

  const logout = useCallback(() => {
    setSupabaseUser(null)
    setUserPreferences(null)
    authLogout()
  }, [authLogout])

  return {
    // Usuario híbrido (auth + supabase)
    user: supabaseUser,
    authUser,
    userPreferences,
    
    // Estados
    loading,
    error,
    connected,
    
    // Funciones
    updateProfile,
    updatePreference,
    logout,
    
    // Wallet info
    walletAddress: publicKey?.toString(),
    isWalletConnected: connected
  }
}

// Hook para obtener el wallet address actual
export function useWalletAddress() {
  const { publicKey, connected } = useWallet()
  return {
    walletAddress: publicKey?.toString(),
    isConnected: connected,
    publicKey
  }
}

// Hook para verificar si el usuario está autenticado con Supabase
export function useSupabaseAuthStatus() {
  const { user, loading, error } = useSupabaseAuth()
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    hasError: !!error,
    user,
    walletAddress: user?.wallet_address
  }
}
