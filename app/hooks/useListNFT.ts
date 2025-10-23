import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import idlData from '../idl/streetwear_tokenizer_updated.json';

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

      // Crear programa con IDL actualizado
      const programId = new PublicKey(idl.address);
      const provider = new AnchorProvider(connection, { publicKey, signTransaction } as any, {});
      const program = new Program(idl, programId, provider);

      console.log('🔧 Usando Anchor con IDL actualizado...');
      console.log('Program ID:', programId.toString());
      console.log('IDL address:', idl.address);
      console.log('IDL instructions:', Object.keys(program.methods));
      console.log('listNft method exists:', !!program.methods.listNft);

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

      // Usar Anchor para crear la instrucción
      console.log('🔧 Creando instrucción con Anchor...');
      console.log('📋 Parámetros para listNft:');
      console.log('  - priceInLamports:', priceInLamports);
      console.log('  - seller:', publicKey.toString());
      console.log('  - escrowAccount:', escrowPda.toString());
      console.log('  - nftMint:', nftMint);
      console.log('  - assetAccount:', assetPda.toString());
      
      const listInstruction = await program.methods
        .listNft(new BN(priceInLamports))
        .accounts({
          seller: publicKey,
          escrowAccount: escrowPda,
          nftMint: new PublicKey(nftMint),
          assetAccount: assetPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

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