"use client"

import { useState, useCallback } from 'react'
import { supabaseTyped } from '@/lib/supabase'

interface UserProfile {
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

interface UserPreferences {
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

interface UpdateProfileData {
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  social_links?: Record<string, string>
}

export function useUserProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserProfile = useCallback(async (walletAddress: string): Promise<UserProfile | null> => {
    setLoading(true)
    setError(null)

    try {
      // Configurar usuario actual para RLS
      await supabaseTyped.rpc('set_current_user_wallet', {
        wallet_address: walletAddress
      })

      const { data, error } = await supabaseTyped
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Usuario no encontrado, crear uno nuevo
          const { data: newUser, error: createError } = await supabaseTyped
            .from('users')
            .insert({
              wallet_address: walletAddress,
              username: `user_${walletAddress.slice(0, 8)}`,
              display_name: `Usuario ${walletAddress.slice(0, 8)}`
            })
            .select()
            .single()

          if (createError) {
            throw createError
          }

          return newUser
        }
        throw error
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getUserProfile,
    loading,
    error
  }
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(async (
    walletAddress: string,
    updateData: UpdateProfileData
  ): Promise<UserProfile | null> => {
    setLoading(true)
    setError(null)

    try {
      // Configurar usuario actual para RLS
      await supabaseTyped.rpc('set_current_user_wallet', {
        wallet_address: walletAddress
      })

      const { data, error } = await supabaseTyped
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    updateProfile,
    loading,
    error
  }
}

export function useUserPreferences() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserPreferences = useCallback(async (walletAddress: string): Promise<UserPreferences | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseTyped
        .rpc('get_or_create_user_preferences', {
          user_wallet: walletAddress
        })

      if (error) {
        throw error
      }

      return data && data.length > 0 ? data[0] : null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePreference = useCallback(async (
    walletAddress: string,
    preferenceKey: string,
    preferenceValue: string
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseTyped
        .rpc('update_user_preference', {
          user_wallet: walletAddress,
          preference_key: preferenceKey,
          preference_value: preferenceValue
        })

      if (error) {
        throw error
      }

      return data || false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getUserPreferences,
    updatePreference,
    loading,
    error
  }
}

export function useUserArticles() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserArticles = useCallback(async (walletAddress: string) => {
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

      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getUserArticles,
    loading,
    error
  }
}

export function usePopularArticles() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPopularArticles = useCallback(async (limit: number = 10) => {
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

      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getPopularArticles,
    loading,
    error
  }
}
