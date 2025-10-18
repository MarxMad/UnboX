"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface PinContextType {
  userPin: string | null
  setUserPin: (pin: string) => void
  verifyPin: (pin: string) => boolean
  clearPin: () => void
  isPinSet: boolean
}

const PinContext = createContext<PinContextType | undefined>(undefined)

export function PinProvider({ children }: { children: ReactNode }) {
  const [userPin, setUserPinState] = useState<string | null>(null)

  // Cargar PIN desde localStorage al montar
  useEffect(() => {
    const storedPin = localStorage.getItem("unbox_user_pin")
    if (storedPin) {
      setUserPinState(storedPin)
    }
  }, [])

  const setUserPin = (pin: string) => {
    setUserPinState(pin)
    localStorage.setItem("unbox_user_pin", pin)
  }

  const verifyPin = (pin: string): boolean => {
    return userPin === pin
  }

  const clearPin = () => {
    setUserPinState(null)
    localStorage.removeItem("unbox_user_pin")
  }

  const isPinSet = userPin !== null

  return (
    <PinContext.Provider value={{
      userPin,
      setUserPin,
      verifyPin,
      clearPin,
      isPinSet
    }}>
      {children}
    </PinContext.Provider>
  )
}

export function usePin() {
  const context = useContext(PinContext)
  if (context === undefined) {
    throw new Error("usePin must be used within a PinProvider")
  }
  return context
}
