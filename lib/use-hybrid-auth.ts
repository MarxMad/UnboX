"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function useHybridAuth() {
  const { publicKey, signMessage, connect, connected, connecting } = useWallet()
  const { login } = useAuth()
  const router = useRouter()
  const [isSigning, setIsSigning] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const signInWithSolana = async () => {
    try {
      setIsSigning(true)

      if (!connected) {
        await connect()
        return // El usuario necesita conectar primero
      }

      if (!publicKey || !signMessage) {
        throw new Error("Wallet no conectado o no soporta firma de mensajes")
      }

      // Crear mensaje SIWS
      const domain = window.location.host
      const currentTime = new Date().toISOString()
      const message = `UnboX quiere que inicies sesión con tu wallet Solana.

Dominio: ${domain}
Dirección: ${publicKey.toBase58()}
Tiempo: ${currentTime}
Nonce: ${Math.random().toString(36).substring(2, 15)}

Este mensaje no tiene costo y no requiere transacciones.`

      // Firmar mensaje
      const messageBytes = new TextEncoder().encode(message)
      const signature = await signMessage(messageBytes)

      if (!signature) {
        throw new Error("No se pudo firmar el mensaje")
      }

      // Crear usuario con datos del wallet
      const walletUser = {
        email: `wallet@${publicKey.toBase58().slice(0, 8)}.sol`,
        username: `Wallet_${publicKey.toBase58().slice(0, 8)}`,
        publicKey: publicKey.toBase58(),
        signature: Array.from(signature).join(','), // Convertir Uint8Array a string
        message: message,
        timestamp: currentTime
      }

      // Iniciar sesión con datos del wallet
      await login(walletUser.email, "wallet", walletUser)

      // Notificación de éxito
      ;(window as any).addNotification?.({
        type: "success",
        title: "¡Autenticación exitosa!",
        message: `Has iniciado sesión con tu wallet ${publicKey.toBase58().slice(0, 8)}...`
      })

      // Redirigir al feed
      router.push("/feed")

    } catch (error) {
      console.error("Error en Sign In With Solana:", error)
      
      let errorMessage = "Error al autenticar con wallet"
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Autenticación cancelada por el usuario"
        } else if (error.message.includes("Wallet not connected")) {
          errorMessage = "Wallet no conectado"
        } else {
          errorMessage = error.message
        }
      }

      ;(window as any).addNotification?.({
        type: "error",
        title: "Error de autenticación",
        message: errorMessage
      })
    } finally {
      setIsSigning(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      // Crear ventana popup para Google OAuth
      const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'demo-client-id'}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `state=${encodeURIComponent(JSON.stringify({ action: 'register' }))}`

      // Abrir popup de Google OAuth
      const popup = window.open(
        googleAuthUrl,
        'googleAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error("No se pudo abrir la ventana de autenticación. Verifica que los popups estén habilitados.")
      }

      // Escuchar el resultado del popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setIsGoogleLoading(false)
          // El usuario cerró la ventana sin completar la autenticación
          ;(window as any).addNotification?.({
            type: "warning",
            title: "Autenticación cancelada",
            message: "El proceso de autenticación con Google fue cancelado."
          })
        }
      }, 1000)

      // Escuchar mensajes del popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageListener)
          popup.close()
          setIsGoogleLoading(false)
          
          const { user } = event.data
          handleGoogleAuthSuccess(user)
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageListener)
          popup.close()
          setIsGoogleLoading(false)
          
          ;(window as any).addNotification?.({
            type: "error",
            title: "Error de autenticación",
            message: event.data.error || "No se pudo autenticar con Google."
          })
        }
      }

      window.addEventListener('message', messageListener)

    } catch (error) {
      console.error("Google authentication failed:", error)
      setIsGoogleLoading(false)
      ;(window as any).addNotification?.({
        type: "error",
        title: "Error de autenticación",
        message: error instanceof Error ? error.message : "No se pudo conectar con Google. Inténtalo de nuevo."
      })
    }
  }

  const handleGoogleAuthSuccess = async (googleUser: any) => {
    try {
      // Registrar usuario con datos reales de Google (sin redirigir automáticamente)
      await login(googleUser.email, "google_auth", {
        username: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture
      })

      // Notificación de éxito
      ;(window as any).addNotification?.({
        type: "success",
        title: "¡Registro exitoso!",
        message: `Bienvenido ${googleUser.name}, tu cuenta de Google ha sido vinculada.`
      })

      // No redirigir automáticamente - permitir que el componente padre maneje el flujo

    } catch (error) {
      console.error("Registration failed:", error)
      ;(window as any).addNotification?.({
        type: "error",
        title: "Error de registro",
        message: error instanceof Error ? error.message : "No se pudo registrar la cuenta."
      })
    }
  }

  return {
    signInWithSolana,
    signInWithGoogle,
    isSigning,
    isGoogleLoading,
    connected,
    connecting,
    publicKey
  }
}
