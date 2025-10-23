import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import idlData from '../idl/streetwear_tokenizer.json';

const idl = idlData as any;

export function useListNFT() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listNFT = async (nftMint: string, price: number) => {
    if (!publicKey || !connection || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    // Validar parámetros
    if (!nftMint || nftMint.trim() === '') {
      throw new Error('NFT Mint address is required');
    }

    if (!price || isNaN(price) || price <= 0) {
      throw new Error('Valid price is required (must be greater than 0)');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Iniciando listado de NFT...');
      console.log('NFT Mint:', nftMint);
      console.log('Price:', price, 'SOL');
      console.log('Price type:', typeof price);
      console.log('Price is NaN:', isNaN(price));
      console.log('Price > 0:', price > 0);

      // Convertir precio a lamports
      const priceInLamports = Math.floor(price * 1e9);
      console.log('Price in lamports:', priceInLamports);
      console.log('Price in lamports is valid:', !isNaN(priceInLamports) && priceInLamports > 0);

      // Crear programa
      const programId = new PublicKey(idl.address);
      const provider = new AnchorProvider(connection, { publicKey, signTransaction } as any, {});
      const program = new Program(idl, programId, provider);

      // Obtener PDA del escrow
      const [escrowPda] = await PublicKey.findProgramAddress(
        [Buffer.from('escrow'), publicKey.toBuffer(), new PublicKey(nftMint).toBuffer()],
        programId
      );

      console.log('Escrow PDA:', escrowPda.toString());

      // Obtener PDA del asset
      const [assetPda] = await PublicKey.findProgramAddress(
        [Buffer.from('asset'), publicKey.toBuffer(), new PublicKey(nftMint).toBuffer()],
        programId
      );

      console.log('Asset PDA:', assetPda.toString());

      // Crear transacción
      const transaction = new Transaction();

      // Crear instrucción manual para evitar problemas de serialización
      console.log('🔧 Creando instrucción manual de list_nft...');
      
      // Discriminator para list_nft: [88, 221, 93, 166, 63, 220, 106, 232]
      const discriminator = Buffer.from([88, 221, 93, 166, 63, 220, 106, 232]);
      
      // Serializar el precio (u64 = 8 bytes)
      const priceBuffer = Buffer.alloc(8);
      priceBuffer.writeBigUInt64LE(BigInt(priceInLamports), 0);
      
      // Crear datos de la instrucción
      const instructionData = Buffer.concat([discriminator, priceBuffer]);
      
      console.log('📦 Datos de instrucción:', instructionData.toString('hex'));
      console.log('📏 Tamaño de datos:', instructionData.length, 'bytes');
      
      const listInstruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true }, // seller
          { pubkey: escrowPda, isSigner: false, isWritable: true }, // escrow_account
          { pubkey: new PublicKey(nftMint), isSigner: false, isWritable: false }, // nft_mint
          { pubkey: assetPda, isSigner: false, isWritable: true }, // asset_account
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
        ],
        programId: programId,
        data: instructionData,
      });

      transaction.add(listInstruction);

      // Obtener blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Firmar y enviar
      console.log('✍️ Firmando transacción...');
      const signedTransaction = await signTransaction(transaction);

      console.log('📤 Enviando transacción...');
      const tx = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log('⏳ Esperando confirmación...');
      const confirmation = await connection.confirmTransaction({
        signature: tx,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ NFT listado exitosamente!');
      console.log('📝 Transaction:', tx);
      console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

      return {
        signature: tx,
        escrowPda: escrowPda.toString(),
      };

    } catch (err: unknown) {
      console.error('❌ Error listing NFT:', err);

      let errorMessage = 'Error al listar NFT';

      if (err instanceof Error) {
        errorMessage = err.message;

        // Mejorar mensajes de error
        if (err.message.includes('AlreadyListed')) {
          errorMessage = 'Este NFT ya está listado para venta';
        } else if (err.message.includes('InvalidPrice')) {
          errorMessage = 'El precio debe ser mayor a 0';
        } else if (err.message.includes('User rejected')) {
          errorMessage = 'Transacción cancelada por el usuario';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Fondos insuficientes para completar la transacción';
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { listNFT, loading, error };
}