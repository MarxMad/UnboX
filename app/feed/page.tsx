"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Heart, Share2, Filter } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { useAllNFTs } from "@/app/hooks/useAllNFTs"
import { useMarketplaceNFTs } from "@/app/hooks/useMarketplaceNFTs"

export default function FeedPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())
  
  // Hooks para obtener NFTs reales
  const { allNFTs, loading: allNFTsLoading } = useAllNFTs()
  const { marketplaceNFTs, loading: marketplaceLoading } = useMarketplaceNFTs()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  // Solo usar NFTs reales - sin productos mock
  const combinedNFTs = (allNFTs || []).map((nft, index) => ({
    id: `real-${index}`,
    name: nft.name || "NFT Item",
    brand: nft.brand || "Unknown",
    year: nft.year || "2024",
    condition: nft.condition || "New",
    price: nft.isListed && nft.price ? `USD ${nft.price}` : "No listado",
    image: nft.image || "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image",
    likes: Math.floor(Math.random() * 100),
    verified: true,
    trending: Math.random() > 0.7,
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
        text: `Check out this ${item.brand} item on UnboX`,
        url: window.location.href
      })
    } else {
      // Fallback: copiar al clipboard
      navigator.clipboard.writeText(`${item.name} - ${item.brand}`)
      alert("Item info copied to clipboard!")
    }
  }

  const filteredNFTs = selectedCategory === "All" 
    ? combinedNFTs 
    : combinedNFTs.filter(item => {
        // Mapear categorías a tipos de items
        const categoryMap: { [key: string]: string[] } = {
          "Sneakers": ["Nike", "Jordan", "Adidas"],
          "Streetwear": ["Supreme", "Bape", "Off-White"],
          "Art Toys": ["KAWS", "Bearbrick"],
          "Watches": ["Rolex", "Omega"],
          "Accessories": ["Gucci", "Louis Vuitton"]
        }
        return categoryMap[selectedCategory]?.includes(item.brand) || false
      })

  const categories = ["All", "Sneakers", "Streetwear", "Art Toys", "Watches", "Accessories"]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* </CHANGE> */}

      {/* Category Navigation */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={category === selectedCategory ? "bg-primary text-primary-foreground" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Trending Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredNFTs.map((item) => (
              <Card
                key={item.id}
                className="group overflow-hidden border-border hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden bg-muted/20">
                  <img src={item.image || "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image"} alt={item.name} className="w-full h-full object-cover" />
                  {item.trending && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">HOT</Badge>
                  )}
                  {item.verified && (
                    <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Verified</Badge>
                  )}
                  {item.isReal && (
                    <Badge className="absolute bottom-2 left-2 bg-green-500 text-white text-xs">On-Chain</Badge>
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
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {item.condition}
                    </Badge>
                    <span>{item.year}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Drops */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Drops</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {combinedNFTs.slice(0, 6).map((item) => (
              <Card
                key={`recent-${item.id}`}
                className="group overflow-hidden border-border hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden bg-muted/20">
                  <img src={item.image || "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image"} alt={item.name} className="w-full h-full object-cover" />
                  {item.verified && (
                    <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Verified</Badge>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-primary">{item.price}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likes}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
