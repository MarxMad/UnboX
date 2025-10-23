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
import { SupabaseNFTCard } from "../components/SupabaseNFTCard"

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

  // Solo usar NFTs reales del usuario - sin productos mock
  const combinedUserItems = (userNFTs || []).map((nft, index) => ({
    id: `user-${index}`,
    name: nft.name || "My NFT",
    brand: nft.brand || "Unknown",
    image: nft.image || "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image",
    price: nft.isListed && nft.listPrice ? `USD ${nft.listPrice}` : "No listado",
    likes: Math.floor(Math.random() * 50),
    isReal: true
  }))

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
                <SupabaseNFTCard
                  key={item.id}
                  nft={{
                    id: item.id,
                    mint: item.id.replace('user-', ''), // Extraer el mint del ID
                    name: item.name,
                    brand: item.brand,
                    model: item.name, // Usar name como model si no hay model específico
                    size: 'N/A',
                    year: 2024,
                    condition: 'New',
                    rarity: 'Common',
                    price: 'No listado',
                    image: item.image,
                    likes: item.likes || 0,
                    verified: item.verified || false,
                    trending: item.trending || false,
                    isSupabase: item.isSupabase || false,
                    username: item.username,
                    display_name: item.display_name,
                    avatar_url: item.avatar_url,
                    metadata: item.metadata,
                    blockchain_signature: item.blockchain_signature,
                    asset_pda: item.asset_pda,
                    data_source: item.data_source || 'blockchain',
                    sync_status: item.sync_status
                  }}
                  onLike={(itemId) => {
                    setLikedItems(prev => {
                      const newSet = new Set(prev)
                      if (newSet.has(parseInt(itemId))) {
                        newSet.delete(parseInt(itemId))
                      } else {
                        newSet.add(parseInt(itemId))
                      }
                      return newSet
                    })
                  }}
                />
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
