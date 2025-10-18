"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Shield, Lock, AlertCircle } from "lucide-react"

interface PinModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (pin: string) => boolean
  title?: string
  description?: string
  maxAttempts?: number
}

export function PinModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  title = "Confirmar Transacción",
  description = "Ingresa tu PIN para continuar con esta operación",
  maxAttempts = 3
}: PinModalProps) {
  const [pin, setPin] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPin("")
      setAttempts(0)
      setError("")
      // Focus en el input cuando se abre el modal
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pin.length !== 4) {
      setError("El PIN debe tener 4 dígitos")
      return
    }

    setIsLoading(true)
    
    // Simular verificación
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const isValid = onVerify(pin)
    
    if (isValid) {
      setPin("")
      setError("")
      onClose()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= maxAttempts) {
        setError(`PIN incorrecto. Máximo de intentos alcanzado (${maxAttempts})`)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(`PIN incorrecto. Intentos restantes: ${maxAttempts - newAttempts}`)
        setPin("")
      }
    }
    
    setIsLoading(false)
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(value)
    setError("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                PIN de Seguridad
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  id="pin"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={handlePinChange}
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={4}
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={pin.length !== 4 || isLoading}
              >
                {isLoading ? "Verificando..." : "Confirmar"}
              </Button>
            </div>
          </form>

          {attempts > 0 && attempts < maxAttempts && (
            <div className="text-center text-sm text-muted-foreground">
              Intentos: {attempts}/{maxAttempts}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
