"use client"

import type React from "react"

import { useState } from "react"
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const { login } = useAuth()
  const { setUserPin } = usePin()
  const { connected, connecting, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const router = useRouter()

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
      // Simular registro - en MVP real aquí se haría el registro
      await login(formData.email, formData.password)
      
      // Mostrar configuración de PIN después del registro exitoso
      setShowPinSetup(true)
    } catch (error) {
      console.error("Registration failed:", error)
      (window as any).addNotification?.({
        type: "error",
        title: "Error de registro",
        message: "No se pudo crear la cuenta. Inténtalo de nuevo."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    try {
      if (connected) {
        // Si ya está conectado, hacer login automático
        await login(`wallet@${publicKey?.toString().slice(0, 8)}.sol`, "wallet")
        router.push("/feed")
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
    router.push("/feed")
    (window as any).addNotification?.({
      type: "success",
      title: "¡Cuenta creada exitosamente!",
      message: "Tu PIN de seguridad ha sido configurado. Ya puedes empezar a tokenizar."
    })
  }

  const handlePinSkip = () => {
    setShowPinSetup(false)
    router.push("/feed")
    (window as any).addNotification?.({
      type: "warning",
      title: "PIN no configurado",
      message: "Recuerda configurar tu PIN en Settings para proteger tus transacciones."
    })
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
            disabled={connecting}
          >
            <Wallet className="mr-2 h-5 w-5" />
            {connecting ? "Connecting..." : connected ? `Connected: ${publicKey?.toString().slice(0, 8)}...` : "Connect Wallet"}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <PinSetup 
            onComplete={handlePinComplete}
            onSkip={handlePinSkip}
          />
        </div>
      )}
    </div>
  )
}
