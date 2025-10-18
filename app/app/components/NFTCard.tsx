'use client';

import { ShoppingCart, Calendar, Award } from 'lucide-react';
import Image from 'next/image';

interface NFT {
  id: string;
  name: string;
  brand: string;
  year: number;
  rarity: string;
  price: number;
  image: string;
  condition: string;
}

export const NFTCard = ({ nft }: { nft: NFT }) => {
  const rarityColors: Record<string, string> = {
    Common: 'bg-gray-500',
    Uncommon: 'bg-green-500',
    Rare: 'bg-blue-500',
    Epic: 'bg-purple-500',
    Legendary: 'bg-yellow-500',
  };

  const handleBuy = () => {
    // Aquí implementarías la lógica de compra
    alert(`Comprando ${nft.name} por ${nft.price} SOL`);
  };

  return (
    <div className="glass-card overflow-hidden group">
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
          <p className="text-gray-400 text-sm">{nft.brand}</p>
        </div>

        {/* Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{nft.year}</span>
          </div>
        </div>

        {/* Price & Buy Button */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <div className="text-xs text-gray-400">Precio</div>
            <div className="text-2xl font-bold text-purple-400">{nft.price} SOL</div>
          </div>
          <button
            onClick={handleBuy}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

