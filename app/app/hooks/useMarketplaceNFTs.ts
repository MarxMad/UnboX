import { useState, useEffect, useCallback } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { useProgram } from './useProgram';

export interface MarketplaceNFT {
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
  image: string;
  owner: string;
  price?: number; // Precio si está listado
}

export function useMarketplaceNFTs() {
  const [marketplaceNFTs, setMarketplaceNFTs] = useState<MarketplaceNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wallet = useAnchorWallet();
  const { provider } = useProgram();

  const fetchMarketplaceNFTs = useCallback(async () => {
    if (!wallet || !provider) {
      console.log('useMarketplaceNFTs - Wallet o provider no disponible');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('🛒 Iniciando búsqueda de NFTs del marketplace...');

    try {
      const userNFTs: MarketplaceNFT[] = [];

      // 1. Obtener todos los token accounts del usuario
      console.log('1. Obteniendo token accounts del usuario...');
      const tokenAccounts = await provider.connection.getTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      console.log(`📊 Token accounts encontrados: ${tokenAccounts.value.length}`);

      // 2. Procesar cada token account
      for (let i = 0; i < tokenAccounts.value.length; i++) {
        const tokenAccount = tokenAccounts.value[i];
        // Manejar tanto datos parsed como raw
        let mint: PublicKey;
        const accountData = tokenAccount.account.data;
        
        if (typeof accountData === 'object' && 'parsed' in accountData) {
          // Datos parsed
          const parsedData = accountData as { parsed: { info?: { mint: string }; mint?: string } };
          const mintString = parsedData.parsed.info?.mint || parsedData.parsed.mint;
          if (!mintString) {
            console.log(`⚠️ No se encontró mint en datos parsed, saltando...`);
            continue;
          }
          mint = new PublicKey(mintString);
        } else {
          // Para datos raw, necesitamos parsear manualmente usando AccountLayout
          const rawData = accountData as Buffer;
          const decoded = AccountLayout.decode(rawData);
          mint = new PublicKey(decoded.mint);
        }
        
        console.log(`\n🔍 Procesando token account ${i + 1}/${tokenAccounts.value.length}`);
        console.log(`📍 Mint: ${mint.toString()}`);

        try {
          // Verificar si el mint es válido
          if (!mint || mint.toString() === '11111111111111111111111111111111') {
            console.log(`⚠️ Mint inválido, saltando...`);
            continue;
          }

          // Obtener el PDA del asset account
          const [assetPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('streetwear_asset'), mint.toBuffer()],
            new PublicKey('DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho')
          );

          console.log(`🔗 Asset PDA: ${assetPda.toString()}`);

          // Verificar si existe el asset account
          const assetAccountInfo = await provider.connection.getAccountInfo(assetPda);
          if (!assetAccountInfo) {
            console.log(`⚠️ Asset account no existe para mint ${mint.toString()}, saltando...`);
            continue;
          }

          console.log(`✅ Asset account encontrado, deserializando...`);

          // Deserializar datos del asset account
          const accountData = assetAccountInfo.data;
          let offset = 8; // Skip discriminator

          // Leer owner (32 bytes)
          const owner = new PublicKey(accountData.slice(offset, offset + 32));
          offset += 32;

          // Leer mint (32 bytes) - no lo usamos pero mantenemos el offset
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
          offset += 1;

          // Leer is_listed (u8)
          const isListed = accountData.readUInt8(offset) === 1;
          offset += 1;

          // Leer bump (u8) - no lo usamos pero mantenemos el offset
          offset += 1;

          // Leer uri (string)
          const uriLength = accountData.readUInt32LE(offset);
          offset += 4;
          const uri = accountData.slice(offset, offset + uriLength).toString('utf8');

          console.log(`📋 Datos del NFT:`, {
            name, brand, model, size, condition, year, rarity, isListed, owner: owner.toString()
          });

          // Validar URI
          let realImage = "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Loading...";
          
          if (uri && uri.length > 0 && !uri.includes('\0') && uri.startsWith('http')) {
            try {
              console.log(`🔍 Leyendo metadata desde IPFS: ${uri}`);
              const metadataResponse = await fetch(uri);
              if (metadataResponse.ok) {
                const metadata = await metadataResponse.json();
                if (metadata.image) {
                  realImage = metadata.image;
                  console.log(`🖼️ Imagen encontrada: ${realImage}`);
                }
              }
            } catch (metadataError) {
              console.log(`❌ Error leyendo metadata:`, metadataError);
            }
          }

          // Crear NFT para marketplace
          const marketplaceNFT: MarketplaceNFT = {
            mint: mint.toString(),
            name: name,
            symbol: brand.substring(0, 10).toUpperCase(),
            uri: uri,
            brand: brand,
            model: model,
            size: size,
            condition: condition,
            year: year,
            rarity: rarity,
            isListed: isListed,
            image: realImage,
            owner: owner.toString(),
            price: isListed ? Math.random() * 5 + 0.5 : undefined // Precio mock por ahora
          };

          userNFTs.push(marketplaceNFT);
          console.log(`✅ NFT agregado al marketplace: ${marketplaceNFT.name} (${marketplaceNFT.brand} ${marketplaceNFT.model}) - Listed: ${marketplaceNFT.isListed}`);

        } catch (error) {
          console.error(`❌ Error procesando token account ${i + 1}:`, error);
        }
      }

      console.log(`\n🎉 NFTs del marketplace cargados: ${userNFTs.length}`);
      setMarketplaceNFTs(userNFTs);

    } catch (error) {
      console.error('❌ Error obteniendo NFTs del marketplace:', error);
      setError('Error cargando NFTs del marketplace');
    } finally {
      setLoading(false);
    }
  }, [wallet, provider]);

  useEffect(() => {
    if (wallet && provider) {
      fetchMarketplaceNFTs();
    }
  }, [wallet, provider, fetchMarketplaceNFTs]);

  return {
    marketplaceNFTs,
    loading,
    error,
    refetch: fetchMarketplaceNFTs
  };
}
