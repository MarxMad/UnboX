'use client';

import { Store, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { NFTCard } from './components/NFTCard';
import { useAllNFTs } from './hooks/useAllNFTs';

export default function Home() {
  const { allNFTs, loading, error, refetch } = useAllNFTs();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            Tokeniza tu Streetwear
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Convierte tus artículos de streetwear en NFTs, demuestra su autenticidad
            y únete al marketplace del futuro.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>0% Comisión de Marketplace</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>Autenticidad Verificada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-bold text-purple-400">{allNFTs.length}</div>
          <div className="text-gray-400 mt-2">NFTs Tokenizados</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-bold text-pink-400">{allNFTs.filter(nft => nft.isListed).length}</div>
          <div className="text-gray-400 mt-2">En Venta</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-bold text-blue-400">{allNFTs.filter(nft => nft.isListed).reduce((sum, nft) => sum + (nft.price || 0), 0).toFixed(1)} SOL</div>
          <div className="text-gray-400 mt-2">Valor Total</div>
        </div>
      </section>

      {/* Listings Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center space-x-3">
            <Store className="w-8 h-8 text-purple-400" />
            <span>Artículos en Venta</span>
          </h2>
          <div className="flex items-center space-x-4">
            <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Todos</option>
              <option>Nike</option>
              <option>Supreme</option>
              <option>Off-White</option>
            </select>
            <button
              onClick={refetch}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Cargando artículos desde la blockchain...</p>
          </div>
        ) : error ? (
          <div className="glass-card p-12 text-center">
            <div className="text-red-400 text-lg mb-4">❌ Error cargando NFTs</div>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : allNFTs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Store className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay NFTs tokenizados aún</p>
            <p className="text-gray-500 text-sm mt-2">¡Sé el primero en tokenizar tu streetwear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNFTs.map((nft) => (
              <NFTCard key={nft.mint} nft={nft} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="glass-card p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold mb-4">¿Tienes streetwear auténtico?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Tokeniza tus artículos en minutos y comienza a venderlos en nuestro marketplace
          </p>
          <a
            href="/tokenize"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
          >
            Tokenizar Ahora
          </a>
        </div>
      </section>
    </div>
  );
}
