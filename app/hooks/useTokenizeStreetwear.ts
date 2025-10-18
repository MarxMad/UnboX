import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  Keypair, 
  SystemProgram, 
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { useProgram } from './useProgram';
import { getAssetPDA } from '../config/program';
import { uploadImageToIPFS, uploadMetadataToIPFS, createNFTMetadata, mockUploadToIPFS, mockUploadMetadataToIPFS } from '../services/ipfs';
import idl from '../idl/streetwear_tokenizer.json';

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

      const program = new Program(idl as any, new PublicKey(idl.address), provider);

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

          console.log('✍️ 9. Creando transacción con nuestro programa...');
          console.log('📤 10. Enviando transacción...');

          // Crear y enviar transacción usando nuestro programa personalizado
          const tx = await program.methods
            .tokenize_streetwear(
              params.name,
              metadata.symbol,
              uri,
              params.brand,
              params.model,
              params.size,
              params.condition,
              params.year,
              rarityMap[params.rarity] || { common: {} }
            )
            .accounts({
              owner: publicKey,
              mint: mint,
              tokenAccount: tokenAccount,
              assetAccount: assetPda,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: SYSVAR_RENT_PUBKEY,
            })
            .signers([mintKeypair])
            .rpc({
              commitment: 'confirmed',
        skipPreflight: false,
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