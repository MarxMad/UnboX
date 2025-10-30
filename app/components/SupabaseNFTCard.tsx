"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Share2, ExternalLink, User } from "lucide-react"
import { useLikeArticle, useUnlikeArticle, useCheckUserLiked } from "@/app/hooks/useLikes"
import { useSupabaseContext } from "@/app/components/SupabaseProvider"

interface SupabaseNFTCardProps {
  nft: {
    id: string
    mint: string
    name: string
    brand: string
    model?: string
    size?: string
    year: string | number
    condition: string
    rarity?: string
    price: string
    image: string
    likes: number
    verified: boolean
    trending: boolean
    isSupabase?: boolean
    username?: string
    display_name?: string
    avatar_url?: string
    // Campos híbridos
    metadata?: any
    blockchain_signature?: string
    asset_pda?: string
    data_source?: string
    sync_status?: string
  }
  onLike?: (itemId: string) => void
}

export function SupabaseNFTCard({ nft, onLike }: SupabaseNFTCardProps) {
  const { walletAddress } = useSupabaseContext()
  const router = useRouter()
  const { likeArticle, loading: likeLoading } = useLikeArticle()
  const { unlikeArticle, loading: unlikeLoading } = useUnlikeArticle()
  const { checkUserLiked, loading: checkLoading } = useCheckUserLiked()
  
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(nft.likes)
  const [isCheckingLike, setIsCheckingLike] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Verificar si el usuario le dio like cuando se monta el componente
  useEffect(() => {
    if (walletAddress && nft.isSupabase) {
      setIsCheckingLike(true)
      checkUserLiked(walletAddress, nft.id)
        .then(setIsLiked)
        .finally(() => setIsCheckingLike(false))
    }
  }, [walletAddress, nft.id, nft.isSupabase, checkUserLiked])

  // Reset image loading when image URL changes
  useEffect(() => {
    setImageLoading(true)
    
    // Timeout de seguridad para ocultar loading si la imagen no carga
    const timeout = setTimeout(() => {
      setImageLoading(false)
    }, 5000) // 5 segundos máximo
    
    return () => clearTimeout(timeout)
  }, [nft.image])

  const handleLike = async () => {
    if (!walletAddress) {
      alert('Conecta tu wallet para dar like y que se guarde.');
      return
    }
    if (!nft.isSupabase) {
      // Fallback al sistema anterior para items no-Supabase
      onLike?.(nft.id)
      return
    }

    try {
      if (isLiked) {
        const result = await unlikeArticle(walletAddress, nft.id)
        if (result.success) {
          setIsLiked(false)
          setLikesCount(result.likesCount || 0)
        }
      } else {
        const result = await likeArticle(walletAddress, nft.id)
        if (result.success) {
          setIsLiked(true)
          setLikesCount(result.likesCount || 0)
        }
      }
    } catch (error) {
      console.error('Error con like:', error)
    }
  }

  const isLoading = likeLoading || unlikeLoading || checkLoading || isCheckingLike

  const handleCardClick = () => {
    console.log('🖱️ Click en SupabaseNFTCard detectado');
    console.log('📍 NFT data:', {
      mint: nft.mint,
      name: nft.name,
      brand: nft.brand
    });
    console.log('📍 Navegando a:', `/nft/${nft.mint}`);
    router.push(`/nft/${nft.mint}`);
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={nft.image}
          alt={nft.name}
          className={`w-full h-48 object-cover transition-all duration-300 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            setImageLoading(false)
            e.currentTarget.src = "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image"
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {nft.verified && (
            <Badge variant="secondary" className="text-xs bg-green-500/90 text-white">
              ✓ Verified
            </Badge>
          )}
          {nft.trending && (
            <Badge variant="secondary" className="text-xs bg-orange-500/90 text-white">
              🔥 Trending
            </Badge>
          )}
          {nft.isSupabase && (
            <Badge variant="secondary" className="text-xs bg-blue-500/90 text-white">
              ⚡ Live
            </Badge>
          )}
          {/* Badge híbrido */}
          {nft.data_source === 'hybrid' && (
            <Badge variant="secondary" className="text-xs bg-purple-500/90 text-white">
              🔗 Hybrid
            </Badge>
          )}
          {/* Badge de sincronización */}
          {nft.sync_status === 'synced' && (
            <Badge variant="secondary" className="text-xs bg-green-600/90 text-white">
              ✅ Synced
            </Badge>
          )}
        </div>

        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          disabled={isLoading}
        >
          <Heart 
            className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Header con usuario si es de Supabase */}
          {nft.isSupabase && nft.username && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                {nft.avatar_url ? (
                  <img 
                    src={nft.avatar_url} 
                    alt={nft.display_name || nft.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3 h-3 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {nft.display_name || nft.username}
              </span>
            </div>
          )}

          <h3 className="font-semibold text-sm line-clamp-1">{nft.name}</h3>
          <p className="text-xs text-muted-foreground">{nft.brand}</p>
          
          {/* Información adicional para datos híbridos */}
          {nft.model && (
            <p className="text-xs text-muted-foreground">Model: {nft.model}</p>
          )}
          {nft.size && (
            <p className="text-xs text-muted-foreground">Size: {nft.size}</p>
          )}
          {nft.rarity && (
            <p className="text-xs text-muted-foreground">Rarity: {nft.rarity}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{nft.year}</span>
            <span>{nft.condition}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{nft.price}</span>
            <div className="flex items-center gap-1">
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">{likesCount}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/nft/${nft.mint}`, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: nft.name,
                    text: `Check out this ${nft.brand} NFT on UnboX`,
                    url: `${window.location.origin}/nft/${nft.mint}`
                  })
                } else {
                  navigator.clipboard.writeText(`${window.location.origin}/nft/${nft.mint}`)
                }
              }}
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
