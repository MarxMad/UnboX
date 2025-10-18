"use client"

import { Box, Search, Bell, User, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useWallet } from "@solana/wallet-adapter-react"
import { useState } from "react"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { connected, publicKey, connect, disconnect } = useWallet()
  const [searchQuery, setSearchQuery] = useState("")

  const isActive = (path: string) => pathname === path

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
        await connect()
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
    }
  }

  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={user ? "/feed" : "/"} className="flex items-center gap-2 flex-shrink-0">
            <Box className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">UnboX</span>
          </Link>

          {/* Search Bar - Only show when logged in */}
          {user && (
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

          {/* Navigation - Only show when logged in */}
          {user ? (
            <nav className="flex items-center gap-6">
              <Link
                href="/feed"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive("/feed") ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Explore
              </Link>
              <Link
                href="/tokenize"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive("/tokenize") ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Tokenize
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive("/profile") ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Profile
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
                <Button variant="ghost" size="icon" onClick={logout}>
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </nav>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
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
