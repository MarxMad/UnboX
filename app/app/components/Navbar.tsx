'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { Shirt, Store, User } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="bg-black/30 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Shirt className="w-6 h-6" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              UnboX
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="hover:text-purple-400 transition-colors flex items-center space-x-2"
            >
              <Store className="w-5 h-5" />
              <span>Marketplace</span>
            </Link>
            <Link 
              href="/tokenize" 
              className="hover:text-purple-400 transition-colors flex items-center space-x-2"
            >
              <Shirt className="w-5 h-5" />
              <span>Tokenizar</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="hover:text-purple-400 transition-colors flex items-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Mi Colección</span>
            </Link>
          </div>

          {/* Wallet Connect Button */}
          <div className="wallet-adapter-button-container">
            <WalletMultiButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around mt-4 space-x-4">
          <Link 
            href="/" 
            className="flex flex-col items-center space-y-1 hover:text-purple-400 transition-colors"
          >
            <Store className="w-5 h-5" />
            <span className="text-xs">Market</span>
          </Link>
          <Link 
            href="/tokenize" 
            className="flex flex-col items-center space-y-1 hover:text-purple-400 transition-colors"
          >
            <Shirt className="w-5 h-5" />
            <span className="text-xs">Tokenizar</span>
          </Link>
          <Link 
            href="/dashboard" 
            className="flex flex-col items-center space-y-1 hover:text-purple-400 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Colección</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

