'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Calendar, Award, List, X } from 'lucide-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { ListNFTModal } from './ListNFTModal';

interface MarketplaceNFT {
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
}

export const NFTCard = ({ nft }: { nft: MarketplaceNFT }) => {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const [showListModal, setShowListModal] = useState(false);
  const rarityColors: Record<string, string> = {
    Common: 'bg-gray-500',
    Uncommon: 'bg-green-500',
    Rare: 'bg-blue-500',
    Epic: 'bg-purple-500',
    Legendary: 'bg-yellow-500',
  };

  const isOwner = wallet && wallet.publicKey?.toString() === nft.owner;

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague al click de la tarjeta
    // Aquí implementarías la lógica de compra
    alert(`Comprando ${nft.name} por ${nft.price} SOL`);
  };

  const handleList = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague al click de la tarjeta
    setShowListModal(true);
  };

  const handleListSuccess = () => {
    // Refrescar la página o actualizar el estado
    window.location.reload();
  };

  const handleDelist = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague al click de la tarjeta
    // Aquí implementarías la lógica de deslistar
    alert(`Deslistando ${nft.name}`);
  };

  const handleCardClick = () => {
    console.log('🖱️ Click en tarjeta detectado');
    console.log('📍 Navegando a:', `/nft/${nft.mint}`);
    router.push(`/nft/${nft.mint}`);
  };

  return (
    <div 
      className="glass-card overflow-hidden group cursor-pointer" 
      onClick={handleCardClick}
      style={{ position: 'relative', zIndex: 1 }}
    >
      {/* Image */}
      <div className="relative h-64 bg-gray-800 overflow-hidden">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className={`absolute top-4 right-4 ${rarityColors[nft.rarity]} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
          <Award className="w-3 h-3" />
          <span>{nft.rarity}</span>
        </div>
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
          {nft.condition}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-xl font-bold mb-1">{nft.name}</h3>
          <p className="text-gray-400 text-sm">{nft.brand} {nft.model}</p>
          <p className="text-gray-500 text-xs">Talla: {nft.size}</p>
        </div>

        {/* Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{nft.year}</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            {nft.isListed && nft.price ? (
              <>
                <div className="text-xs text-gray-400">Precio</div>
                <div className="text-2xl font-bold text-purple-400">{nft.price} SOL</div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No listado</div>
            )}
          </div>
          
          {/* Botón según el propietario y estado */}
          {isOwner ? (
            // Botones para el propietario
            nft.isListed ? (
              <button
                onClick={handleDelist}
                className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Deslistar</span>
              </button>
            ) : (
              <button
                onClick={handleList}
                className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 flex items-center space-x-2 text-white"
              >
                <List className="w-4 h-4" />
                <span>Listar</span>
              </button>
            )
          ) : (
            // Botón de compra para otros usuarios
            nft.isListed && nft.price ? (
              <button
                onClick={handleBuy}
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Comprar</span>
              </button>
            ) : (
              <div className="text-sm text-gray-500 px-6 py-3">No disponible</div>
            )
          )}
        </div>
      </div>

      {/* List NFT Modal */}
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
        onSuccess={handleListSuccess}
      />
    </div>
  );
};

