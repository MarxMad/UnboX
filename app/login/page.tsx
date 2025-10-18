"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Box, Wallet, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useRouter } from "next/navigation"
import { useSignInWithSolana } from "@/lib/use-sign-in-with-solana"
import { useGoogleAuth } from "@/lib/use-google-auth"
import { useHybridAuth } from "@/lib/use-hybrid-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { connected, connecting, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const { signInWithSolana, signInWithGoogle, isSigning, isGoogleLoading } = useHybridAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    try {
      if (connected) {
        // Si ya está conectado, proceder con SIWS
        await signInWithSolana()
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Box className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold tracking-tight">UnboX</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="p-8 space-y-6">
          {/* Web3 Login */}
              <Button
                variant="outline"
                className="w-full h-12 text-base bg-transparent"
                onClick={handleWalletConnect}
                disabled={connecting || isSigning}
              >
                <Wallet className="mr-2 h-5 w-5" />
                {connecting ? "Connecting..." : isSigning ? "Signing..." : connected ? `Sign In with ${publicKey?.toString().slice(0, 8)}...` : "Sign In with Solana"}
              </Button>

              {/* Google Login */}
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
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to UnboX's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
