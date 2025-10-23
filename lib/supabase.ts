import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
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
        Insert: {
          id?: string
          wallet_address: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          social_links?: Record<string, string> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          social_links?: Record<string, string> | null
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
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
        }
        Insert: {
          id?: string
          user_id: string
          nft_mint: string
          title: string
          description?: string | null
          brand: string
          year: number
          condition: string
          image_url: string
          ipfs_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nft_mint?: string
          title?: string
          description?: string | null
          brand?: string
          year?: number
          condition?: string
          image_url?: string
          ipfs_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          article_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_id?: string
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          like_notifications?: boolean
          follow_notifications?: boolean
          profile_visibility?: 'public' | 'friends' | 'private'
          show_collection?: boolean
          show_likes?: boolean
          preferred_brands?: string[]
          preferred_categories?: string[]
          feed_sort_order?: 'trending' | 'newest' | 'popular' | 'following'
          auto_ipfs_upload?: boolean
          default_condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
          theme_preference?: 'light' | 'dark' | 'system'
          language_preference?: 'es' | 'en'
          currency_preference?: 'USD' | 'EUR' | 'SOL'
          allow_direct_messages?: boolean
          show_price_history?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          like_notifications?: boolean
          follow_notifications?: boolean
          profile_visibility?: 'public' | 'friends' | 'private'
          show_collection?: boolean
          show_likes?: boolean
          preferred_brands?: string[]
          preferred_categories?: string[]
          feed_sort_order?: 'trending' | 'newest' | 'popular' | 'following'
          auto_ipfs_upload?: boolean
          default_condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
          theme_preference?: 'light' | 'dark' | 'system'
          language_preference?: 'es' | 'en'
          currency_preference?: 'USD' | 'EUR' | 'SOL'
          allow_direct_messages?: boolean
          show_price_history?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_user_preferences: {
        Args: {
          user_wallet: string
        }
        Returns: {
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
        }[]
      }
      update_user_preference: {
        Args: {
          user_wallet: string
          preference_key: string
          preference_value: string
        }
        Returns: boolean
      }
      set_current_user_wallet: {
        Args: {
          wallet_address: string
        }
        Returns: void
      }
      user_liked_article: {
        Args: {
          user_wallet: string
          article_uuid: string
        }
        Returns: boolean
      }
      get_popular_articles: {
        Args: {
          limit_count: number
        }
        Returns: {
          id: string
          title: string
          brand: string
          year: number
          image_url: string
          username: string
          display_name: string
          avatar_url: string
          likes_count: number
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Cliente tipado
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey)
