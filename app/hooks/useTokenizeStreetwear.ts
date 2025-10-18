import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  Keypair, 
  SystemProgram, 
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from '@solana/spl-token';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { useProgram } from './useProgram';
import { getAssetPDA } from '../config/program';
import { uploadImageToIPFS, uploadMetadataToIPFS, createNFTMetadata, mockUploadToIPFS, mockUploadMetadataToIPFS } from '../services/ipfs';
// Import the simplified IDL to avoid corruption issues
import idlData from '../idl/streetwear_tokenizer_simple.json';
const idl = idlData as any;

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
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenize = async (params: TokenizeParams) => {
    console.log('🚀 Iniciando tokenización con Anchor...');
    console.log('Wallet:', publicKey?.toString());
    console.log('Connection:', !!connection);
    console.log('Network:', connection?.rpcEndpoint);
    console.log('Program ID:', idl.address);
    
    // Debug: Verificar parámetros recibidos
    console.log('📋 Parámetros recibidos:', {
      name: params.name,
      brand: params.brand,
      model: params.model,
      size: params.size,
      condition: params.condition,
      year: params.year,
      rarity: params.rarity,
      image: params.image?.name
    });
    
    if (!publicKey || !connection) {
      throw new Error('Wallet no conectado');
    }

    // Verificar balance antes de proceder
    console.log('💰 Verificando balance...');
    const balance = await connection.getBalance(publicKey);
    console.log('Balance actual:', balance / LAMPORTS_PER_SOL, 'SOL');
    
    if (balance < 0.001 * LAMPORTS_PER_SOL) {
      throw new Error(`Balance insuficiente: ${balance / LAMPORTS_PER_SOL} SOL. Necesitas al menos 0.001 SOL para la transacción.`);
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📸 1. Subiendo imagen...');
      // Usar Pinata si las API keys están disponibles, sino usar mock
      const hasPinataKeys = process.env.NEXT_PUBLIC_PINATA_API_KEY && process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
      console.log('🔑 Pinata API Key presente:', !!process.env.NEXT_PUBLIC_PINATA_API_KEY);
      console.log('🔑 Pinata Secret Key presente:', !!process.env.NEXT_PUBLIC_PINATA_SECRET_KEY);
      console.log('📡 Usando Pinata real:', hasPinataKeys);
      
      const imageUri = hasPinataKeys 
        ? await uploadImageToIPFS(params.image)
        : await mockUploadToIPFS(params.image);
      console.log('✅ Imagen subida:', imageUri);

      console.log('📋 2. Creando metadata...');
      // Generar symbol automáticamente desde brand (máximo 10 caracteres)
      const symbol = params.brand.substring(0, 10).toUpperCase();
      
      // Crear descripción completa
      const description = `${params.brand} ${params.model || params.name} - ${params.condition} (${params.year})`;
      
      const metadata = createNFTMetadata(
        params.name,
        symbol,
        description,
        imageUri,
        {
          brand: params.brand,
          model: params.model || params.name,
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
      console.log('✅ Metadata subido:', uri);

      console.log('🔑 4. Generando mint keypair...');
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;
      console.log('Mint Address:', mint.toString());

      console.log('🏦 5. Obteniendo token account...');
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        publicKey
      );
      console.log('Token Account:', tokenAccount.toString());

      console.log('💰 6. Calculando rent...');
      const rent = await connection.getMinimumBalanceForRentExemption(0);
      console.log('Rent para mint:', rent / LAMPORTS_PER_SOL, 'SOL');

      console.log('📝 7. Creando transacción...');
      
      // Crear provider y programa de Anchor
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction: signTransaction!,
          signAllTransactions: async (txs) => {
            const signedTxs = [];
            for (const tx of txs) {
              const signed = await signTransaction!(tx);
              signedTxs.push(signed);
            }
            return signedTxs;
          }
        },
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          skipPreflight: false
        }
      );

      // Validar IDL antes de crear el programa
      console.log('🔍 Validando IDL...');
      console.log('IDL address:', idl.address);
      console.log('IDL instructions:', idl.instructions?.length);
      console.log('IDL completo:', JSON.stringify(idl, null, 2));
      
      if (!idl || !idl.address || !idl.instructions) {
        throw new Error('IDL inválido o incompleto');
      }
      
      console.log('🔧 Saltando Anchor por problemas de IDL, usando transacción manual...');
      
      // No usar Anchor, crear transacción manualmente

      // Mapear rarity a enum de Anchor
      const rarityMap: Record<string, any> = {
        'Common': { common: {} },
        'Uncommon': { uncommon: {} },
        'Rare': { rare: {} },
        'Epic': { epic: {} },
        'Legendary': { legendary: {} },
      };

      // Obtener PDA del asset
      const [assetPda] = await getAssetPDA(publicKey, mint);

      console.log('🔗 8. Obteniendo blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

          console.log('✍️ 9. Creando transacción manualmente...');
          console.log('📤 10. Construyendo transacción paso a paso...');

          // Crear transacción manualmente para tener control total
          const transaction = new Transaction();
          
          // Agregar blockhash y lastValidBlockHeight a la transacción
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;
          
          // 1. Crear instrucción para inicializar el mint
          console.log('🔧 Agregando instrucción de inicialización de mint...');
          const initMintIx = createInitializeMintInstruction(
            mint, // mint account
            0, // decimals (NFT = 0)
            publicKey, // mint authority
            publicKey // freeze authority
          );
          transaction.add(initMintIx);

          // 2. Crear instrucción para crear el token account
          console.log('🔧 Agregando instrucción de creación de token account...');
          const createTokenAccountIx = createAssociatedTokenAccountInstruction(
            publicKey, // payer
            tokenAccount, // associated token account
            publicKey, // owner
            mint // mint
          );
          transaction.add(createTokenAccountIx);

          // 3. Crear instrucción para mintear 1 token
          console.log('🔧 Agregando instrucción de mint...');
          const mintToIx = createMintToInstruction(
            mint, // mint
            tokenAccount, // destination
            publicKey, // authority
            1 // amount (1 NFT)
          );
          transaction.add(mintToIx);

          // 4. Crear instrucción personalizada manualmente (sin Anchor)
          console.log('🔧 Agregando instrucción de nuestro programa...');
          console.log('📋 Parámetros para tokenize_streetwear:', {
            name: params.name,
            symbol: symbol,
            uri: uri,
            brand: params.brand,
            model: params.model || params.name,
            size: params.size,
            condition: params.condition,
            year: params.year,
            rarity: params.rarity
          });
          
          // Crear la instrucción manualmente con datos serializados
          const programId = new PublicKey(idl.address);
          
          // Serializar los datos para tokenize_streetwear
          // Discriminator: [5, 52, 127, 166, 66, 28, 85, 41]
          const discriminator = Buffer.from([5, 52, 127, 166, 66, 28, 85, 41]);
          
          // Serializar los parámetros
          const nameBuffer = Buffer.from(params.name, 'utf8');
          const symbolBuffer = Buffer.from(symbol, 'utf8');
          const uriBuffer = Buffer.from(uri, 'utf8');
          const brandBuffer = Buffer.from(params.brand, 'utf8');
          const modelBuffer = Buffer.from(params.model || params.name, 'utf8');
          const sizeBuffer = Buffer.from(params.size, 'utf8');
          const conditionBuffer = Buffer.from(params.condition, 'utf8');
          
          // Serializar year como u16 (2 bytes)
          const yearBuffer = Buffer.alloc(2);
          yearBuffer.writeUInt16LE(params.year, 0);
          
          // Serializar rarity (1 byte: 0=Common, 1=Uncommon, 2=Rare, 3=Epic, 4=Legendary)
          const rarityMap: Record<string, number> = {
            'Common': 0,
            'Uncommon': 1,
            'Rare': 2,
            'Epic': 3,
            'Legendary': 4,
          };
          const rarityBuffer = Buffer.from([rarityMap[params.rarity] || 0]);
          
          // Crear el buffer de datos completo
          const dataBuffer = Buffer.concat([
            discriminator,
            Buffer.from([nameBuffer.length]), nameBuffer,
            Buffer.from([symbolBuffer.length]), symbolBuffer,
            Buffer.from([uriBuffer.length]), uriBuffer,
            Buffer.from([brandBuffer.length]), brandBuffer,
            Buffer.from([modelBuffer.length]), modelBuffer,
            Buffer.from([sizeBuffer.length]), sizeBuffer,
            Buffer.from([conditionBuffer.length]), conditionBuffer,
            yearBuffer,
            rarityBuffer,
          ]);
          
          console.log('📦 Datos serializados:', dataBuffer.toString('hex'));
          
          const instruction = new TransactionInstruction({
            keys: [
              { pubkey: publicKey, isSigner: true, isWritable: true }, // owner
              { pubkey: mint, isSigner: true, isWritable: true }, // mint
              { pubkey: tokenAccount, isSigner: false, isWritable: true }, // token_account
              { pubkey: assetPda, isSigner: false, isWritable: true }, // asset_account
              { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
              { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associated_token_program
              { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
              { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // rent
            ],
            programId: programId,
            data: dataBuffer,
          });
          
          transaction.add(instruction);

          // Loggear las instrucciones generadas para depuración
          console.log('🔍 Instrucciones en la transacción:');
          transaction.instructions.forEach((ix, index) => {
            console.log(`Instrucción ${index + 1}:`);
            console.log(`  Program ID: ${ix.programId.toString()}`);
            console.log(`  Keys: ${ix.keys.map(k => k.pubkey.toString()).join(', ')}`);
            console.log(`  Data: ${ix.data.toString('hex')}`);
          });

          // Verificar que nuestra instrucción esté presente
          const ourProgramId = new PublicKey(idl.address);
          const hasOurInstruction = transaction.instructions.some(ix => 
            ix.programId.equals(ourProgramId)
          );
          
          if (!hasOurInstruction) {
            throw new Error('❌ No se encontró la instrucción de nuestro programa en la transacción');
          }
          
          console.log('✅ Instrucción de nuestro programa encontrada');

          // Firmar y enviar la transacción
          console.log('✍️ Firmando transacción con wallet...');
          const signedTransaction = await signTransaction!(transaction);
          
          console.log('📤 Enviando transacción firmada...');
          const tx = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });

      console.log('⏳ Esperando confirmación del wallet...');
      console.log('✅ Transacción enviada:', tx);
      console.log('⏳ 11. Esperando confirmación en blockchain...');

      console.log('✅ NFT Tokenizado exitosamente!');
      console.log('📝 Transaction:', tx);
      console.log('🎨 Mint Address:', mint.toString());
      console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

      return {
        signature: tx,
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