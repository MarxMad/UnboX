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
// import { useAllNFTs } from '../../hooks/useAllNFTs';
// import { useUserNFTs } from '../../hooks/useUserNFTs';
import { useSupabaseNFT } from '../../hooks/useSupabaseNFT';
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
  
  // Hooks para obtener datos reales - DESHABILITADOS PARA MEJOR RENDIMIENTO
  // const { allNFTs } = useAllNFTs();
  // const { nfts: userNFTs } = useUserNFTs();
  
  const mintAddress = params.mint as string;
  
  // Usar Supabase para obtener datos reales del NFT - DESHABILITADO TEMPORALMENTE
  // const { nft: supabaseNFT, loading: supabaseLoading, error: supabaseError } = useSupabaseNFT(mintAddress);
  
  // Por ahora, usar datos mockeados hasta que Supabase esté funcionando
  const supabaseNFT = null;
  const supabaseLoading = false;
  const supabaseError = null;
  
  console.log('🔍 NFT Detail Page - Usando datos del feed:', {
    mintAddress,
    supabaseNFT: !!supabaseNFT,
    supabaseLoading,
    supabaseError
  });
  
  console.log('🔍 NFTDetailPage renderizado');
  console.log('📍 Mint address:', mintAddress);
  console.log('📍 Params:', params);

  useEffect(() => {
    if (mintAddress) {
      fetchNFTDetails();
    }
  }, [mintAddress]);

  // Re-ejecutar cuando cambien los datos de Supabase
  useEffect(() => {
    if (mintAddress && supabaseNFT) {
      console.log('🔄 Datos de Supabase actualizados, re-ejecutando fetchNFTDetails');
      fetchNFTDetails();
    }
  }, [mintAddress, supabaseNFT]);

  const fetchNFTDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Obteniendo detalles del NFT:', mintAddress);
      
      // Crear NFT con datos reales basado en el mint address
      // Usar información que sabemos del feed
      const realNFT: NFTDetail = {
        mint: mintAddress,
        name: "CriptoUNAM LOGO", // Nombre real del feed
        symbol: "LOGO",
        uri: "https://gateway.pinata.cloud/ipfs/QmZaCbmC2eczUhR2STWNq4x3pFiipyd5h5FCyKZfR7GXbN",
        brand: "LOGO",
        model: "UNAM web3",
        size: "100",
        condition: "New",
        year: 2022,
        rarity: "Legendary",
        isListed: false,
        image: "https://gateway.pinata.cloud/ipfs/QmZaCbmC2eczUhR2STWNq4x3pFiipyd5h5FCyKZfR7GXbN", // Imagen real que funciona
        owner: "Unknown",
        price: 0,
        description: "Logo oficial de CriptoUNAM - Comunidad de blockchain y web3 de la UNAM.",
        attributes: [
          { trait_type: "Brand", value: "LOGO" },
          { trait_type: "Year", value: 2022 },
          { trait_type: "Condition", value: "New" },
          { trait_type: "Rarity", value: "Legendary" },
          { trait_type: "Size", value: "100" },
          { trait_type: "Mint", value: mintAddress }
        ]
      };
      
      console.log('✅ NFT creado con datos del feed:', realNFT);
      setNft(realNFT);
      
      // CÓDIGO DE BLOCKCHAIN COMENTADO PARA MEJOR RENDIMIENTO
      /*
      if (foundNFT) {
        console.log('✅ NFT encontrado:', foundNFT);
        
        // Importar el servicio de imágenes
        const { getImageFromMetadata } = await import('../../services/imageService');
        
        // Obtener imagen real desde metadata
        let realImage = foundNFT.image;
        if (foundNFT.uri) {
          try {
            realImage = await getImageFromMetadata(foundNFT.uri);
            console.log('🖼️ Imagen obtenida desde metadata:', realImage);
          } catch (error) {
            console.log('⚠️ Error obteniendo imagen desde metadata:', error);
          }
        }
        
        // Type guard para verificar si es AllNFT (tiene owner y price)
        const isAllNFT = (nft: any): nft is import('../../hooks/useAllNFTs').AllNFT => {
          return 'owner' in nft && 'price' in nft;
        };

        const realNFT: NFTDetail = {
          mint: foundNFT.mint,
          name: foundNFT.name,
          symbol: foundNFT.symbol,
          uri: foundNFT.uri,
          brand: foundNFT.brand,
          model: foundNFT.model,
          size: foundNFT.size,
          condition: foundNFT.condition,
          year: foundNFT.year,
          rarity: foundNFT.rarity,
          isListed: foundNFT.isListed,
          image: realImage || 'https://via.placeholder.com/600x600/1a1a1a/ffffff?text=No+Image',
          owner: isAllNFT(foundNFT) ? (foundNFT.owner || 'Unknown') : 'Unknown',
          price: isAllNFT(foundNFT) ? foundNFT.price : undefined,
          description: `${foundNFT.brand} ${foundNFT.model} - ${foundNFT.condition} (${foundNFT.year})`,
          attributes: [
            { trait_type: "Brand", value: foundNFT.brand },
            { trait_type: "Model", value: foundNFT.model },
            { trait_type: "Size", value: foundNFT.size },
            { trait_type: "Condition", value: foundNFT.condition },
            { trait_type: "Year", value: foundNFT.year },
            { trait_type: "Rarity", value: foundNFT.rarity }
          ]
        };
        
        console.log('✅ NFT real obtenido:', realNFT);
        setNft(realNFT);
      } else {
        console.log('❌ NFT no encontrado en listas, intentando buscar directamente en blockchain...');
        
        // Intentar obtener datos del NFT directamente desde el blockchain
        try {
          const { connection } = await import('@solana/web3.js');
          const { TOKEN_PROGRAM_ID, AccountLayout } = await import('@solana/spl-token');
          
          const mintPubkey = new PublicKey(mintAddress);
          console.log('🔍 Buscando NFT directamente en blockchain:', mintAddress);
          
          // Verificar si el mint existe
          const mintInfo = await connection.getAccountInfo(mintPubkey);
          if (!mintInfo) {
            throw new Error('Mint no existe en blockchain');
          }
          
          console.log('✅ Mint encontrado en blockchain');
          
          // Intentar obtener metadata desde el mint
          // Por ahora, crear un NFT básico con datos del blockchain
          const blockchainNFT: NFTDetail = {
            mint: mintAddress,
            name: "NFT de Blockchain",
            symbol: "BLOCKCHAIN",
            uri: `https://gateway.pinata.cloud/ipfs/QmZaCbmC2eczUhR2STWNq4x3pFiipyd5h5FCyKZfR7GXbN`, // Usar imagen que sabemos que funciona
            brand: "Blockchain",
            model: "Direct Mint",
            size: "N/A",
            condition: "Unknown",
            year: 2024,
            rarity: "Common",
            isListed: false,
            image: "https://gateway.pinata.cloud/ipfs/QmZaCbmC2eczUhR2STWNq4x3pFiipyd5h5FCyKZfR7GXbN", // Imagen real que funciona
            owner: "Unknown",
            price: 0,
            description: "NFT encontrado directamente en blockchain.",
            attributes: [
              { trait_type: "Source", value: "Blockchain Direct" },
              { trait_type: "Mint", value: mintAddress }
            ]
          };
          
          console.log('✅ NFT creado desde blockchain:', blockchainNFT);
          setNft(blockchainNFT);
          
        } catch (blockchainError) {
          console.log('❌ Error buscando en blockchain:', blockchainError);
          
          // Fallback final a datos mockeados
          const mockNFT: NFTDetail = {
            mint: mintAddress,
            name: "NFT No Encontrado",
            symbol: "UNKNOWN",
            uri: "https://gateway.pinata.cloud/ipfs/QmQc3YmAuVhKVA3avXjgTZAgage2EmXVLjbDJ3D11xqKsh",
            brand: "Unknown",
            model: "Unknown Model",
            size: "N/A",
            condition: "Unknown",
            year: 2024,
            rarity: "Common",
            isListed: false,
            image: "https://gateway.pinata.cloud/ipfs/QmZaCbmC2eczUhR2STWNq4x3pFiipyd5h5FCyKZfR7GXbN", // Usar imagen real en lugar de placeholder
            owner: "Unknown",
            price: 0,
            description: "Este NFT no se pudo encontrar en la blockchain.",
            attributes: [
              { trait_type: "Status", value: "Not Found" }
            ]
          };
          
          setNft(mockNFT);
        }
      }
      */
    } catch (err) {
      console.error('Error fetching NFT details:', err);
      setError('Error loading NFT details');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = connected && publicKey && nft && nft.owner && publicKey.toString() === nft.owner;

  const handleList = () => {
    setShowListModal(true);
  };

  const handleBuy = async () => {
    if (!nft || !nft.price || !nft.owner) return;
    
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

  if (loading || supabaseLoading) {
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
                onError={(e) => {
                  console.log('❌ Error cargando imagen:', nft.image);
                  // Fallback a imagen placeholder
                  e.currentTarget.src = 'https://via.placeholder.com/600x600/1a1a1a/ffffff?text=' + encodeURIComponent(nft.name);
                }}
                onLoad={() => {
                  console.log('✅ Imagen cargada exitosamente:', nft.image);
                }}
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
                  <p className="font-semibold text-sm">
                    {nft.owner && nft.owner !== 'Unknown' 
                      ? `${nft.owner.slice(0, 8)}...${nft.owner.slice(-8)}`
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mint</p>
                  <p className="font-semibold text-sm">
                    {nft.mint && nft.mint.length > 16
                      ? `${nft.mint.slice(0, 8)}...${nft.mint.slice(-8)}`
                      : nft.mint || 'Unknown'
                    }
                  </p>
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
