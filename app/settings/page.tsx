"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Mail, Shield, Bell, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { usePin } from "@/lib/pin-context"
import { useWallet } from "@solana/wallet-adapter-react"
import { PinSetup } from "@/components/PinSetup"
import { PinModal } from "@/components/PinModal"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { connected, publicKey, disconnect } = useWallet()
  const { isPinSet, setUserPin, clearPin } = usePin()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinAction, setPinAction] = useState<'setup' | 'change' | 'remove'>('setup')

  const handleSave = async () => {
    setIsLoading(true)
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    (window as any).addNotification?.({
      type: "success",
      title: "Configuración guardada",
      message: "Tus cambios se han guardado exitosamente"
    })
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnect()
      (window as any).addNotification?.({
        type: "success",
        title: "Wallet desconectado",
        message: "Tu wallet se ha desconectado exitosamente"
      })
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  const handleDeleteAccount = async () => {
    // Implementar lógica de eliminación de cuenta
    (window as any).addNotification?.({
      type: "warning",
      title: "Eliminar cuenta",
      message: "Esta función está en desarrollo"
    })
  }

  const handlePinComplete = (pin: string) => {
    setUserPin(pin)
    setShowPinSetup(false)
    (window as any).addNotification?.({
      type: "success",
      title: "PIN configurado",
      message: "Tu PIN de seguridad ha sido configurado exitosamente"
    })
  }

  const handlePinSkip = () => {
    setShowPinSetup(false)
  }

  const handlePinVerify = (pin: string): boolean => {
    // Aquí se verificaría el PIN actual antes de permitir cambios
    return true // Por simplicidad, siempre retorna true
  }

  const handleSetupPin = () => {
    setPinAction('setup')
    setShowPinSetup(true)
  }

  const handleChangePin = () => {
    setPinAction('change')
    setShowPinModal(true)
  }

  const handleRemovePin = () => {
    if (confirm("¿Estás seguro de que quieres eliminar tu PIN? Esto reducirá la seguridad de tus transacciones.")) {
      clearPin()
      (window as any).addNotification?.({
        type: "warning",
        title: "PIN eliminado",
        message: "Tu PIN ha sido eliminado. Te recomendamos configurar uno nuevo."
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user?.username}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} />
                  </div>
                </div>
              </div>
            </Card>

            {/* PIN Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5" />
                <h3 className="text-lg font-semibold">PIN de Seguridad</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Estado del PIN</p>
                    <p className="text-sm text-muted-foreground">
                      {isPinSet ? "PIN configurado" : "PIN no configurado"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isPinSet ? (
                      <Button size="sm" onClick={handleSetupPin}>
                        Configurar PIN
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={handleChangePin}>
                          Cambiar PIN
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleRemovePin}>
                          Eliminar PIN
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {isPinSet && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Tu PIN está configurado y protege tus transacciones importantes.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Solana Wallet</p>
                    <p className="text-sm text-muted-foreground">
                      {connected ? `${publicKey?.toString().slice(0, 8)}...` : "Not connected"}
                    </p>
                  </div>
                  <Button 
                    variant={connected ? "destructive" : "default"}
                    size="sm"
                    onClick={handleDisconnectWallet}
                    disabled={!connected}
                  >
                    {connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates about your collections</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified about new items and trades</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button onClick={handleSave} className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}>
                  View Profile
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-red-200">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
              <div className="space-y-3">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <PinSetup 
            onComplete={handlePinComplete}
            onSkip={handlePinSkip}
          />
        </div>
      )}

      {/* PIN Verification Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerify={handlePinVerify}
        title="Cambiar PIN"
        description="Ingresa tu PIN actual para poder cambiarlo"
      />
    </div>
  )
}
