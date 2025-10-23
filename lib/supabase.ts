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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Cliente tipado
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey)
