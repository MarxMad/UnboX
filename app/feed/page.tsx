"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Heart, Share2, Filter, Loader2, PackageX, Sparkles, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
// import { useAllNFTs } from "@/app/hooks/useAllNFTs"
// import { useMarketplaceNFTs } from "@/app/hooks/useMarketplaceNFTs"
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
  
  // Hooks para obtener NFTs reales (fallback) - DESHABILITADOS PARA MEJOR RENDIMIENTO
  // const { allNFTs, loading: allNFTsLoading } = useAllNFTs()
  // const { marketplaceNFTs, loading: marketplaceLoading } = useMarketplaceNFTs()
  
  // Usar solo Supabase para mejor rendimiento
  const allNFTs = null;
  const marketplaceNFTs = null;
  const allNFTsLoading = false;
  const marketplaceLoading = false;
  
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

  // Estado de loading combinado - SOLO SUPABASE
  const isLoading = supabaseLoading

  // Solo usar artículos de Supabase para mejor rendimiento
  const combinedNFTs = React.useMemo(() => {
    const items: any[] = []
    
    // Solo agregar artículos de Supabase
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
          model: article.model,
          size: article.size,
          year: article.year || "2024",
          condition: article.condition || "New",
          rarity: article.rarity,
          price: "Not listed", // Los artículos de Supabase no tienen precio por ahora
          image: article.image_url || "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image",
          likes: article.likes_count || 0,
          verified: true,
          trending: (article.likes_count || 0) > 5,
          isReal: true,
          isSupabase: true,
          username: article.username,
          display_name: article.display_name,
          avatar_url: article.avatar_url,
          // Campos híbridos
          metadata: article.metadata,
          blockchain_signature: article.blockchain_signature,
          asset_pda: article.asset_pda,
          data_source: article.data_source,
          sync_status: article.sync_status
        });
      });
    }
    
    // CÓDIGO DE BLOCKCHAIN COMENTADO PARA MEJOR RENDIMIENTO
    // 2. Agregar NFTs existentes como fallback
    // if (allNFTs && allNFTs.length > 0) {
    //   allNFTs.forEach((nft, index) => {
    //     // Solo agregar si no existe ya en Supabase
    //     const existsInSupabase = supabaseArticles?.some(article => article.nft_mint === nft.mint)
    //     if (!existsInSupabase) {
    //       console.log(`🔍 Fallback NFT ${index}:`, {
    //         mint: nft.mint,
    //         name: nft.name,
    //         brand: nft.brand
    //       });
    //       
    //       items.push({
    //         id: nft.mint,
    //         mint: nft.mint,
    //         name: nft.name || "NFT Item",
    //         brand: nft.brand || "Unknown",
    //         year: nft.year || "2024",
    //         condition: nft.condition || "New",
    //         price: nft.isListed && nft.price ? `USD ${nft.price}` : "No listado",
    //         image: nft.image || "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image",
    //         likes: Math.floor(Math.random() * 100),
    //         verified: true,
    //         trending: Math.random() > 0.7,
    //         isReal: true,
    //         isSupabase: false
    //       });
    //     }
    //   });
    // }
    
    return items
  }, [supabaseArticles])

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
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading items...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNFTs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <PackageX className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Nothing here yet</h3>
                <p className="text-muted-foreground">
                  Be the first to tokenize in the <span className="font-semibold text-primary">{selectedCategory}</span> category!
                  Start building your digital collection on Solana.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/tokenize')}
                size="lg"
                className="gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Tokenize Your First Item
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Trending Section */}
        {!isLoading && filteredNFTs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredNFTs.map((item) => {
              // Usar SupabaseNFTCard para TODOS los items (diseño unificado)
              return (
                <SupabaseNFTCard
                  key={item.id}
                  nft={{
                    id: item.id,
                    mint: item.mint || item.id,
                    name: item.name,
                    brand: item.brand,
                    model: item.model || item.name,
                    size: item.size || 'N/A',
                    year: item.year || 2024,
                    condition: item.condition || 'New',
                    rarity: item.rarity || 'Common',
                    price: typeof item.price === 'string' && item.price !== 'Not listed' ? 
                      item.price : 'Not listed',
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
                  onLike={handleLike}
                />
              )
            })}
          </div>
        </div>
        )}

        {/* Recent Drops */}
        {!isLoading && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Drops</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {combinedNFTs.slice(0, 6).map((item, index) => (
              <SupabaseNFTCard
                key={`recent-${item.id}-${index}`}
                nft={{
                  id: item.id,
                  mint: item.id.replace('real-', ''), // Extraer el mint del ID
                  name: item.name,
                  brand: item.brand,
                  model: item.name, // Usar name como model si no hay model específico
                  size: 'N/A',
                  year: item.year || 2024,
                  condition: item.condition || 'New',
                  rarity: 'Common',
                  price: typeof item.price === 'string' && item.price !== 'No listado' ? 
                    item.price : 'No listado',
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
                onLike={handleLike}
              />
            ))}
          </div>
        </div>
        )}
      </main>
    </div>
  )
}
