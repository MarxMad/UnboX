"use client"

import React, { createContext, useContext, useMemo, type ReactNode } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"

// Importar estilos del wallet modal
require("@solana/wallet-adapter-react-ui/styles.css")

interface WalletContextType {
  // Este contexto será proporcionado por el WalletProvider de Solana
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletContextProvider({ children }: { children: ReactNode }) {
  // Configurar la red - usar devnet para desarrollo
  const network = WalletAdapterNetwork.Devnet
  
  // Usar endpoint de Helius para mejor confiabilidad
  // Si no hay HELIUS_API_KEY, usar el RPC público de Solana
  const endpoint = useMemo(() => {
    const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY
    if (heliusApiKey) {
      return `https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`
    }
    // Usar RPC público de Solana
    return 'https://api.devnet.solana.com'
  }, [])

  // Configurar wallets soportados
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletContextProvider")
  }
  return context
}
