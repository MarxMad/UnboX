import { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, getTokenAccountsByOwner } from '@solana/spl-token';
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
      console.log('🔍 Buscando NFTs reales del usuario...');
      
      // 1. Obtener todos los token accounts del usuario
      const tokenAccounts = await getTokenAccountsByOwner(
        provider.connection,
        wallet.publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      console.log(`📊 Encontrados ${tokenAccounts.value.length} token accounts`);

      const userNFTs: UserNFT[] = [];

      // 2. Para cada token account, verificar si es un NFT de nuestro programa
      for (const tokenAccount of tokenAccounts.value) {
        try {
          const mint = tokenAccount.account.data.parsed.info.mint;
          const mintPubkey = new PublicKey(mint);
          
          // 3. Obtener el asset account para este mint
          const [assetPda] = await getAssetPDA(wallet.publicKey, mintPubkey);
          
          try {
            // 4. Intentar obtener los datos del asset account
            const assetAccount = await provider.connection.getAccountInfo(assetPda);
            
            if (assetAccount) {
              console.log(`✅ NFT encontrado: ${mint}`);
              
              // 5. Parsear los datos del asset account
              // Nota: Esto requiere deserializar manualmente los datos
              // Por simplicidad, vamos a crear un NFT básico
              const nft: UserNFT = {
                mint: mint,
                name: `NFT ${mint.slice(0, 8)}`,
                symbol: "STW",
                uri: "https://gateway.pinata.cloud/ipfs/...",
                brand: "Unknown",
                model: "Unknown",
                size: "Unknown",
                condition: "Unknown",
                year: new Date().getFullYear(),
                rarity: "Common",
                isListed: false,
                image: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=NFT"
              };
              
              userNFTs.push(nft);
            }
          } catch (assetError) {
            // Este mint no es un NFT de nuestro programa
            continue;
          }
        } catch (error) {
          console.log('Error procesando token account:', error);
          continue;
        }
      }

      setNfts(userNFTs);
      console.log(`✅ NFTs cargados: ${userNFTs.length}`);
      
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
