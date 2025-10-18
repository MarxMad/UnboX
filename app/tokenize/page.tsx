'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Upload, Shirt, AlertCircle, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { useTokenizeStreetwear } from '../hooks/useTokenizeStreetwear';
import { useProgram } from '../hooks/useProgram';

export default function TokenizePage() {
  const wallet = useWallet();
  const { provider } = useProgram();
  const { tokenize, loading, error } = useTokenizeStreetwear();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    size: '',
    condition: 'New',
    year: new Date().getFullYear(),
    rarity: 'Common',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [txSignature, setTxSignature] = useState<string>('');
  const [mintAddress, setMintAddress] = useState<string>('');
  const [isDevnet, setIsDevnet] = useState<boolean | null>(null);
  const [checkingNetwork, setCheckingNetwork] = useState(false);

  // Verificar si estamos en Devnet
  useEffect(() => {
    const checkNetwork = async () => {
      if (!provider?.connection) return;
      
      setCheckingNetwork(true);
      try {
        const endpoint = provider.connection.rpcEndpoint;
        const isDevnetEndpoint = endpoint.includes('devnet');
        setIsDevnet(isDevnetEndpoint);
      } catch (error) {
        console.error('Error checking network:', error);
        setIsDevnet(false);
      } finally {
        setCheckingNetwork(false);
      }
    };

    checkNetwork();
  }, []);

  // Función para cambiar a Devnet
  const switchToDevnet = async () => {
    try {
      // Intentar cambiar la red del wallet
      if (wallet && 'connect' in wallet) {
        await wallet.disconnect();
        // El usuario necesitará cambiar manualmente en su wallet
        alert('Por favor cambia tu wallet a Devnet y reconecta');
      }
    } catch (error) {
      console.error('Error switching to Devnet:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected) {
      alert('Por favor conecta tu wallet primero');
      return;
    }

    if (!formData.image) {
      alert('Por favor selecciona una imagen');
      return;
    }

    try {
      const result = await tokenize({
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        size: formData.size,
        condition: formData.condition,
        year: formData.year,
        rarity: formData.rarity,
        image: formData.image,
      });

      setTxSignature(result.signature);
      setMintAddress(result.mint);
      
      // Resetear formulario
      setFormData({
        name: '',
        brand: '',
        model: '',
        size: '',
        condition: 'New',
        year: new Date().getFullYear(),
        rarity: 'Common',
        image: null,
      });
      setImagePreview('');
    } catch (error) {
      console.error('Error tokenizing:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Tokeniza tu Streetwear
        </h1>
        <p className="text-gray-300 text-lg">
          Convierte tu artículo físico en un NFT y demuestra su autenticidad on-chain
        </p>
      </div>

      {/* Network Warning */}
      {isDevnet === false && (
        <div className="glass-card p-6 border-red-500/50 bg-red-500/5 space-y-4">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-400">⚠️ Red Incorrecta</h3>
              <p className="text-red-200">
                Tu wallet está conectado a <strong>Mainnet</strong>, pero este programa está en <strong>Devnet</strong>
              </p>
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg space-y-3">
            <p className="text-sm text-gray-300">
              <strong>Para solucionarlo:</strong>
            </p>
            <ol className="text-sm text-gray-300 space-y-1 ml-4">
              <li>1. Abre tu wallet (Phantom/Solflare)</li>
              <li>2. Ve a Configuración → Red</li>
              <li>3. Cambia a <strong>Devnet</strong></li>
              <li>4. Reconecta tu wallet</li>
            </ol>
          </div>

          <button
            onClick={switchToDevnet}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all flex items-center justify-center space-x-2"
          >
            <Wifi className="w-5 h-5" />
            <span>Cambiar a Devnet</span>
          </button>
        </div>
      )}

      {/* Network Status */}
      {isDevnet === true && (
        <div className="glass-card p-4 flex items-center space-x-3 border-green-500/50 bg-green-500/5">
          <Wifi className="w-5 h-5 text-green-400" />
          <p className="text-green-200">
            ✅ Conectado a Devnet - Listo para tokenizar
          </p>
        </div>
      )}

      {/* Checking Network */}
      {checkingNetwork && (
        <div className="glass-card p-4 flex items-center space-x-3 border-blue-500/50">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          <p className="text-blue-200">Verificando red...</p>
        </div>
      )}

      {/* Wallet Connection Warning */}
      {!wallet.connected && (
        <div className="glass-card p-4 flex items-center space-x-3 border-yellow-500/50">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-200">
            Debes conectar tu wallet para tokenizar artículos
          </p>
        </div>
      )}

      {/* Success Message */}
      {txSignature && (
        <div className="glass-card p-8 border-2 border-green-500/50 bg-green-500/5 space-y-6 animate-in">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
              <Shirt className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-400">¡NFT Tokenizado Exitosamente! 🎉</h3>
              <p className="text-gray-300">Tu artículo ha sido convertido en NFT en la blockchain de Solana</p>
            </div>
          </div>
          
          <div className="bg-black/30 p-6 rounded-lg space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">📦 Mint Address (NFT)</div>
              <div className="font-mono text-sm bg-black/50 p-3 rounded border border-green-500/30 break-all">
                {mintAddress}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">🔗 Transaction Hash</div>
              <div className="font-mono text-sm bg-black/50 p-3 rounded border border-purple-500/30 break-all">
                {txSignature}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Ver en Solana Explorer</span>
              </a>

              <a
                href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 bg-white/5 border border-white/10 px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Ver en Solscan</span>
              </a>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              💡 Puedes ver tu NFT en la sección <a href="/dashboard" className="text-purple-400 hover:underline">Mi Colección</a>
            </div>
            <button
              onClick={() => {
                setTxSignature('');
                setMintAddress('');
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              Tokenizar Otro
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="glass-card p-4 flex items-center space-x-3 border-red-500/50">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">Imagen del Artículo *</label>
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-gray-400">Haz clic o arrastra una imagen aquí</p>
                <p className="text-xs text-gray-500">PNG, JPG o WEBP (máx. 10MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre del Artículo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Air Jordan 1 Retro High"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Marca *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ej: Nike"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Modelo *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Ej: Jordan 1"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Talla *</label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="Ej: US 10, M, L"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Año *</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => {
                const year = parseInt(e.target.value);
                const maxYear = Math.max(new Date().getFullYear(), 2025);
                if (year >= 1990 && year <= maxYear) {
                  setFormData({ ...formData, year });
                }
              }}
              min="1990"
              max={Math.max(new Date().getFullYear(), 2025)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Debe estar entre 1990 y {Math.max(new Date().getFullYear(), 2025)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Condición *</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Deadstock">Deadstock (DS)</option>
              <option value="New">Nuevo (New)</option>
              <option value="Used">Usado (Used)</option>
              <option value="Vintage">Vintage</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Rareza *</label>
            <select
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Common">Común (Common)</option>
              <option value="Uncommon">Poco Común (Uncommon)</option>
              <option value="Rare">Raro (Rare)</option>
              <option value="Epic">Épico (Epic)</option>
              <option value="Legendary">Legendario (Legendary)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!wallet.connected || loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Tokenizando...</span>
            </>
          ) : (
            <>
              <Shirt className="w-5 h-5" />
              <span>Tokenizar Artículo</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Al tokenizar, aceptas que la información proporcionada es precisa y verificable
        </p>
      </form>
    </div>
  );
}

