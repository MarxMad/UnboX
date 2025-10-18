"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Box, Wallet, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { usePin } from "@/lib/pin-context"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useRouter } from "next/navigation"
import { PinSetup } from "@/components/PinSetup"
import { useSignInWithSolana } from "@/lib/use-sign-in-with-solana"
import { useGoogleAuth } from "@/lib/use-google-auth"
import { useHybridAuth } from "@/lib/use-hybrid-auth"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const { register } = useAuth()
  const { setUserPin } = usePin()
  const { connected, connecting, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const { signInWithSolana, signInWithGoogle, isSigning, isGoogleLoading } = useHybridAuth()
  const router = useRouter()

  // Detectar cuando el usuario se registra con Google y mostrar PIN setup
  useEffect(() => {
    const handleGoogleRegistration = () => {
      // Si hay un usuario logueado pero no hay PIN configurado, mostrar PIN setup
      const user = localStorage.getItem("unbox_user")
      const pin = localStorage.getItem("unbox_user_pin")
      
      if (user && !pin && !showPinSetup) {
        setShowPinSetup(true)
      }
    }

    // Escuchar cambios en localStorage
    const interval = setInterval(handleGoogleRegistration, 1000)
    
    return () => clearInterval(interval)
  }, [showPinSetup])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      (window as any).addNotification?.({
        type: "error",
        title: "Error",
        message: "Las contraseñas no coinciden"
      })
      return
    }

    if (formData.password.length < 6) {
      (window as any).addNotification?.({
        type: "error",
        title: "Error",
        message: "La contraseña debe tener al menos 6 caracteres"
      })
      return
    }

    setIsLoading(true)
    try {
      // Registrar nuevo usuario (sin redirigir automáticamente)
      await register(formData.email, formData.password, formData.name, true)
      
      // Mostrar configuración de PIN después del registro exitoso
      setShowPinSetup(true)
    } catch (error) {
      console.error("Registration failed:", error)
      
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear la cuenta. Inténtalo de nuevo."
      
      // Si el error es que el usuario ya existe, ofrecer limpiar y reintentar
      if (errorMessage.includes("ya existe")) {
        (window as any).addNotification?.({
          type: "error",
          title: "Usuario ya existe",
          message: "Ya existe una cuenta con este email. Si olvidaste tu contraseña, ve a la página de login. O usa un email diferente."
        })
      } else {
        (window as any).addNotification?.({
          type: "error",
          title: "Error de registro",
          message: errorMessage
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    try {
      if (connected) {
        // Si ya está conectado, proceder con SIWS
        await signInWithSolana()
        // Después del registro exitoso, mostrar PIN setup
        setShowPinSetup(true)
      } else {
        // Mostrar modal de selección de wallet
        setVisible(true)
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      (window as any).addNotification?.({
        type: "error",
        title: "Error de conexión",
        message: "No se pudo conectar el wallet. Inténtalo de nuevo."
      })
    }
  }

  const handlePinComplete = (pin: string) => {
    setUserPin(pin)
    setShowPinSetup(false)
    
    // Usar setTimeout para asegurar que el estado se actualice antes de la navegación
    setTimeout(() => {
      (window as any).addNotification?.({
        type: "success",
        title: "¡Cuenta creada exitosamente!",
        message: "Tu PIN de seguridad ha sido configurado. Ya puedes empezar a tokenizar."
      })
      
      // Navegar al feed
      if (router && typeof router.push === 'function') {
        router.push("/feed")
      } else {
        window.location.href = "/feed"
      }
    }, 100)
  }

  const handlePinSkip = () => {
    setShowPinSetup(false)
    
    setTimeout(() => {
      (window as any).addNotification?.({
        type: "warning",
        title: "PIN no configurado",
        message: "Recuerda configurar tu PIN en Settings para proteger tus transacciones."
      })
      
      if (router && typeof router.push === 'function') {
        router.push("/feed")
      } else {
        window.location.href = "/feed"
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Box className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold tracking-tight">UnboX</span>
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join the streetwear collector community</p>
        </div>

        <Card className="p-8 space-y-6">
          {/* Web3 Registration */}
              <Button
                variant="outline"
                className="w-full h-12 text-base bg-transparent"
                onClick={handleWalletConnect}
                disabled={connecting || isSigning}
              >
                <Wallet className="mr-2 h-5 w-5" />
                {connecting ? "Connecting..." : isSigning ? "Signing..." : connected ? `Sign Up with ${publicKey?.toString().slice(0, 8)}...` : "Sign Up with Solana"}
              </Button>

              {/* Google Registration */}
              <Button
                variant="outline"
                className="w-full h-12 text-base bg-transparent border-red-200 hover:bg-red-50"
                onClick={signInWithGoogle}
                disabled={isGoogleLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
              </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or register with email</span>
            </div>
          </div>

          {/* Email Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="collector@unbox.app"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to UnboX's Terms of Service and Privacy Policy
        </p>
      </div>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <PinSetup 
          onComplete={handlePinComplete}
          onSkip={handlePinSkip}
        />
      )}
    </div>
  )
}
