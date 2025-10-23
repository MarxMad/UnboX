import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Cliente de Supabase con tipos
export const supabaseTyped = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No persistir sesión para evitar problemas con wallets
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// Función para verificar si Supabase está disponible
export const isSupabaseAvailable = () => {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key' &&
         supabaseUrl.includes('supabase.co')
}

// Función para obtener el estado de Supabase
export const getSupabaseStatus = () => {
  return {
    url: supabaseUrl,
    hasKey: supabaseAnonKey !== 'your-anon-key',
    isConfigured: isSupabaseAvailable()
  }
}
