import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Singleton para evitar múltiples instancias
let supabaseInstance: any = null;

// Cliente de Supabase con tipos (Singleton)
export const supabaseTyped = (() => {
  if (!supabaseInstance) {
    console.log('🔧 Creando instancia única de Supabase');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // No persistir sesión para evitar problemas con wallets
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      realtime: {
        // Deshabilitar realtime para evitar problemas de WebSocket
        enabled: false
      }
    });
  }
  return supabaseInstance;
})();

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
