"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Copy, X } from "lucide-react"
import Image from "next/image"

interface MintSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  mintAddress: string
  signature: string
  imageUrl: string
  name: string
  brand: string
}

export function MintSuccessModal({
  isOpen,
  onClose,
  mintAddress,
  signature,
  imageUrl,
  name,
  brand
}: MintSuccessModalProps) {
  if (!isOpen) return null

  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`
  const mintExplorerUrl = `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    ;(window as any).addNotification?.({
      type: "success",
      title: "Copiado",
      message: `${label} copiado al portapapeles`
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <Card className="max-w-2xl w-full p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center space-y-4">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold">¡NFT Creado Exitosamente! 🎉</h2>
            <p className="text-muted-foreground mt-2">
              Tu {brand} {name} ha sido tokenizado en Solana
            </p>
          </div>

          {/* NFT Image */}
          <div className="flex justify-center my-6">
            <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-primary">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">NFT Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Contract Info */}
          <div className="space-y-3 text-left">
            {/* Mint Address */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Mint Address:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(mintAddress, "Mint Address")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-xs break-all">{mintAddress}</code>
            </div>

            {/* Transaction Signature */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Transaction:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(signature, "Transaction")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-xs break-all">{signature}</code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(mintExplorerUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver NFT en Explorer
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(explorerUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Transacción
            </Button>
          </div>

          <Button
            className="w-full mt-4 bg-primary hover:bg-primary/90"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  )
}
