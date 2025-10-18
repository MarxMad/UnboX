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
      console.log('🔍 Buscando NFTs reales del usuario...');
      console.log('👤 Wallet:', wallet.publicKey?.toString());
      console.log('🔗 Connection:', provider.connection.rpcEndpoint);
      
      // 1. Obtener todos los token accounts del usuario
      const tokenAccounts = await provider.connection.getTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      console.log(`📊 Encontrados ${tokenAccounts.value.length} token accounts`);
      
      // Debug: Mostrar todos los token accounts
      tokenAccounts.value.forEach((account, index) => {
        const mint = account.account.data.parsed.info.mint;
        const amount = account.account.data.parsed.info.tokenAmount.amount;
        console.log(`Token ${index + 1}:`, {
          mint: mint,
          amount: amount,
          owner: account.account.data.parsed.info.owner
        });
      });

      const userNFTs: UserNFT[] = [];

      // 2. Para cada token account, verificar si es un NFT de nuestro programa
      for (const tokenAccount of tokenAccounts.value) {
        try {
          const mint = tokenAccount.account.data.parsed.info.mint;
          const mintPubkey = new PublicKey(mint);
          
          console.log(`🔍 Verificando mint: ${mint}`);
          
          // 3. Obtener el asset account para este mint
          const [assetPda] = await getAssetPDA(wallet.publicKey, mintPubkey);
          console.log(`📍 Asset PDA: ${assetPda.toString()}`);
          
          try {
            // 4. Intentar obtener los datos del asset account
            const assetAccount = await provider.connection.getAccountInfo(assetPda);
            console.log(`📋 Asset account existe:`, !!assetAccount);
            
            if (assetAccount) {
              console.log(`✅ NFT encontrado: ${mint}`);
              console.log(`📊 Asset account data length:`, assetAccount.data.length);
              
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
            } else {
              console.log(`❌ No es un NFT de nuestro programa: ${mint}`);
            }
          } catch (assetError) {
            console.log(`❌ Error verificando asset account para ${mint}:`, assetError);
            // Este mint no es un NFT de nuestro programa
            continue;
          }
        } catch (error) {
          console.log('❌ Error procesando token account:', error);
          continue;
        }
      }

      setNfts(userNFTs);
      console.log(`✅ NFTs cargados: ${userNFTs.length}`);
      
      if (userNFTs.length === 0) {
        console.log('⚠️ No se encontraron NFTs. Posibles causas:');
        console.log('1. Los NFTs no se mintearon correctamente');
        console.log('2. El asset account no existe');
        console.log('3. El PDA calculation está mal');
        console.log('4. Los NFTs están en otra wallet');
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching NFTs:', err);
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
