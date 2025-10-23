'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, XCircle, Award, Calendar } from 'lucide-react';
import { ListNFTModal } from './ListNFTModal';

interface MyNFT {
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
  image?: string;
  metadata?: Record<string, unknown>;
  listPrice?: number;
}

export const MyNFTCard = ({ nft }: { nft: MyNFT }) => {
  const router = useRouter();
  const [showListModal, setShowListModal] = useState(false);

  const rarityColors: Record<string, string> = {
    Common: 'bg-gray-500',
    Uncommon: 'bg-green-500',
    Rare: 'bg-blue-500',
    Epic: 'bg-purple-500',
    Legendary: 'bg-yellow-500',
  };

  const handleListSuccess = () => {
    setShowListModal(false);
    // Refrescar la página o actualizar el estado
    window.location.reload();
  };

  const handleCancelListing = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague al click de la tarjeta
    // Aquí implementarías la lógica para cancelar el listado
    console.log(`Cancelling listing for ${nft.name}`);
    alert('Listado cancelado');
  };

  const handleCardClick = () => {
    console.log('🖱️ Click en tarjeta MyNFT detectado');
    console.log('📍 Navegando a:', `/nft/${nft.mint}`);
    router.push(`/nft/${nft.mint}`);
  };

  return (
    <>
      <div 
        className="glass-card overflow-hidden group cursor-pointer" 
        onClick={handleCardClick}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Image */}
        <div className="relative h-64 bg-gray-800 overflow-hidden">
          <img
            src={nft.image || 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image'}
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
          {nft.isListed && (
            <div className="absolute bottom-4 left-4 right-4 bg-green-500/90 backdrop-blur-sm px-3 py-2 rounded-lg text-center font-semibold">
              🔥 En Venta - {nft.listPrice} SOL
            </div>
          )}
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
            <div className="text-xs">
              <span className="text-gray-500">Mint:</span> {nft.mint.slice(0, 4)}...{nft.mint.slice(-4)}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            {nft.isListed ? (
              <button
                onClick={handleCancelListing}
                className="w-full bg-red-500/20 border border-red-500/50 px-4 py-3 rounded-lg font-semibold hover:bg-red-500/30 transition-all flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelar Venta</span>
              </button>
            ) : (
              <button
                onClick={() => setShowListModal(true)}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all flex items-center justify-center space-x-2 text-white"
              >
                <DollarSign className="w-4 h-4" />
                <span>Vender</span>
              </button>
            )}
          </div>
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
          image: nft.image || 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image'
        }}
        onSuccess={handleListSuccess}
      />
    </>
  );
};

