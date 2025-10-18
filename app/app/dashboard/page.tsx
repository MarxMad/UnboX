'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Wallet, Package, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { MyNFTCard } from '../components/MyNFTCard';
import { useUserNFTs } from '../hooks/useUserNFTs';

export default function DashboardPage() {
  const wallet = useWallet();
  const { nfts, loading, error, refetch } = useUserNFTs();
  const [stats, setStats] = useState({
    totalNFTs: 0,
    totalValue: 0,
    listed: 0,
  });

  useEffect(() => {
    if (nfts.length > 0) {
      const listed = nfts.filter(nft => nft.isListed).length;
      setStats({
        totalNFTs: nfts.length,
        totalValue: nfts.length * 0.5, // Valor estimado
        listed: listed,
      });
    }
  }, [nfts]);

  if (!wallet.connected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-12 text-center space-y-6">
          <Wallet className="w-16 h-16 text-purple-400 mx-auto" />
          <h2 className="text-3xl font-bold">Conecta tu Wallet</h2>
          <p className="text-gray-300">
            Para ver tu colección de streetwear tokenizado, primero debes conectar tu wallet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mi Colección
        </h1>
        <p className="text-gray-300 text-lg">
          Gestiona tus artículos tokenizados
        </p>
      </div>

      {/* Wallet Info */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-sm text-gray-400">Wallet Conectada</div>
              <div className="font-mono text-sm">
                {wallet.publicKey?.toString().slice(0, 4)}...
                {wallet.publicKey?.toString().slice(-4)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refetch}
              className="bg-blue-500/20 border border-blue-500/50 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
            <button
              onClick={() => wallet.disconnect()}
              className="bg-red-500/20 border border-red-500/50 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Desconectar
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card p-4 flex items-center space-x-3 border-red-500/50">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-5 h-5 text-purple-400" />
            <div className="text-sm text-gray-400">Total de NFTs</div>
          </div>
          <div className="text-3xl font-bold">{stats.totalNFTs}</div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div className="text-sm text-gray-400">Valor Estimado</div>
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.totalValue} SOL</div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div className="text-sm text-gray-400">En Venta</div>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{stats.listed}</div>
        </div>
      </div>

      {/* NFTs Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Mis Artículos</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Cargando colección...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-4">
            <Package className="w-16 h-16 text-gray-500 mx-auto" />
            <h3 className="text-xl font-semibold">No tienes artículos tokenizados</h3>
            <p className="text-gray-400">
              Comienza tokenizando tu primer artículo de streetwear
            </p>
            <a
              href="/tokenize"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all mt-4"
            >
              Tokenizar Ahora
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft, index) => (
              <MyNFTCard key={`${nft.mint}-${index}`} nft={nft} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

