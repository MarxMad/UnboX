import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  Keypair, 
  SystemProgram, 
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getAssetPDA } from '../config/program';
import { uploadImageToIPFS, uploadMetadataToIPFS, createNFTMetadata, mockUploadToIPFS, mockUploadMetadataToIPFS } from '../services/ipfs';

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
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenize = async (params: TokenizeParams) => {
    console.log('🚀 Iniciando tokenización simplificada...');
    console.log('Wallet:', publicKey?.toString());
    console.log('Connection:', !!connection);
    
    if (!publicKey || !connection) {
      throw new Error('Wallet no conectado');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📸 1. Subiendo imagen...');
      // Usar Pinata si las API keys están disponibles, sino usar mock
      const hasPinataKeys = process.env.NEXT_PUBLIC_PINATA_API_KEY && process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
      const imageUri = hasPinataKeys 
        ? await uploadImageToIPFS(params.image)
        : await mockUploadToIPFS(params.image);
      console.log('✅ Imagen subida');

      console.log('📋 2. Creando metadata...');
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

      console.log('📤 3. Subiendo metadata...');
      const uri = hasPinataKeys 
        ? await uploadMetadataToIPFS(metadata)
        : await mockUploadMetadataToIPFS(metadata);
      console.log('✅ Metadata subido');

      console.log('4. Creando mint...');
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      console.log('5. Obteniendo PDAs...');
      const [assetPda] = await getAssetPDA(publicKey, mint);
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        publicKey
      );

      console.log('Mint:', mint.toString());
      console.log('Asset PDA:', assetPda.toString());
      console.log('Token Account:', tokenAccount.toString());

      console.log('6. Validando datos antes de crear instrucción...');
      
      // Validar año
      const currentYear = new Date().getFullYear();
      const maxYear = Math.max(currentYear, 2025); // Permitir hasta 2025
      console.log(`📅 Validando año: ${params.year} (debe estar entre 1990 y ${maxYear})`);
      
      if (params.year < 1990 || params.year > maxYear) {
        console.error(`❌ Año inválido: ${params.year}. Debe estar entre 1990 y ${maxYear}`);
        throw new Error(`Año inválido: ${params.year}. Debe estar entre 1990 y ${maxYear}`);
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
          { pubkey: publicKey, isSigner: true, isWritable: true },
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

      console.log('7. Preparando transacción...');
      const transaction = new Transaction();
      transaction.add(instruction);
      transaction.feePayer = publicKey;
      
      // Obtener blockhash reciente con timeout
      console.log('🔗 8. Obteniendo blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      
      // Firmar con mintKeypair
      transaction.partialSign(mintKeypair);
      
      console.log('✍️ 9. Firmando con mint keypair...');
      console.log('📤 10. Enviando transacción...');
      
      // Enviar transacción con manejo de timeout
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
      
      console.log('⏳ Esperando confirmación del wallet...');
      console.log('✅ Transacción enviada:', signature);
      console.log('⏳ 11. Esperando confirmación en blockchain...');
      
      // Confirmar con timeout y retry
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ NFT Tokenizado exitosamente!');
      console.log('📝 Transaction:', signature);
      console.log('🎨 Mint Address:', mint.toString());
      console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      return {
        signature,
        mint: mint.toString(),
        assetPda: assetPda.toString(),
      };
    } catch (err: unknown) {
      console.error('❌ Error tokenizing:', err);
      
      let errorMessage = 'Error al tokenizar';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Mejorar mensajes de error comunes
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Error de conexión: No se pudo conectar a Solana. Verifica tu conexión a internet.';
        } else if (err.message.includes('User rejected')) {
          errorMessage = 'Transacción cancelada por el usuario';
        } else if (err.message.includes('Wallet not connected')) {
          errorMessage = 'Wallet no conectado. Por favor conecta tu wallet.';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Fondos insuficientes para completar la transacción';
        } else if (err.message.includes('TransactionExpiredBlockheightExceededError') || err.message.includes('block height exceeded')) {
          errorMessage = 'La transacción expiró. Por favor intenta de nuevo. Esto puede ocurrir cuando hay demoras en la red.';
        } else if (err.message.includes('Signature')) {
          errorMessage = 'Error en la firma de la transacción. Por favor intenta de nuevo.';
        }
      }
      
      setError(errorMessage);
      
      // Mostrar notificación de error
      ;(window as any).addNotification?.({
        type: "error",
        title: "Error en tokenización",
        message: errorMessage,
        duration: 8000
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { tokenize, loading, error };
}