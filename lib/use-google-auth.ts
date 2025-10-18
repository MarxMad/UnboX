"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function useGoogleAuth() {
  const { register } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const signInWithGoogle = async () => {
    setIsLoading(true)
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
          setIsLoading(false)
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
          setIsLoading(false)
          
          const { user } = event.data
          handleGoogleAuthSuccess(user)
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageListener)
          popup.close()
          setIsLoading(false)
          
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
      setIsLoading(false)
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
      await register(googleUser.email, "google_auth", googleUser.name, true)

      // Notificación de éxito
      ;(window as any).addNotification?.({
        type: "success",
        title: "¡Registro exitoso!",
        message: `Bienvenido ${googleUser.name}, tu cuenta de Google ha sido vinculada.`
      })

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
    signInWithGoogle,
    isLoading
  }
}
