"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  email: string
  wallet?: string
  publicKey?: string
  signature?: string
  message?: string
  timestamp?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, walletData?: Partial<User>) => Promise<void>
  register: (email: string, password: string, name: string, skipRedirect?: boolean) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("unbox_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const register = async (email: string, password: string, name: string, skipRedirect: boolean = false) => {
    // Simulate API call - In production, this would call your backend
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Verificar si el usuario ya existe (simulación)
    const existingUsers = JSON.parse(localStorage.getItem("unbox_users") || "[]")
    const userExists = existingUsers.some((user: User) => user.email === email)
    
    if (userExists) {
      throw new Error("User already exists with this email")
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: name || email.split("@")[0],
      email,
      wallet: undefined // No wallet connected yet
    }

    // Guardar usuario en la lista de usuarios registrados
    existingUsers.push(newUser)
    localStorage.setItem("unbox_users", JSON.stringify(existingUsers))

    // Iniciar sesión automáticamente después del registro
    setUser(newUser)
    localStorage.setItem("unbox_user", JSON.stringify(newUser))
    
    // Solo redirigir si no se especifica skipRedirect
    if (!skipRedirect) {
      router.push("/feed")
    }
  }

  const login = async (email: string, password: string, walletData?: Partial<User>) => {
    // Simulate API call - In production, this would call your backend
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Si hay datos del wallet, crear usuario directamente
    if (walletData) {
      const mockUser: User = {
        id: "1",
        username: email.split("@")[0],
        email,
        wallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        ...walletData // Merge wallet data if provided
      }

      setUser(mockUser)
      localStorage.setItem("unbox_user", JSON.stringify(mockUser))
      router.push("/feed")
      return
    }

    // Para login tradicional, verificar usuarios existentes
    const existingUsers = JSON.parse(localStorage.getItem("unbox_users") || "[]")
    const user = existingUsers.find((user: User) => user.email === email)
    
    if (!user) {
      throw new Error("Usuario no encontrado. Por favor regístrate primero.")
    }

    setUser(user)
    localStorage.setItem("unbox_user", JSON.stringify(user))
    router.push("/feed")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("unbox_user")
    // Si estamos en la landing page, no redirigir
    if (window.location.pathname !== "/") {
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
