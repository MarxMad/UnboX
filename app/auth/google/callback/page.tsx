"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        // Error en la autenticación
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, window.location.origin)
        return
      }

      if (!code) {
        // No hay código de autorización
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'No se recibió el código de autorización'
        }, window.location.origin)
        return
      }

      try {
        // En producción, aquí intercambiarías el código por un token de acceso
        // y obtendrías los datos del usuario de Google
        const mockGoogleUser = {
          email: "usuario@gmail.com",
          name: "Usuario Google",
          picture: "https://via.placeholder.com/150/0000FF/FFFFFF?text=G",
          id: "google_user_123"
        }

        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Enviar datos del usuario al padre
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          user: mockGoogleUser
        }, window.location.origin)

      } catch (error) {
        console.error("Error processing Google callback:", error)
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'Error procesando la autenticación'
        }, window.location.origin)
      }
    }

    handleGoogleCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">Procesando autenticación...</h2>
        <p className="text-muted-foreground">Por favor espera mientras completamos tu registro.</p>
      </div>
    </div>
  )
}
