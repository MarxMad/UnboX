'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Store, TrendingUp, Sparkles } from 'lucide-react';
import { NFTCard } from './components/NFTCard';

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí cargarías los NFTs listados desde el programa
    // Por ahora, datos de ejemplo
    setLoading(false);
    setListings([
      {
        id: '1',
        name: 'Air Jordan 1 Retro High',
        brand: 'Nike',
        year: 2023,
        rarity: 'Legendary',
        price: 2.5,
        image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500',
        condition: 'Deadstock',
      },
      {
        id: '2',
        name: 'Box Logo Hoodie',
        brand: 'Supreme',
        year: 2022,
        rarity: 'Epic',
        price: 1.8,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        condition: 'New',
      },
      {
        id: '3',
        name: 'Dunk Low Panda',
        brand: 'Nike',
        year: 2024,
        rarity: 'Rare',
        price: 0.9,
        image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500',
        condition: 'Used',
      },
    ]);
  }, [connection, wallet]);

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
          <div className="text-4xl font-bold text-purple-400">2,847</div>
          <div className="text-gray-400 mt-2">NFTs Tokenizados</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-bold text-pink-400">1,234</div>
          <div className="text-gray-400 mt-2">Coleccionistas</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-bold text-blue-400">156 SOL</div>
          <div className="text-gray-400 mt-2">Volumen Total</div>
        </div>
      </section>

      {/* Listings Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center space-x-3">
            <Store className="w-8 h-8 text-purple-400" />
            <span>Artículos en Venta</span>
          </h2>
          <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Todos</option>
            <option>Nike</option>
            <option>Supreme</option>
            <option>Off-White</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Cargando artículos...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Store className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay artículos en venta actualmente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
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
