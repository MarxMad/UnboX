"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useSupabaseAuth } from "@/app/hooks/useSupabaseAuth"
import { supabaseTyped, isSupabaseAvailable } from "@/lib/supabase"

interface SupabaseContextType {
  isSupabaseReady: boolean
  supabase: any
  supabaseUser: any
  userPreferences: any
  walletAddress: string | undefined
  isWalletConnected: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { 
    user: supabaseUser, 
    userPreferences, 
    walletAddress, 
    isWalletConnected,
    loading 
  } = useSupabaseAuth()
  
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)

  useEffect(() => {
    // Verificar si Supabase está disponible
    if (isSupabaseAvailable()) {
      console.log('✅ Supabase está disponible');
      setIsSupabaseReady(true);
    } else {
      console.log('❌ Supabase no está configurado correctamente');
      // Marcar como listo después de un breve delay para permitir inicialización
      const timer = setTimeout(() => {
        setIsSupabaseReady(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const value = {
    isSupabaseReady,
    supabase: supabaseTyped,
    supabaseUser,
    userPreferences,
    walletAddress,
    isWalletConnected
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabaseContext() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabaseContext must be used within a SupabaseProvider")
  }
  return context
}
