import { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getAssetPDA } from '../config/program';

export interface UserNFT {
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
  metadata?: any;
}

export function useUserNFTs() {
  const { program, provider, isReady } = useProgram();
  const wallet = useAnchorWallet();
  const [nfts, setNfts] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNFTs = async () => {
    if (!program || !wallet || !isReady || !provider) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Buscando NFTs del usuario...');
      
      // Por ahora, vamos a simular algunos NFTs
      // En una implementación real, necesitarías:
      // 1. Obtener todos los tokens del usuario
      // 2. Filtrar solo los NFTs de nuestro programa
      // 3. Obtener los datos de cada asset account
      
      const mockNFTs: UserNFT[] = [
        {
          mint: "DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho",
          name: "Air Jordan 1 Retro High",
          symbol: "NIKE",
          uri: "https://gateway.pinata.cloud/ipfs/QmExample1",
          brand: "Nike",
          model: "Jordan 1",
          size: "US 10",
          condition: "New",
          year: 2024,
          rarity: "Rare",
          isListed: false,
          image: "https://gateway.pinata.cloud/ipfs/QmExampleImage1"
        },
        {
          mint: "DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho",
          name: "Supreme Box Logo Hoodie",
          symbol: "SUPREME",
          uri: "https://gateway.pinata.cloud/ipfs/QmExample2",
          brand: "Supreme",
          model: "Box Logo",
          size: "L",
          condition: "Used",
          year: 2023,
          rarity: "Epic",
          isListed: true,
          image: "https://gateway.pinata.cloud/ipfs/QmExampleImage2"
        }
      ];

      setNfts(mockNFTs);
      console.log('✅ NFTs cargados:', mockNFTs.length);
      
    } catch (err: any) {
      console.error('Error fetching NFTs:', err);
      setError(err.message || 'Error al cargar NFTs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet && isReady) {
      fetchUserNFTs();
    }
  }, [wallet, isReady]);

  return { nfts, loading, error, refetch: fetchUserNFTs };
}
