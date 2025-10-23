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
import { NFTCard } from "../components/NFTCard"

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
              <NFTCard
                key={item.id}
                nft={{
                  mint: item.id.replace('real-', ''),
                  name: item.name,
                  brand: item.brand,
                  model: item.name,
                  size: 'N/A',
                  condition: item.condition || 'New',
                  year: item.year || 2024,
                  rarity: 'Common',
                  isListed: item.price !== 'No listado',
                  image: item.image,
                  owner: 'Unknown',
                  price: typeof item.price === 'string' && item.price !== 'No listado' ? 
                    parseFloat(item.price.replace('USD ', '')) : undefined
                }}
              />
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
              <NFTCard
                key={`recent-${item.id}`}
                nft={{
                  mint: item.id.replace('real-', ''), // Extraer el mint del ID
                  name: item.name,
                  brand: item.brand,
                  model: item.name, // Usar name como model si no hay model específico
                  size: 'N/A',
                  condition: item.condition || 'New',
                  year: item.year || 2024,
                  rarity: 'Common',
                  isListed: item.price !== 'No listado',
                  image: item.image,
                  owner: 'Unknown', // Se determinará en el componente
                  price: typeof item.price === 'string' && item.price !== 'No listado' ? 
                    parseFloat(item.price.replace('USD ', '')) : undefined
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
