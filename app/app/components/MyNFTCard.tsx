'use client';

import { useState } from 'react';
import { DollarSign, XCircle, Award, Calendar } from 'lucide-react';

interface MyNFT {
  id: string;
  name: string;
  brand: string;
  year: number;
  rarity: string;
  isListed: boolean;
  listPrice?: number;
  image: string;
  condition: string;
}

export const MyNFTCard = ({ nft }: { nft: MyNFT }) => {
  const [showListModal, setShowListModal] = useState(false);
  const [listPrice, setListPrice] = useState('');

  const rarityColors: Record<string, string> = {
    Common: 'bg-gray-500',
    Uncommon: 'bg-green-500',
    Rare: 'bg-blue-500',
    Epic: 'bg-purple-500',
    Legendary: 'bg-yellow-500',
  };

  const handleList = () => {
    // Aquí implementarías la lógica para listar el NFT
    console.log(`Listing ${nft.name} for ${listPrice} SOL`);
    alert(`NFT listado por ${listPrice} SOL`);
    setShowListModal(false);
    setListPrice('');
  };

  const handleCancelListing = () => {
    // Aquí implementarías la lógica para cancelar el listado
    console.log(`Cancelling listing for ${nft.name}`);
    alert('Listado cancelado');
  };

  return (
    <>
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
            <p className="text-gray-400 text-sm">{nft.brand}</p>
          </div>

          {/* Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{nft.year}</span>
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
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Vender</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-8 max-w-md w-full space-y-6">
            <h3 className="text-2xl font-bold">Listar para Venta</h3>
            <p className="text-gray-300">
              Establece el precio para <span className="font-semibold">{nft.name}</span>
            </p>

            <div>
              <label className="block text-sm font-semibold mb-2">Precio (SOL)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowListModal(false)}
                className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleList}
                disabled={!listPrice || parseFloat(listPrice) <= 0}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

