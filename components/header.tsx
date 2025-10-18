"use client"

import { Box, Search, Bell, User, Wallet, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useState } from "react"

export function Header() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [searchQuery, setSearchQuery] = useState("")

  const isActive = (path: string) => pathname === path
  
  // Solo mostrar elementos de usuario cuando hay sesión activa Y no estamos en la landing page
  const shouldShowUserElements = user && pathname !== "/"

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // TODO: Implementar búsqueda real
      console.log("Searching for:", searchQuery)
    }
  }

  const handleWalletConnect = async () => {
    try {
      if (connected) {
        await disconnect()
      } else {
        // Mostrar modal de selección de wallet
        setVisible(true)
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      (window as any).addNotification?.({
        type: "error",
        title: "Error de conexión",
        message: "No se pudo conectar el wallet"
      })
    }
  }

  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Box className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">UnboX</span>
          </Link>

          {/* Search Bar - Only show when logged in and not on landing page */}
          {shouldShowUserElements && (
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items, brands, collectors..."
                  className="pl-10 bg-muted/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          )}

          {/* Navigation - Only show when logged in and not on landing page */}
          {shouldShowUserElements ? (
            <nav className="flex items-center gap-6">
              <Link
                href="/feed"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive("/feed") ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Feed
              </Link>
              <Link
                href="/tokenize"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive("/tokenize") ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Tokenize
              </Link>

              <div className="flex items-center gap-2 ml-2">
                {/* Wallet Status */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleWalletConnect}
                  className={`gap-2 ${connected ? 'text-green-500' : 'text-muted-foreground'}`}
                >
                  <Wallet className="h-4 w-4" />
                  {connected ? `${publicKey?.toString().slice(0, 4)}...` : 'Connect'}
                </Button>
                
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
                </Button>
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
