'use client';

import { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { useListNFT } from '../hooks/useListNFT';

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: {
    mint: string;
    name: string;
    brand: string;
    model: string;
    image: string;
  };
  onSuccess: () => void;
}

export const ListNFTModal = ({ isOpen, onClose, nft, onSuccess }: ListNFTModalProps) => {
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { listNFT, loading, error } = useListNFT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🚀 Listando NFT:', nft.name, 'por', priceValue, 'SOL');
      
      const result = await listNFT({
        mint: nft.mint,
        price: priceValue
      });

      console.log('✅ NFT listado exitosamente:', result);
      
      // Mostrar éxito
      alert(`¡NFT listado exitosamente por ${priceValue} SOL!\n\nTransacción: ${result.signature}`);
      
      // Cerrar modal y refrescar
      onClose();
      onSuccess();
      
    } catch (error) {
      console.error('❌ Error listando NFT:', error);
      alert(`Error al listar NFT: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold">Listar NFT para Venta</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* NFT Info */}
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold">{nft.name}</h3>
              <p className="text-sm text-gray-400">{nft.brand} {nft.model}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Precio en SOL *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Precio mínimo: 0.01 SOL
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting || !price}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading || isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Listando...</span>
                  </>
                ) : (
                  <span>Listar NFT</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
