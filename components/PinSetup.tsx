"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, Eye, EyeOff } from "lucide-react"

interface PinSetupProps {
  onComplete: (pin: string) => void
  onSkip?: () => void
}

export function PinSetup({ onComplete, onSkip }: PinSetupProps) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits")
      return
    }

    if (pin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    if (pin === "0000" || pin === "1111" || pin === "1234") {
      setError("For security, do not use common PINs like 0000, 1111, or 1234")
      return
    }

    setError("")
    onComplete(pin)
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setter(value)
    setError("")
  }

  const isFormValid = pin.length === 4 && confirmPin.length === 4 && pin === confirmPin

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <Card className="p-6 max-w-md mx-auto w-full">
        <div className="text-center space-y-4 mb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">🔐 Set Up Security PIN</h2>
            <p className="text-muted-foreground">
              Your PIN will protect important transactions. Choose a 4-digit PIN that you can easily remember.
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pin">Security PIN</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="pin"
              type={showPin ? "text" : "password"}
              placeholder="••••"
              value={pin}
              onChange={(e) => handlePinChange(e, setPin)}
              className="pl-10 pr-10 text-center text-lg tracking-widest"
              maxLength={4}
              autoComplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPin">Confirm PIN</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPin"
              type={showConfirmPin ? "text" : "password"}
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => handlePinChange(e, setConfirmPin)}
              className="pl-10 pr-10 text-center text-lg tracking-widest"
              maxLength={4}
              autoComplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowConfirmPin(!showConfirmPin)}
            >
              {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid}
          >
            <Shield className="mr-2 h-4 w-4" />
            Set Up PIN
          </Button>
          
          {onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              className="w-full"
            >
              Set up later
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Security Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Don't use birth dates or easy numbers</li>
          <li>• Don't share your PIN with anyone</li>
          <li>• You can change it anytime in Settings</li>
        </ul>
      </div>
    </Card>
    </div>
  )
}
