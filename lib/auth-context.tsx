"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { WalletContextProvider } from "@/app/context/WalletContextProvider"

interface User {
  id: string
  username: string
  email: string
  wallet?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
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

  const login = async (email: string, password: string) => {
    // Simulate API call - In production, this would call your backend
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockUser: User = {
      id: "1",
      username: email.split("@")[0],
      email,
      wallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    }

    setUser(mockUser)
    localStorage.setItem("unbox_user", JSON.stringify(mockUser))
    router.push("/feed")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("unbox_user")
    router.push("/")
  }

  return (
    <WalletContextProvider>
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
    </WalletContextProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
