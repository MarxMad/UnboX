import { useState, useEffect, useCallback } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getAssetPDA } from '../config/program';
import { getImageFromMetadata } from '../services/imageService';
import { supabase } from '@/lib/supabase';

// RPC endpoints de respaldo (comentado por ahora)
// const FALLBACK_RPC_ENDPOINTS = [
//   'https://api.devnet.solana.com',
//   'https://devnet.helius-rpc.com/?api-key=',
//   'https://rpc-devnet.helius.xyz/?api-key=',
//   'https://devnet.genesysgo.com'
// ];

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
  metadata?: Record<string, unknown>;
}

// Función para obtener imagen desde Supabase cuando el URI apunta a nuestra app
const getImageFromSupabase = async (mint: string): Promise<string> => {
  try {
    console.log(`🔍 Buscando imagen en Supabase para mint: ${mint}`);
    
    const { data, error } = await supabase
      .from('articles')
      .select('image_url')
      .eq('nft_mint', mint)
      .single();
    
    if (error || !data) {
      console.log(`⚠️ No se encontró imagen en Supabase para mint: ${mint}`);
      return 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image';
    }
    
    console.log(`✅ Imagen encontrada en Supabase para mint: ${mint}`);
    return data.image_url || 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image';
  } catch (error) {
    console.error(`❌ Error obteniendo imagen desde Supabase:`, error);
    return 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image';
  }
};

export function useUserNFTs() {
  const { program, provider, isReady } = useProgram();
  const wallet = useAnchorWallet();
  const [nfts, setNfts] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNFTs = useCallback(async () => {
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
        const accountData = account.account.data;
        console.log(`Token Account ${index + 1}:`, {
          hasData: !!accountData,
          hasParsed: typeof accountData === 'object' && 'parsed' in accountData,
          dataType: typeof accountData === 'object' && 'parsed' in accountData ? 'parsed' : 'raw'
        });
      });
      
      const userNFTs: UserNFT[] = [];
      
      for (const tokenAccount of tokenAccounts.value) {
        try {
          let mint: string;
          
          // Manejar tanto datos parsed como raw
          const accountData = tokenAccount.account.data;
          
          if (typeof accountData === 'object' && 'parsed' in accountData) {
            // Datos ya parseados
            const parsedData = accountData as { parsed: { info?: { mint: string } } };
            if (parsedData.parsed.info?.mint) {
              mint = parsedData.parsed.info.mint;
              console.log(`📋 Token account con datos parsed, mint: ${mint}`);
            } else {
              console.log(`⚠️ Token account parsed sin mint válido, saltando...`);
              continue;
            }
          } else {
            // Datos raw - necesitamos parsear manualmente
            console.log(`🔧 Token account con datos raw, parseando manualmente...`);
            
            try {
              // Parsear datos raw usando AccountLayout
              const accountData = tokenAccount.account.data;
              const parsed = AccountLayout.decode(accountData);
              mint = parsed.mint.toString();
              console.log(`✅ Token account raw parseado, mint: ${mint}`);
            } catch (parseError) {
              console.log(`❌ Error parseando token account raw:`, parseError);
              continue;
            }
          }
          
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
                
                // Leer symbol (string)
                const symbolLength = accountData.readUInt32LE(offset);
                offset += 4;
                const symbol = accountData.slice(offset, offset + symbolLength).toString('utf8');
                offset += symbolLength;
                
                // Leer uri (string) - ¡Está aquí, no al final!
                const uriLength = accountData.readUInt32LE(offset);
                offset += 4;
                const uri = accountData.slice(offset, offset + uriLength).toString('utf8');
                offset += uriLength;
                
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
                offset += 1;
                
                // Leer is_listed (u8)
                const isListed = accountData.readUInt8(offset) === 1;
                offset += 1;
                
                // Leer bump (u8)
                const bump = accountData.readUInt8(offset);
                offset += 1;
                
                // Ya leímos uri arriba, continuamos con el resto
                
                // Validar que la URI sea válida
                if (!uri || uri.length === 0 || uri.includes('\0') || !uri.startsWith('http')) {
                  console.log(`⚠️ URI inválida detectada: "${uri}", usando fallback`);
                  // Usar datos básicos sin metadata
                  const nft: UserNFT = {
                    mint: mint,
                    name: name,
                    symbol: brand.substring(0, 10).toUpperCase(),
                    uri: "https://gateway.pinata.cloud/ipfs/...",
                    brand: brand,
                    model: model,
                    size: size,
                    condition: condition,
                    year: year,
                    rarity: rarity,
                    isListed: isListed,
                    image: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image"
                  };
                  
                  userNFTs.push(nft);
                  console.log(`✅ NFT agregado con datos básicos: ${nft.name} (${nft.brand} ${nft.model})`);
                  continue;
                }
                
                console.log(`📋 Datos reales leídos:`, {
                  name, brand, model, size, condition, year, rarity, uri, isListed
                });
                
                // Obtener imagen - usar Supabase si el URI apunta a nuestra app
                console.log(`🖼️ Obteniendo imagen para NFT: ${name}`);
                let realImage: string;
                
                if (uri.startsWith('https://unbox.app/nft/')) {
                  // URI apunta a nuestra app, obtener imagen desde Supabase
                  realImage = await getImageFromSupabase(mint);
                } else {
                  // URI es IPFS real, usar imageService
                  realImage = await getImageFromMetadata(uri);
                }
                
                console.log(`✅ Imagen obtenida: ${realImage}`);
                
                // Crear NFT con datos reales
                const nft: UserNFT = {
                  mint: mint,
                  name: name,
                  symbol: brand.substring(0, 10).toUpperCase(),
                  uri: uri, // URI real del metadata
                  brand: brand,
                  model: model,
                  size: size,
                  condition: condition,
                  year: year,
                  rarity: rarity,
                  isListed: isListed, // Estado real de listado
                  image: realImage // Imagen real extraída del metadata
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
      
    } catch (err: unknown) {
      console.error('❌ Error fetching NFTs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar NFTs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [program, wallet, isReady, provider]);

  useEffect(() => {
    if (wallet && isReady) {
      fetchUserNFTs();
    }
  }, [wallet, isReady, fetchUserNFTs]);

  return { nfts, loading, error, refetch: fetchUserNFTs };
}
