"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function useSignInWithSolana() {
  const { publicKey, signMessage, connect, connected, connecting } = useWallet()
  const { login } = useAuth()
  const router = useRouter()
  const [isSigning, setIsSigning] = useState(false)

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

  return {
    signInWithSolana,
    isSigning,
    connected,
    connecting,
    publicKey
  }
}
