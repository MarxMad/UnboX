import { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getAssetPDA } from '../config/program';

// RPC endpoints de respaldo
const FALLBACK_RPC_ENDPOINTS = [
  'https://api.devnet.solana.com',
  'https://devnet.helius-rpc.com/?api-key=',
  'https://rpc-devnet.helius.xyz/?api-key=',
  'https://devnet.genesysgo.com'
];

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
      
      // MÉTODO REAL: Buscar todos los NFTs del usuario y leer datos reales
      console.log('🔍 Buscando todos los token accounts del usuario...');
      
      const tokenAccounts = await provider.connection.getTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      console.log(`📊 Encontrados ${tokenAccounts.value.length} token accounts`);
      
      // Debug: Mostrar estructura de los token accounts
      tokenAccounts.value.forEach((account, index) => {
        console.log(`Token Account ${index + 1}:`, {
          hasData: !!account.account.data,
          hasParsed: !!account.account.data.parsed,
          hasInfo: !!account.account.data.parsed?.info,
          dataType: account.account.data.parsed ? 'parsed' : 'raw'
        });
      });
      
      const userNFTs: UserNFT[] = [];
      
      for (const tokenAccount of tokenAccounts.value) {
        try {
          // Validar que el token account tenga la estructura esperada
          if (!tokenAccount.account.data.parsed || !tokenAccount.account.data.parsed.info) {
            console.log(`⚠️ Token account sin estructura parsed.info, saltando...`);
            continue;
          }
          
          const mint = tokenAccount.account.data.parsed.info.mint;
          const mintPubkey = new PublicKey(mint);
          
          console.log(`🔍 Verificando mint: ${mint}`);
          
          // Obtener el asset account para este mint
          const [assetPda] = await getAssetPDA(wallet.publicKey, mintPubkey);
          console.log(`📍 Asset PDA: ${assetPda.toString()}`);
          
          try {
            // Intentar obtener los datos del asset account
            const assetAccount = await provider.connection.getAccountInfo(assetPda);
            
            if (assetAccount) {
              console.log(`✅ NFT encontrado: ${mint}`);
              console.log(`📊 Asset account data length:`, assetAccount.data.length);
              
              // DESERIALIZAR DATOS REALES DEL ASSET ACCOUNT
              try {
                const accountData = assetAccount.data;
                console.log(`🔍 Deserializando datos del asset account...`);
                
                // Leer datos según la estructura del programa
                let offset = 8; // Skip discriminator
                
                // Leer owner (32 bytes)
                const owner = new PublicKey(accountData.slice(offset, offset + 32));
                offset += 32;
                
                // Leer mint (32 bytes)
                const mintFromData = new PublicKey(accountData.slice(offset, offset + 32));
                offset += 32;
                
                // Leer name (string)
                const nameLength = accountData.readUInt32LE(offset);
                offset += 4;
                const name = accountData.slice(offset, offset + nameLength).toString('utf8');
                offset += nameLength;
                
                // Leer brand (string)
                const brandLength = accountData.readUInt32LE(offset);
                offset += 4;
                const brand = accountData.slice(offset, offset + brandLength).toString('utf8');
                offset += brandLength;
                
                // Leer model (string)
                const modelLength = accountData.readUInt32LE(offset);
                offset += 4;
                const model = accountData.slice(offset, offset + modelLength).toString('utf8');
                offset += modelLength;
                
                // Leer size (string)
                const sizeLength = accountData.readUInt32LE(offset);
                offset += 4;
                const size = accountData.slice(offset, offset + sizeLength).toString('utf8');
                offset += sizeLength;
                
                // Leer condition (string)
                const conditionLength = accountData.readUInt32LE(offset);
                offset += 4;
                const condition = accountData.slice(offset, offset + conditionLength).toString('utf8');
                offset += conditionLength;
                
                // Leer year (u16)
                const year = accountData.readUInt16LE(offset);
                offset += 2;
                
                // Leer rarity (u8)
                const rarityValue = accountData.readUInt8(offset);
                const rarityMap = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
                const rarity = rarityMap[rarityValue] || 'Common';
                
                console.log(`📋 Datos reales leídos:`, {
                  name, brand, model, size, condition, year, rarity
                });
                
                // Crear NFT con datos reales
                const nft: UserNFT = {
                  mint: mint,
                  name: name,
                  symbol: brand.substring(0, 10).toUpperCase(),
                  uri: "https://gateway.pinata.cloud/ipfs/...", // TODO: Leer URI real
                  brand: brand,
                  model: model,
                  size: size,
                  condition: condition,
                  year: year,
                  rarity: rarity,
                  isListed: false,
                  image: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Real+NFT" // TODO: Leer imagen real
                };
                
                userNFTs.push(nft);
                console.log(`✅ NFT agregado con datos reales: ${nft.name} (${nft.brand} ${nft.model})`);
                
              } catch (deserializeError) {
                console.error(`❌ Error deserializando asset account:`, deserializeError);
                
                // Fallback: crear NFT con datos básicos
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
                  image: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Parse+Error"
                };
                
                userNFTs.push(nft);
                console.log(`✅ NFT agregado con datos básicos: ${nft.name}`);
              }
            } else {
              console.log(`❌ No es un NFT de nuestro programa: ${mint}`);
            }
          } catch (assetError) {
            console.log(`❌ Error verificando asset account para ${mint}:`, assetError);
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
        console.log('⚠️ No se encontraron NFTs en los Asset Accounts conocidos');
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
