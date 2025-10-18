import { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getAssetPDA } from '../config/program';
import { uploadImageToIPFS, uploadMetadataToIPFS, createNFTMetadata } from '../services/ipfs';

interface TokenizeParams {
  name: string;
  brand: string;
  model: string;
  size: string;
  condition: string;
  year: number;
  rarity: string;
  image: File;
}

export function useTokenizeStreetwear() {
  const { program, provider, isReady } = useProgram();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenize = async (params: TokenizeParams) => {
    if (!program || !wallet || !isReady || !provider) {
      throw new Error('Wallet not connected or program not ready');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('1. Subiendo imagen a IPFS...');
      console.log('Archivo de imagen:', {
        name: params.image.name,
        size: params.image.size,
        type: params.image.type
      });
      const imageUri = await uploadImageToIPFS(params.image);
      console.log('✅ Imagen subida a Pinata:', imageUri);
      console.log('🔗 URL de imagen:', imageUri);

      console.log('2. Creando metadata...');
      const metadata = createNFTMetadata(
        params.name,
        params.brand.substring(0, 10).toUpperCase(),
        `${params.brand} ${params.model} - ${params.condition} (${params.year})`,
        imageUri,
        {
          brand: params.brand,
          model: params.model,
          size: params.size,
          condition: params.condition,
          year: params.year,
          rarity: params.rarity,
        }
      );

      console.log('📋 Metadata creado:', JSON.stringify(metadata, null, 2));

      console.log('3. Subiendo metadata a IPFS...');
      const uri = await uploadMetadataToIPFS(metadata);
      console.log('✅ Metadata subido a Pinata:', uri);
      console.log('🔗 URL de metadata:', uri);

      console.log('4. Creando mint...');
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      console.log('5. Obteniendo PDAs...');
      const [assetPda] = await getAssetPDA(wallet.publicKey, mint);
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      console.log('Mint:', mint.toString());
      console.log('Asset PDA:', assetPda.toString());
      console.log('Token Account:', tokenAccount.toString());

      console.log('6. Validando datos antes de crear instrucción...');
      
      // Validar año
      const currentYear = new Date().getFullYear();
      console.log(`📅 Validando año: ${params.year} (debe estar entre 1990 y ${currentYear})`);
      
      if (params.year < 1990 || params.year > currentYear) {
        console.error(`❌ Año inválido: ${params.year}. Debe estar entre 1990 y ${currentYear}`);
        throw new Error(`Año inválido: ${params.year}. Debe estar entre 1990 y ${currentYear}`);
      }
      
      console.log('✅ Datos validados:', {
        name: params.name,
        brand: params.brand,
        model: params.model,
        size: params.size,
        condition: params.condition,
        year: params.year,
        rarity: params.rarity
      });
      
      console.log('7. Creando instrucción con serialización manual...');
      
      // Discriminador de la instrucción tokenize_streetwear
      const discriminator = Buffer.from([5, 52, 127, 166, 66, 28, 85, 41]);
      
      // Serializar argumentos manualmente
      const argsBuffer = Buffer.alloc(0);
      
      // Serializar name (string)
      const nameBuffer = Buffer.from(params.name, 'utf8');
      const nameLengthBuffer = Buffer.alloc(4);
      nameLengthBuffer.writeUInt32LE(nameBuffer.length, 0);
      
      // Serializar symbol (string)
      const symbolBuffer = Buffer.from(metadata.symbol, 'utf8');
      const symbolLengthBuffer = Buffer.alloc(4);
      symbolLengthBuffer.writeUInt32LE(symbolBuffer.length, 0);
      
      // Serializar uri (string)
      const uriBuffer = Buffer.from(uri, 'utf8');
      const uriLengthBuffer = Buffer.alloc(4);
      uriLengthBuffer.writeUInt32LE(uriBuffer.length, 0);
      
      // Serializar brand (string)
      const brandBuffer = Buffer.from(params.brand, 'utf8');
      const brandLengthBuffer = Buffer.alloc(4);
      brandLengthBuffer.writeUInt32LE(brandBuffer.length, 0);
      
      // Serializar model (string)
      const modelBuffer = Buffer.from(params.model, 'utf8');
      const modelLengthBuffer = Buffer.alloc(4);
      modelLengthBuffer.writeUInt32LE(modelBuffer.length, 0);
      
      // Serializar size (string)
      const sizeBuffer = Buffer.from(params.size, 'utf8');
      const sizeLengthBuffer = Buffer.alloc(4);
      sizeLengthBuffer.writeUInt32LE(sizeBuffer.length, 0);
      
      // Serializar condition (string)
      const conditionBuffer = Buffer.from(params.condition, 'utf8');
      const conditionLengthBuffer = Buffer.alloc(4);
      conditionLengthBuffer.writeUInt32LE(conditionBuffer.length, 0);
      
      // Serializar year (u16)
      const yearBuffer = Buffer.alloc(2);
      yearBuffer.writeUInt16LE(params.year, 0);
      
      // Serializar rarity (enum)
      const rarityMap: Record<string, number> = {
        'Common': 0,
        'Uncommon': 1,
        'Rare': 2,
        'Epic': 3,
        'Legendary': 4,
      };
      const rarityValue = rarityMap[params.rarity] || 0;
      const rarityBuffer = Buffer.alloc(1);
      rarityBuffer.writeUInt8(rarityValue, 0);
      
      // Combinar todos los argumentos
      const allArgs = Buffer.concat([
        nameLengthBuffer, nameBuffer,
        symbolLengthBuffer, symbolBuffer,
        uriLengthBuffer, uriBuffer,
        brandLengthBuffer, brandBuffer,
        modelLengthBuffer, modelBuffer,
        sizeLengthBuffer, sizeBuffer,
        conditionLengthBuffer, conditionBuffer,
        yearBuffer,
        rarityBuffer
      ]);
      
      const instructionData = Buffer.concat([discriminator, allArgs]);
      
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: mint, isSigner: true, isWritable: true },
          { pubkey: tokenAccount, isSigner: false, isWritable: true },
          { pubkey: assetPda, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: program.programId,
        data: instructionData
      });

      console.log('7. Enviando transacción...');
      const transaction = new Transaction().add(instruction);
      
      const signature = await provider.sendAndConfirm(transaction, [mintKeypair], {
        commitment: 'confirmed',
      });

      console.log('✅ NFT Tokenizado!');
      console.log('Transaction:', signature);
      console.log('Mint Address:', mint.toString());

      return {
        signature,
        mint: mint.toString(),
        assetPda: assetPda.toString(),
      };
    } catch (err: any) {
      console.error('Error tokenizing:', err);
      setError(err.message || 'Error al tokenizar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { tokenize, loading, error };
}