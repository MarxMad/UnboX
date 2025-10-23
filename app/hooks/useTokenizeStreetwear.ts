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
        
        // Verificar que estamos en devnet
        const isDevnet = connection?.rpcEndpoint?.includes('devnet');
        console.log('🌐 ¿Estamos en devnet?', isDevnet);
        
        if (!isDevnet) {
          console.warn('⚠️ ADVERTENCIA: No estamos en devnet!');
        }
    
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

    // Validar año antes de proceder
    if (params.year < 1990 || params.year > 2025) {
      throw new Error(`Año inválido: ${params.year}. Debe estar entre 1990 y 2024.`);
    }
    
    if (!publicKey || !connection) {
      throw new Error('Wallet no conectado');
    }

      // Verificar balance antes de proceder
      console.log('💰 Verificando balance...');
      const balance = await connection.getBalance(publicKey);
      console.log('Balance actual:', balance / LAMPORTS_PER_SOL, 'SOL');
      console.log('Balance en lamports:', balance);
      console.log('Network endpoint:', connection.rpcEndpoint);
      console.log('Wallet address:', publicKey.toString());
        
        // Calcular rent para todas las cuentas que vamos a crear
        const mintRent = await connection.getMinimumBalanceForRentExemption(0);
        const tokenAccountRent = await connection.getMinimumBalanceForRentExemption(0);
        const assetAccountRent = await connection.getMinimumBalanceForRentExemption(0);
        const totalRent = mintRent + tokenAccountRent + assetAccountRent;
        const estimatedFee = 5000; // Fee estimado de transacción
        const totalNeeded = totalRent + estimatedFee;
        
        console.log('📊 Cálculo de rent:');
        console.log('  - Mint rent:', mintRent / LAMPORTS_PER_SOL, 'SOL');
        console.log('  - Token account rent:', tokenAccountRent / LAMPORTS_PER_SOL, 'SOL');
        console.log('  - Asset account rent:', assetAccountRent / LAMPORTS_PER_SOL, 'SOL');
        console.log('  - Transaction fee:', estimatedFee / LAMPORTS_PER_SOL, 'SOL');
        console.log('  - Total needed:', totalNeeded / LAMPORTS_PER_SOL, 'SOL');
        console.log('  - Available:', balance / LAMPORTS_PER_SOL, 'SOL');
        
        if (balance < totalNeeded) {
          throw new Error(`Balance insuficiente: ${balance / LAMPORTS_PER_SOL} SOL. Necesitas al menos ${totalNeeded / LAMPORTS_PER_SOL} SOL para la transacción.`);
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
            return signedTxs as typeof txs;
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

      // No necesitamos rarityMap aquí ya que lo definimos más abajo

      // Obtener PDA del asset
      const [assetPda] = await getAssetPDA(publicKey, mint);
      console.log('🏠 Asset PDA calculado:', assetPda.toString());
      console.log('🔍 Seeds para PDA: owner=', publicKey.toString(), 'mint=', mint.toString());

      console.log('🔗 8. Obteniendo blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

          console.log('✍️ 9. Creando transacción manualmente...');
          console.log('📤 10. Construyendo transacción paso a paso...');

          // Crear transacción manualmente para tener control total
          const transaction = new Transaction();
          
          // Agregar blockhash y lastValidBlockHeight a la transacción
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;
          
          // Solo usar nuestro programa - el programa manejará todo internamente
          console.log('🔧 Usando solo nuestro programa...');

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
          
          // Crear el buffer de datos completo con serialización Borsh correcta
          // Borsh serialization: discriminator + strings (4 bytes length + data) + primitives
          const serializeString = (str: string) => {
            const strBuffer = Buffer.from(str, 'utf8');
            const lengthBuffer = Buffer.alloc(4);
            lengthBuffer.writeUInt32LE(strBuffer.length, 0);
            return Buffer.concat([lengthBuffer, strBuffer]);
          };
          
          // ESTRATEGIA HÍBRIDA: Solo datos esenciales en blockchain
          // Los datos completos se guardarán en Supabase después del mint
          const optimizedName = params.name.substring(0, 8); // Solo 8 caracteres para blockchain
          const optimizedSymbol = "UNBX"; // Símbolo fijo para todos los NFTs
          const optimizedBrand = params.brand.substring(0, 6); // Solo 6 caracteres
          const optimizedModel = (params.model || params.name).substring(0, 6); // Solo 6 caracteres
          const optimizedSize = params.size.substring(0, 4); // Solo 4 caracteres
          const optimizedCondition = params.condition.substring(0, 4); // Solo 4 caracteres
          
          // URI que apunta a Supabase para datos completos
          const shortUri = `https://unbox.app/nft/${mint.toString()}`; // URI que apunta a nuestra API
          
          // Serializar en el orden correcto según el IDL
          const dataBuffer = Buffer.concat([
            discriminator,                    // 8 bytes discriminator
            serializeString(optimizedName),    // string optimizado
            serializeString(optimizedSymbol),  // string optimizado
            serializeString(shortUri),        // string optimizado
            serializeString(optimizedBrand),   // string optimizado
            serializeString(optimizedModel),   // string optimizado
            serializeString(optimizedSize),    // string optimizado
            serializeString(optimizedCondition), // string optimizado
            yearBuffer,                       // u16 (2 bytes)
            rarityBuffer,                     // enum (1 byte)
          ]);
          
          console.log('📦 Datos serializados:', dataBuffer.toString('hex'));
          console.log('📏 Tamaño de datos:', dataBuffer.length, 'bytes');
          
          // Validar que los datos no sean demasiado grandes
          if (dataBuffer.length > 1232) { // Límite de instrucción de Solana
            throw new Error(`Datos demasiado grandes: ${dataBuffer.length} bytes (máximo 1232)`);
          }
          
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

          // Verificar el tamaño de la transacción completa
          const transactionSize = transaction.serialize({ requireAllSignatures: false }).length;
          console.log('📏 Tamaño de transacción completa:', transactionSize, 'bytes');
          
          if (transactionSize > 1232) {
            throw new Error(`Transacción demasiado grande: ${transactionSize} bytes (máximo 1232)`);
          }

          // Loggear las instrucciones generadas para depuración
          console.log('🔍 Instrucciones en la transacción:');
          transaction.instructions.forEach((ix, index) => {
            console.log(`Instrucción ${index + 1}:`);
            console.log(`  Program ID: ${ix.programId.toString()}`);
            console.log(`  Keys: ${ix.keys.map(k => k.pubkey.toString()).join(', ')}`);
            console.log(`  Data: ${ix.data.toString('hex')}`);
          });

          // Verificar que solo tenemos nuestra instrucción
          const ourProgramId = new PublicKey(idl.address);
          const ourInstructions = transaction.instructions.filter(ix => 
            ix.programId.equals(ourProgramId)
          );
          
          if (ourInstructions.length === 0) {
            throw new Error('❌ No se encontró la instrucción de nuestro programa en la transacción');
          }
          
          console.log('✅ Instrucción de nuestro programa encontrada');
          console.log(`📊 Total de instrucciones: ${transaction.instructions.length} (solo nuestro programa)`);

          // El mintKeypair también debe firmar la transacción
          console.log('✍️ Firmando con mint keypair...');
          console.log('🔑 Mint keypair public key:', mintKeypair.publicKey.toString());
          transaction.partialSign(mintKeypair);
          
          // Verificar que el mint keypair esté en los signers
          console.log('🔍 Signers después de partialSign:', transaction.signatures.map(s => s.publicKey.toString()));

          // Firmar y enviar la transacción
          console.log('✍️ Firmando transacción con wallet...');
          const signedTransaction = await signTransaction!(transaction);
          
          // Verificar todas las firmas
          console.log('🔍 Signers finales:', signedTransaction.signatures.map(s => s.publicKey.toString()));
          console.log('🔍 Signatures count:', signedTransaction.signatures.length);
          
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