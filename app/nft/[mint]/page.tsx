'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { ListNFTModal } from '../../components/ListNFTModal';
import { useListNFT } from '../../hooks/useListNFT';
import { useBuyNFT } from '../../hooks/useBuyNFT';
import { useCancelListing } from '../../hooks/useCancelListing';
import { 
  ArrowLeft, 
  Calendar, 
  Award, 
  Tag, 
  User, 
  ExternalLink,
  Heart,
  Share2,
  DollarSign,
  ShoppingCart,
  XCircle,
  Loader2
} from 'lucide-react';

interface NFTDetail {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  brand: string;
  model: string;
  size: string;
  condition: string;
  year: number;
  rarity: string;
  isListed: boolean;
  image: string;
  owner: string;
  price?: number;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [nft, setNft] = useState<NFTDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // Hooks para funciones del contrato
  const { listNFT, loading: listLoading, error: listError } = useListNFT();
  const { buyNFT, loading: buyLoading, error: buyError } = useBuyNFT();
  const { cancelListing, loading: cancelLoading, error: cancelError } = useCancelListing();

  const mintAddress = params.mint as string;
  
  console.log('🔍 NFTDetailPage renderizado');
  console.log('📍 Mint address:', mintAddress);
  console.log('📍 Params:', params);

  useEffect(() => {
    if (mintAddress) {
      fetchNFTDetails();
    }
  }, [mintAddress]);

  const fetchNFTDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Obteniendo detalles del NFT:', mintAddress);

      // Importar el servicio de imágenes
      const { getImageFromMetadata } = await import('../../services/imageService');

      // Aquí implementarías la lógica para obtener los detalles del NFT desde el blockchain
      // Por ahora, vamos a simular los datos pero con imagen real de Pinata
      const mockNFT: NFTDetail = {
        mint: mintAddress,
        name: "Supreme Box Logo Hoodie",
        symbol: "SUPREME",
        uri: "https://gateway.pinata.cloud/ipfs/QmExample",
        brand: "Supreme",
        model: "Box Logo Hoodie",
        size: "L",
        condition: "Used - Excellent",
        year: 2023,
        rarity: "Rare",
        isListed: false,
        image: "https://gateway.pinata.cloud/ipfs/QmQc3YmAuVhKVA3avXjgTZAgage2EmXVLjbDJ3D11xqKsh", // Imagen real de Pinata
        owner: publicKey?.toString() || "Unknown",
        price: 850,
        description: "Classic Supreme Box Logo Hoodie in excellent condition. Perfect for streetwear enthusiasts.",
        attributes: [
          { trait_type: "Brand", value: "Supreme" },
          { trait_type: "Model", value: "Box Logo Hoodie" },
          { trait_type: "Size", value: "L" },
          { trait_type: "Condition", value: "Used - Excellent" },
          { trait_type: "Year", value: 2023 },
          { trait_type: "Rarity", value: "Rare" }
        ]
      };

      // Obtener imagen real desde metadata
      console.log('🖼️ Obteniendo imagen desde metadata...');
      const realImage = await getImageFromMetadata(mockNFT.uri);
      mockNFT.image = realImage;
      console.log('✅ Imagen obtenida:', realImage);

      setNft(mockNFT);
    } catch (err) {
      console.error('Error fetching NFT details:', err);
      setError('Error loading NFT details');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = connected && publicKey && nft && publicKey.toString() === nft.owner;

  const handleList = () => {
    setShowListModal(true);
  };

  const handleBuy = async () => {
    if (!nft || !nft.price) return;
    
    try {
      console.log(`Comprando ${nft.name} por ${nft.price} SOL`);
      const result = await buyNFT(nft.mint, nft.owner);
      console.log('✅ Compra exitosa:', result);
      
      // Mostrar notificación de éxito
      alert(`¡NFT comprado exitosamente! Transaction: ${result.signature}`);
      
      // Refrescar datos del NFT
      fetchNFTDetails();
    } catch (error) {
      console.error('Error comprando NFT:', error);
      alert(`Error al comprar NFT: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleCancelListing = async () => {
    if (!nft) return;
    
    try {
      console.log(`Cancelando listado de ${nft.name}`);
      const result = await cancelListing(nft.mint);
      console.log('✅ Listado cancelado:', result);
      
      // Mostrar notificación de éxito
      alert(`¡Listado cancelado exitosamente! Transaction: ${result.signature}`);
      
      // Refrescar datos del NFT
      fetchNFTDetails();
    } catch (error) {
      console.error('Error cancelando listado:', error);
      alert(`Error al cancelar listado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: nft?.name,
        text: `Check out this ${nft?.brand} item on UnboX`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const rarityColors: Record<string, string> = {
    Common: 'bg-gray-500',
    Uncommon: 'bg-green-500',
    Rare: 'bg-blue-500',
    Epic: 'bg-purple-500',
    Legendary: 'bg-yellow-500',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">NFT Not Found</h1>
            <p className="text-muted-foreground mb-8">The NFT you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/feed')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img 
                src={nft.image} 
                alt={nft.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLike}
                className={liked ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
                {liked ? "Liked" : "Like"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Basic Info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold">{nft.name}</h1>
                <Badge className={`${rarityColors[nft.rarity]} text-white`}>
                  <Award className="w-3 h-3 mr-1" />
                  {nft.rarity}
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground">{nft.brand} {nft.model}</p>
              <p className="text-sm text-muted-foreground">Size: {nft.size} • {nft.condition}</p>
            </div>

            <Separator />

            {/* Price and Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  {nft.isListed && nft.price ? (
                    <p className="text-3xl font-bold text-primary">{nft.price} SOL</p>
                  ) : (
                    <p className="text-lg text-muted-foreground">Not listed for sale</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={nft.isListed ? "default" : "secondary"}>
                    {nft.isListed ? "For Sale" : "Not Listed"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-semibold">{nft.year}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="font-semibold">{nft.condition}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-semibold text-sm">{nft.owner.slice(0, 8)}...{nft.owner.slice(-8)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mint</p>
                  <p className="font-semibold text-sm">{nft.mint.slice(0, 8)}...{nft.mint.slice(-8)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {nft.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{nft.description}</p>
              </div>
            )}

            {/* Attributes */}
            {nft.attributes && nft.attributes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Attributes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nft.attributes.map((attr, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{attr.trait_type}</p>
                      <p className="font-semibold">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              {isOwner ? (
                // Owner actions
                nft.isListed ? (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleCancelListing}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {cancelLoading ? 'Cancelando...' : 'Cancel Listing'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={handleList}
                    disabled={listLoading}
                  >
                    {listLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <DollarSign className="w-4 h-4 mr-2" />
                    )}
                    {listLoading ? 'Listando...' : 'List for Sale'}
                  </Button>
                )
              ) : (
                // Buyer actions
                nft.isListed && nft.price ? (
                  <Button 
                    className="w-full"
                    onClick={handleBuy}
                    disabled={buyLoading}
                  >
                    {buyLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    {buyLoading ? 'Comprando...' : `Buy for ${nft.price} SOL`}
                  </Button>
                ) : (
                  <div className="text-center text-muted-foreground">
                    This item is not available for purchase
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* List NFT Modal */}
      {showListModal && nft && (
        <ListNFTModal
          isOpen={showListModal}
          onClose={() => setShowListModal(false)}
          nft={{
            mint: nft.mint,
            name: nft.name,
            brand: nft.brand,
            model: nft.model,
            image: nft.image
          }}
          onSuccess={async (price: number) => {
            try {
              console.log(`Listando ${nft.name} por ${price} SOL`);
              const result = await listNFT(nft.mint, price);
              console.log('✅ NFT listado exitosamente:', result);
              
              // Mostrar notificación de éxito
              alert(`¡NFT listado exitosamente! Transaction: ${result.signature}`);
              
              setShowListModal(false);
              // Refresh NFT data
              fetchNFTDetails();
            } catch (error) {
              console.error('Error listando NFT:', error);
              alert(`Error al listar NFT: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }}
        />
      )}
    </div>
  );
}
