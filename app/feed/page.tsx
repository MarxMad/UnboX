"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Heart, Share2, Filter } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { useAllNFTs } from "@/app/hooks/useAllNFTs"
import { useMarketplaceNFTs } from "@/app/hooks/useMarketplaceNFTs"
import { useRealtimeFeed } from "@/app/hooks/useRealtimeFeed"
import { useSupabaseContext } from "@/app/components/SupabaseProvider"
import { NFTCard } from "../components/NFTCard"
import { SupabaseNFTCard } from "../components/SupabaseNFTCard"

export default function FeedPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { isSupabaseReady, walletAddress } = useSupabaseContext()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  
  // Hooks para obtener NFTs reales (fallback)
  const { allNFTs, loading: allNFTsLoading } = useAllNFTs()
  const { marketplaceNFTs, loading: marketplaceLoading } = useMarketplaceNFTs()
  
  // Hook principal para feed en tiempo real con Supabase
  const { articles: supabaseArticles, loading: supabaseLoading, error: supabaseError } = useRealtimeFeed()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return null
  }

  // Estado de loading combinado
  const isLoading = allNFTsLoading || marketplaceLoading || supabaseLoading

  // Combinar artículos de Supabase con NFTs existentes
  const combinedNFTs = React.useMemo(() => {
    const items: any[] = []
    
    // 1. Agregar artículos de Supabase (prioridad alta)
    if (supabaseArticles && supabaseArticles.length > 0) {
      supabaseArticles.forEach((article, index) => {
        console.log(`🔍 Supabase Article ${index}:`, {
          id: article.id,
          title: article.title,
          brand: article.brand,
          likes_count: article.likes_count
        });
        
        items.push({
          id: article.id,
          mint: article.nft_mint,
          name: article.title || "NFT Item",
          brand: article.brand || "Unknown",
          year: article.year || "2024",
          condition: article.condition || "New",
          price: "No listado", // Los artículos de Supabase no tienen precio por ahora
          image: article.image_url || "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image",
          likes: article.likes_count || 0,
          verified: true,
          trending: (article.likes_count || 0) > 5,
          isReal: true,
          isSupabase: true,
          username: article.username,
          display_name: article.display_name,
          avatar_url: article.avatar_url
        });
      });
    }
    
    // 2. Agregar NFTs existentes como fallback
    if (allNFTs && allNFTs.length > 0) {
      allNFTs.forEach((nft, index) => {
        // Solo agregar si no existe ya en Supabase
        const existsInSupabase = supabaseArticles?.some(article => article.nft_mint === nft.mint)
        if (!existsInSupabase) {
          console.log(`🔍 Fallback NFT ${index}:`, {
            mint: nft.mint,
            name: nft.name,
            brand: nft.brand
          });
          
          items.push({
            id: nft.mint,
            mint: nft.mint,
            name: nft.name || "NFT Item",
            brand: nft.brand || "Unknown",
            year: nft.year || "2024",
            condition: nft.condition || "New",
            price: nft.isListed && nft.price ? `USD ${nft.price}` : "No listado",
            image: nft.image || "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image",
            likes: Math.floor(Math.random() * 100),
            verified: true,
            trending: Math.random() > 0.7,
            isReal: true,
            isSupabase: false
          });
        }
      });
    }
    
    return items
  }, [supabaseArticles, allNFTs])

  const handleLike = (itemId: string) => {
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
            {filteredNFTs.map((item) => {
              // Usar SupabaseNFTCard para artículos de Supabase, NFTCard para el resto
              if (item.isSupabase) {
                return (
                  <SupabaseNFTCard
                    key={item.id}
                    nft={item}
                    onLike={handleLike}
                  />
                )
              } else {
                return (
                  <NFTCard
                    key={item.id}
                    nft={{
                      mint: item.mint,
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
                        parseFloat(item.price.replace('USD ', '')) : undefined,
                      symbol: 'UNBOX',
                      uri: ''
                    }}
                  />
                )
              }
            })}
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
                    parseFloat(item.price.replace('USD ', '')) : undefined,
                  symbol: 'UNBOX',
                  uri: ''
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
