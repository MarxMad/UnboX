import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  Keypair, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createInitializeMint2Instruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import { createNFTMetadata, mockUploadToIPFS, mockUploadMetadataToIPFS } from '../services/ipfs';

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

export function useSimpleMint() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenize = async (params: TokenizeParams) => {
    console.log('🚀 Iniciando minteo simplificado de NFT...');
    console.log('👛 Wallet:', publicKey?.toString());
    
    if (!publicKey || !connection) {
      throw new Error('Wallet no conectado');
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Subir imagen (mock por ahora)
      console.log('📸 1. Subiendo imagen...');
      const imageUri = await mockUploadToIPFS(params.image);
      console.log('✅ Imagen subida');

      // 2. Crear metadata
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

      // 3. Subir metadata
      console.log('📤 3. Subiendo metadata...');
      const uri = await mockUploadMetadataToIPFS(metadata);
      console.log('✅ Metadata subido');

      // 4. Crear mint keypair
      console.log('🔑 4. Generando mint keypair...');
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;
      console.log('Mint Address:', mint.toString());

      // 5. Obtener associated token account
      console.log('🏦 5. Obteniendo token account...');
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        publicKey
      );
      console.log('Token Account:', tokenAccount.toString());

      // 6. Obtener rent exempt balance para mint
      console.log('💰 6. Calculando rent...');
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      console.log('Rent para mint:', lamports / LAMPORTS_PER_SOL, 'SOL');

      // 7. Crear transacción
      console.log('📝 7. Creando transacción...');
      const transaction = new Transaction();

      // Instrucción 1: Crear cuenta para el mint
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Instrucción 2: Inicializar mint (NFT = supply de 1, decimals de 0)
      transaction.add(
        createInitializeMint2Instruction(
          mint,
          0, // 0 decimals para NFT
          publicKey, // mint authority
          publicKey, // freeze authority
          TOKEN_PROGRAM_ID
        )
      );

      // Instrucción 3: Crear associated token account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey, // payer
          tokenAccount, // ata
          publicKey, // owner
          mint, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      // Instrucción 4: Mintear 1 token (el NFT)
      transaction.add(
        createMintToInstruction(
          mint,
          tokenAccount,
          publicKey, // mint authority
          1, // cantidad = 1 para NFT
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // 8. Obtener blockhash reciente
      console.log('🔗 8. Obteniendo blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // 9. Firmar con mintKeypair
      console.log('✍️ 9. Firmando con mint keypair...');
      transaction.partialSign(mintKeypair);

      // 10. Enviar transacción (el wallet firmará automáticamente)
      console.log('📤 10. Enviando transacción...');
      console.log('⏳ Esperando confirmación del wallet...');
      
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log('✅ Transacción enviada:', signature);
      console.log('⏳ 11. Esperando confirmación en blockchain...');

      // 11. Confirmar transacción
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transacción falló: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('🎉 ¡NFT creado exitosamente!');
      console.log('📝 Signature:', signature);
      console.log('🎨 Mint:', mint.toString());
      console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      return {
        signature,
        mint: mint.toString(),
        assetPda: tokenAccount.toString(), // usar token account como "assetPda"
      };

    } catch (err: unknown) {
      console.error('❌ Error en minteo:', err);
      
      let errorMessage = 'Error al crear NFT';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Mejorar mensajes de error comunes
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Error de conexión: No se pudo conectar a Solana. Verifica tu conexión a internet o configura un RPC alternativo (ver SOLANA_RPC_SETUP.md)';
        } else if (err.message.includes('User rejected')) {
          errorMessage = 'Transacción cancelada por el usuario';
        } else if (err.message.includes('Wallet not connected')) {
          errorMessage = 'Wallet no conectado. Por favor conecta tu wallet.';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Fondos insuficientes. Necesitas al menos 0.01 SOL en Devnet para crear el NFT.';
        } else if (err.message.includes('Attempt to debit an account but found no record')) {
          errorMessage = 'Sin fondos en Devnet. Consigue SOL de prueba en https://faucet.solana.com/';
        }
      }
      
      setError(errorMessage);
      
      // Mostrar notificación de error
      ;(window as any).addNotification?.({
        type: "error",
        title: "Error al crear NFT",
        message: errorMessage,
        duration: 10000
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { tokenize, loading, error };
}

