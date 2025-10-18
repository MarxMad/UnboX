"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Share2, Heart, Grid3x3, LayoutGrid, Box } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { useUserNFTs } from "@/app/hooks/useUserNFTs"
import { useWallet } from "@solana/wallet-adapter-react"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const { nfts: userNFTs, loading: userNFTsLoading } = useUserNFTs()
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  // Datos mock para mostrar contenido cuando no hay NFTs reales
  const userItems = [
    {
      id: 1,
      name: "Supreme Box Logo Hoodie",
      brand: "Supreme",
      image: "/supreme-hoodie-streetwear.jpg",
      price: "USD 850",
      likes: 234,
    },
    {
      id: 2,
      name: "Nike Dunk Low Panda",
      brand: "Nike",
      image: "/nike-dunk-low-panda-black-white.jpg",
      price: "USD 220",
      likes: 189,
    },
    {
      id: 3,
      name: "KAWS Companion Figure",
      brand: "KAWS",
      image: "/kaws-companion-grey-figure-art-toy.jpg",
      price: "USD 1,200",
      likes: 456,
    },
    {
      id: 4,
      name: "Bape Shark Hoodie",
      brand: "A Bathing Ape",
      image: "/bape-shark-hoodie-camo-green.jpg",
      price: "USD 650",
      likes: 167,
    },
    {
      id: 5,
      name: "Jordan 1 Retro High OG",
      brand: "Nike",
      image: "/air-jordan-1-retro-high-chicago-red.jpg",
      price: "USD 380",
      likes: 312,
    },
    {
      id: 6,
      name: "Off-White Belt",
      brand: "Off-White",
      image: "/off-white-industrial-belt-yellow.jpg",
      price: "USD 180",
      likes: 145,
    },
  ]

  // Combinar NFTs reales del usuario con datos mock
  const combinedUserItems = [
    ...(userNFTs || []).map((nft, index) => ({
      id: `user-${index}`,
      name: nft.name || "My NFT",
      brand: nft.brand || "Unknown",
      image: "/placeholder.svg",
      price: "USD 0", // Los NFTs del usuario no tienen precio de venta
      likes: Math.floor(Math.random() * 50),
      isReal: true
    })),
    // Mantener algunos items mock para mostrar contenido
    ...userItems.slice(0, 3).map(item => ({ ...item, isReal: false }))
  ]

  const handleLike = (itemId: number) => {
    setLikedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleShare = (item: any) => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out my ${item.brand} item in my UnboX collection`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${item.name} - ${item.brand}`)
      alert("Item info copied to clipboard!")
    }
  }

  const handleEditProfile = () => {
    // TODO: Implementar edición de perfil
    alert("Edit profile functionality coming soon!")
  }

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.username}'s Collection`,
        text: `Check out ${user.username}'s streetwear collection on UnboX`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${user.username}'s UnboX Profile: ${window.location.href}`)
      alert("Profile link copied to clipboard!")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* </CHANGE> */}

      {/* Profile Header */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src="/profile-avatar-streetwear-collector.jpg" />
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{user.username}</h1>
                  <Badge className="bg-primary text-primary-foreground">Verified</Badge>
                </div>
                <p className="text-muted-foreground">
                  Streetwear enthusiast | Supreme collector | Building my digital vault on Solana
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="font-bold text-lg">24</span>
                  <span className="text-muted-foreground ml-1">Items</span>
                </div>
                <div>
                  <span className="font-bold text-lg">1.2K</span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-lg">456</span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-primary">$18.5K</span>
                  <span className="text-muted-foreground ml-1">Collection Value</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={handleEditProfile}>
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={handleShareProfile}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="collection" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Collection
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-2">
              <Heart className="h-4 w-4" />
              Liked
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {combinedUserItems.map((item) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden border-border hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted/20">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.isReal && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">On-Chain</Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLike(typeof item.id === 'string' ? parseInt(item.id.split('-')[1]) : item.id)
                          }}
                        >
                          <Heart className={`h-4 w-4 ${likedItems.has(typeof item.id === 'string' ? parseInt(item.id.split('-')[1]) : item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShare(item)
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-bold text-primary">{item.price}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likes + (likedItems.has(typeof item.id === 'string' ? parseInt(item.id.split('-')[1]) : item.id) ? 1 : 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="liked">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No liked items yet</h3>
              <p className="text-muted-foreground">Start exploring and like items you love</p>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4">
              {[
                { action: "Minted", item: "Supreme Box Logo Hoodie", time: "2 hours ago" },
                { action: "Liked", item: "Nike Dunk Low Panda", time: "5 hours ago" },
                { action: "Minted", item: "KAWS Companion Figure", time: "1 day ago" },
                { action: "Followed", item: "@hypebeast_collector", time: "2 days ago" },
              ].map((activity, index) => (
                <Card key={index} className="p-4 border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Box className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.action} <span className="text-primary">{activity.item}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
